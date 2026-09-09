#!/usr/bin/env python3
"""check_drawio_overlaps.py v2 — deterministic overlap/collision checker for draw.io diagrams.

Checks (exit code = number of diagrams with FAILURES, capped at 99; 0 = clean;
warnings are reported but do not affect the exit code):

  BOX-ON-BOX        two vertex rectangles intersect (containment is legal layout).
  ARROW-ON-BOX      an edge segment passes through a box that is NOT one of the
                    edge's own endpoints and NOT a container that holds an endpoint.
  LABEL-OVER-BOX    an edge label's text rectangle overlaps a box. IMPORTANT: endpoint
                    boxes ARE included — a label spilling onto the box it connects to
                    means the gap is too small for the label (the "cramped gap" defect).
                    Container backgrounds are excluded (labels normally sit on them).
  ARROW-TO-ARROW    two edges that share no endpoint box run closer than 6 px
                    (crossing = 0 px, touching = a defect). 6-12 px is a warning.
                    Points within 12 px of a segment's endpoints (arrowhead zones)
                    are ignored.
  LABEL-COVERS-ARROW an edge label's opaque background sits within 4 px of
                    another edge's line (the label would hide part of that arrow).
  ARROWHEAD-FUSION  an edge shorter than ~18 px: two ~8 px arrowheads fill the
                    whole span and render as a blob overlapping both endpoints.
  OFF-PAGE          any content extending past the page rectangle.

Geometry model (why it differs from a naive center-to-center reading):
  - Vertex rectangles use absolute coordinates (parent offsets accumulated).
  - Edge anchors honor explicit exitX/exitY/entryX/entryY pins from the edge style
    (fraction of box width/height from top-left). These make draw.io's routing
    deterministic. Without pins, the box-border exit point toward the other end
    is used (draw.io auto-connects there); if even that can't be resolved, the
    point is dropped.
  - Waypoints are read from <Array as="points"><mxPoint .../></Array> inside
    mxGeometry (NOT direct children of mxGeometry).
  - orthogonalEdgeStyle edges WITHOUT waypoints are approximated as a midpoint
    elbow (draw.io's real corner positions can differ, but the approximation
    catches the same defect classes).
  - The edge label is assumed at 50% of the TOTAL path length (draw.io default)
    with an opaque background. Width = widest line (multi-line labels do NOT
    render as one long line); height = 1.3 * font size per line.
  - Label text width: PIL Arial at 2x if available, else 5.2 px/char * fs/12.

Usage:  python check_drawio_overlaps.py diagram.drawio [more.drawio ...]
Deps:   stdlib only + optional Pillow.
"""
import re
import sys
import xml.etree.ElementTree as ET

try:
    from PIL import ImageFont
    _FONT_CACHE = {}
    def _font(fs):
        if fs not in _FONT_CACHE:
            try:
                _FONT_CACHE[fs] = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(fs * 2))
            except Exception:
                try:
                    _FONT_CACHE[fs] = ImageFont.truetype("arial.ttf", int(fs * 2))
                except Exception:
                    _FONT_CACHE[fs] = None
        return _FONT_CACHE[fs]
    def text_width(text, font_size):
        f = _font(font_size)
        if f is None:
            return len(text) * 5.2 * font_size / 12.0
        return f.getlength(text) / 2.0
except Exception:
    def text_width(text, font_size):
        return len(text) * 5.2 * font_size / 12.0


def decode(v):
    if not v:
        return ""
    v = (v.replace("&#xa;", "\n").replace("&#10;", "\n")
          .replace("&lt;br&gt;", "\n").replace("&amp;", "&")
          .replace("&lt;", "<").replace("&gt;", ">"))
    return re.sub(r"<[^>]+>", "", v)


def _frac(style, name, default):
    m = re.search(name + r"=([\d.]+)", style or "")
    return float(m.group(1)) if m else default


def load(path):
    root = ET.parse(path).getroot()
    model = root.find(".//mxGraphModel")
    page_w = float(model.get("pageWidth", 0)) if model is not None else 0
    page_h = float(model.get("pageHeight", 0)) if model is not None else 0

    cells = {}
    for c in root.iter("mxCell"):
        cid = c.get("id")
        if cid:
            cells[cid] = c
    parent = {cid: c.get("parent") for cid, c in cells.items()}

    def abspos(cid):
        x = y = 0.0
        cur = cid
        seen = set()
        while cur and cur in cells and cur not in seen:
            seen.add(cur)
            g = cells[cur].find("mxGeometry")
            if g is None:
                break
            x += float(g.get("x", 0))
            y += float(g.get("y", 0))
            cur = parent.get(cur)
        return x, y

    boxes = {}
    for cid, c in cells.items():
        if c.get("vertex") != "1":
            continue
        st = c.get("style") or ""
        if "shape=umlActor" in st or st.startswith("text"):
            continue
        g = c.find("mxGeometry")
        if g is None or "width" not in g.attrib:
            continue
        w, h = float(g.get("width", 0)), float(g.get("height", 0))
        if w < 8 or h < 8:
            continue
        ax, ay = abspos(cid)
        boxes[cid] = {"id": cid, "x": ax, "y": ay, "x2": ax + w, "y2": ay + h,
                      "w": w, "h": h, "txt": decode(c.get("value"))[:50]}

    # containers: any box that geometrically contains at least one other box
    containers = set()
    for a in boxes.values():
        for b in boxes.values():
            if a["id"] == b["id"]:
                continue
            if (a["x"] <= b["x"] + 1 and a["y"] <= b["y"] + 1 and
                    a["x2"] >= b["x2"] - 1 and a["y2"] >= b["y2"] - 1):
                containers.add(a["id"])

    def anchor(b, ex, ey):
        return (b["x"] + ex * b["w"], b["y"] + ey * b["h"])

    def border_point(b, dx, dy):
        """Point where the ray from the box center toward (dx,dy) exits the box
        border — used for UNPINNED endpoints (draw.io auto-connects there)."""
        cx, cy = b["x"] + b["w"] / 2, b["y"] + b["h"] / 2
        tx = (b["w"] / 2.0) / abs(dx) if dx != 0 else float("inf")
        ty = (b["h"] / 2.0) / abs(dy) if dy != 0 else float("inf")
        t = min(tx, ty)
        if t == float("inf") or t == 0:
            return (cx, cy)
        return (cx + t * dx, cy + t * dy)

    def edge_segments(e):
        """Rendered path of the edge as a list of (x1,y1,x2,y2), honoring
        explicit exit/entry pins and waypoints. Unpinned endpoints fall back to
        the box-border exit point toward the next path point (draw.io behavior)."""
        g = e.find("mxGeometry")
        pts = []
        if g is not None:
            for ch in g.iter():  # includes <Array as="points"><mxPoint .../></Array>
                if ch.tag == "mxPoint":
                    pts.append((float(ch.get("x", 0)), float(ch.get("y", 0))))
        st = e.get("style") or ""
        src, tgt = e.get("source"), e.get("target")
        P = []
        if src in boxes:
            b = boxes[src]
            has_pin = re.search(r"exit[XY]=", st)
            if has_pin:
                P.append(anchor(b, _frac(st, "exitX", 0.5), _frac(st, "exitY", 0.5)))
            else:
                toward = pts[0] if pts else (boxes[tgt]["x"] + boxes[tgt]["w"]/2,
                                             boxes[tgt]["y"] + boxes[tgt]["h"]/2) if tgt in boxes else None
                if toward:
                    cx, cy = b["x"] + b["w"]/2, b["y"] + b["h"]/2
                    P.append(border_point(b, toward[0]-cx, toward[1]-cy))
        P += pts
        if tgt in boxes:
            b = boxes[tgt]
            has_pin = re.search(r"entry[XY]=", st)
            if has_pin:
                P.append(anchor(b, _frac(st, "entryX", 0.5), _frac(st, "entryY", 0.5)))
            else:
                toward = pts[-1] if pts else (boxes[src]["x"] + boxes[src]["w"]/2,
                                              boxes[src]["y"] + boxes[src]["h"]/2) if src in boxes else None
                if toward:
                    cx, cy = b["x"] + b["w"]/2, b["y"] + b["h"]/2
                    P.append(border_point(b, toward[0]-cx, toward[1]-cy))
        segs = [(P[i][0], P[i][1], P[i+1][0], P[i+1][1]) for i in range(len(P) - 1)]
        if ("orthogonalEdgeStyle" in st and len(segs) == 1 and src in boxes and tgt in boxes):
            # no waypoints: approximate draw.io's orthogonal routing with a
            # midpoint elbow
            x1, y1, x2, y2 = segs[0]
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            if abs(x2 - x1) >= abs(y2 - y1):
                segs = [(x1, y1, mx, y1), (mx, y1, mx, y2), (mx, y2, x2, y2)]
            else:
                segs = [(x1, y1, x1, my), (x1, my, x2, my), (x2, my, x2, y2)]
        return segs, (src, tgt)

    edges = []
    for cid, c in cells.items():
        if c.get("edge") != "1":
            continue
        segs, refs = edge_segments(c)
        m = re.search(r"fontSize=(\d+)", c.get("style") or "")
        edges.append({"id": cid, "segs": segs, "lbl": decode(c.get("value")).strip(),
                      "fs": int(m.group(1)) if m else 8, "refs": refs})
    return boxes, containers, edges, page_w, page_h


def seg_box_overlap(seg, b, pad=4, n=80):
    x1, y1, x2, y2 = seg
    inside = 0
    for k in range(n + 1):
        x = x1 + (x2 - x1) * k / n
        y = y1 + (y2 - y1) * k / n
        if b["x"] + pad < x < b["x2"] - pad and b["y"] + pad < y < b["y2"] - pad:
            inside += 1
    return inside / n


def rect_overlap(lr, b):
    ox = min(lr[2], b["x2"]) - max(lr[0], b["x"])
    oy = min(lr[3], b["y2"]) - max(lr[1], b["y"])
    return (ox, oy) if (ox > 0 and oy > 0) else (0, 0)


def rect_clearance(lr, b):
    lx1, ly1, lx2, ly2 = lr
    dx = max(lx1 - b["x2"], 0, b["x"] - lx2)
    dy = max(ly1 - b["y2"], 0, b["y"] - ly2)
    return (dx * dx + dy * dy) ** 0.5


def _pt_seg_dist(px, py, s):
    x1, y1, x2, y2 = s
    dx, dy = x2 - x1, y2 - y1
    L2 = dx * dx + dy * dy
    t = 0 if L2 == 0 else max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / L2))
    cx, cy = x1 + t * dx, y1 + t * dy
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5


def seg_seg_min(s1, s2, endpoint_excl=12, n=24):
    """Min distance between two segments, ignoring points within endpoint_excl
    px of either segment's endpoints (arrowhead / connection zones)."""
    best = 1e9
    for i in range(1, n):
        for j in range(1, n):
            p1 = (s1[0] + (s1[2] - s1[0]) * i / n, s1[1] + (s1[3] - s1[1]) * i / n)
            p2 = (s2[0] + (s2[2] - s2[0]) * j / n, s2[1] + (s2[3] - s2[1]) * j / n)
            # distance of p1 to s1 endpoints and p2 to s2 endpoints
            d1a = ((p1[0]-s1[0])**2 + (p1[1]-s1[1])**2) ** 0.5
            d1b = ((p1[0]-s1[2])**2 + (p1[1]-s1[3])**2) ** 0.5
            d2a = ((p2[0]-s2[0])**2 + (p2[1]-s2[1])**2) ** 0.5
            d2b = ((p2[0]-s2[2])**2 + (p2[1]-s2[3])**2) ** 0.5
            if min(d1a, d1b) < endpoint_excl or min(d2a, d2b) < endpoint_excl:
                continue
            d = ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5
            best = min(best, d)
    return best


def rect_seg_gap(lr, s, n=24):
    """Min distance between a rectangle (x1,y1,x2,y2) and a segment, 0 if the
    segment crosses the rectangle."""
    x1, y1, x2, y2 = lr
    sx1, sy1, sx2, sy2 = s
    best = 1e9
    for k in range(n + 1):
        px = sx1 + (sx2 - sx1) * k / n
        py = sy1 + (sy2 - sy1) * k / n
        dx = max(x1 - px, 0, px - x2)
        dy = max(y1 - py, 0, py - y2)
        d = (dx * dx + dy * dy) ** 0.5 if (dx or dy) else 0.0
        best = min(best, d)
    return best


def check(path):
    fails, warns = [], []
    boxes, containers, edges, page_w, page_h = load(path)

    # 0. off-page
    for b in boxes.values():
        if b["x"] < -1 or b["y"] < -1 or (page_w and b["x2"] > page_w + 1) or (page_h and b["y2"] > page_h + 1):
            fails.append(f"OFF-PAGE: '{b['txt']}' extends past the page rectangle")

    # 1. box-on-box
    blist = list(boxes.values())
    for i in range(len(blist)):
        for j in range(i + 1, len(blist)):
            a, b = blist[i], blist[j]
            ox = min(a["x2"], b["x2"]) - max(a["x"], b["x"])
            oy = min(a["y2"], b["y2"]) - max(a["y"], b["y"])
            if ox > 2 and oy > 2:
                contains = (b["x"] >= a["x"] - 1 and b["y"] >= a["y"] - 1 and
                            b["x2"] <= a["x2"] + 1 and b["y2"] <= a["y2"] + 1) or \
                           (a["x"] >= b["x"] - 1 and a["y"] >= b["y"] - 1 and
                            a["x2"] <= b["x2"] + 1 and a["y2"] <= b["y2"] + 1)
                if not contains:
                    fails.append(
                        f"BOX-ON-BOX: '{a['txt']}' <> '{b['txt']}'  (intersect {ox:.0f}x{oy:.0f}px)")

    def endpoint_skip(e):
        """Boxes an edge may legally cross: its own endpoints and any box that
        geometrically contains an endpoint (container holding the endpoint)."""
        skip = set()
        for ref in e["refs"]:
            if not ref or ref not in boxes:
                continue
            skip.add(ref)
            rb = boxes[ref]
            for bid, bb in boxes.items():
                if bid == ref:
                    continue
                if (bb["x"] <= rb["x"] + 1 and bb["y"] <= rb["y"] + 1 and
                        bb["x2"] >= rb["x2"] - 1 and bb["y2"] >= rb["y2"] - 1):
                    skip.add(bid)
        return skip

    # 2. arrow-on-box
    for e in edges:
        skip = endpoint_skip(e)
        for seg in e["segs"]:
            for b in boxes.values():
                if b["id"] in skip:
                    continue
                frac = seg_box_overlap(seg, b)
                if frac > 0.08:
                    fails.append(
                        f"ARROW-ON-BOX: edge '{e['lbl'] or e['id']}' crosses '{b['txt']}' (~{frac*100:.0f}% of span)")

    # 3. label-over-box — endpoint boxes INCLUDED (cramped-gap defect);
    #    container backgrounds EXCLUDED (labels normally sit on them).
    #    draw.io places the label at 50% of the TOTAL path length.
    def path_mid(segs):
        total = sum(((s[0]-s[2])**2 + (s[1]-s[3])**2) ** 0.5 for s in segs)
        half = total / 2
        acc = 0
        for s in segs:
            L = ((s[0]-s[2])**2 + (s[1]-s[3])**2) ** 0.5
            if acc + L >= half and L > 0:
                t = (half - acc) / L
                return (s[0] + (s[2]-s[0]) * t, s[1] + (s[3]-s[1]) * t)
            acc += L
        s = segs[-1]
        return (s[2], s[3])

    for e in edges:
        if not e["lbl"] or not e["segs"]:
            continue
        mx, my = path_mid(e["segs"])
        lines = e["lbl"].split("\n")
        w = max(text_width(l, e["fs"]) for l in lines) if lines else 0
        h = e["fs"] * 1.3 * len(lines)
        lr = (mx - w / 2, my - h / 2, mx + w / 2, my + h / 2)
        for b in boxes.values():
            if b["id"] in containers:
                continue
            ox, oy = rect_overlap(lr, b)
            if ox > 1 and oy > 1:
                fails.append(
                    f"LABEL-OVER-BOX: label '{e['lbl']}' over '{b['txt']}'  ({ox:.0f}x{oy:.0f}px)")
            elif ox > 1 or oy > 1:
                c = rect_clearance(lr, b)
                if c < 8:
                    warns.append(
                        f"LABEL-TIGHT: label '{e['lbl']}' {c:.1f}px from '{b['txt']}'")
        # the label background is opaque: it must not cover ANOTHER edge's line
        for o in edges:
            if o is e or not o["segs"]:
                continue
            d = min(rect_seg_gap(lr, s) for s in o["segs"])
            if d < 4:
                fails.append(
                    f"LABEL-COVERS-ARROW: label '{e['lbl'][:30]}' covers line of edge {o['id']} ({d:.1f}px)")
    # 4. arrow-to-arrow (pairs sharing an endpoint box are legal fan-outs)
    for i in range(len(edges)):
        for j in range(i + 1, len(edges)):
            a, b = edges[i], edges[j]
            if not a["segs"] or not b["segs"]:
                continue
            if a["refs"][0] in b["refs"] or a["refs"][1] in b["refs"]:
                continue
            d = min(seg_seg_min(s1, s2) for s1 in a["segs"] for s2 in b["segs"])
            who_a = f"'{a['lbl'] or a['id']}'"
            who_b = f"'{b['lbl'] or b['id']}'"
            if d < 6:
                fails.append(f"ARROW-TO-ARROW: {who_a} and {who_b} {d:.1f}px apart (touching/crossing)")
            elif d < 12:
                warns.append(f"ARROW-CLOSE: {who_a} and {who_b} {d:.1f}px apart")
    # 5. arrowhead fusion: any edge shorter than ~18 px (two ~8 px heads)
    #    renders as a blob that visually overlaps both endpoint boxes
    for e in edges:
        if not e["segs"]:
            continue
        L = sum(((s[2]-s[0])**2 + (s[3]-s[1])**2) ** 0.5 for s in e["segs"])
        if L < 18:
            fails.append(f"ARROWHEAD-FUSION: edge {e['id']} only {L:.0f}px long — heads overlap both endpoint boxes")

    return fails, warns


def main():
    bad = 0
    for path in sys.argv[1:]:
        fails, warns = check(path)
        if fails:
            bad += 1
            print(f"[FAIL] {path}: {len(fails)} failure(s), {len(warns)} warning(s)")
            for p in fails:
                print(f"   - {p}")
            for p in warns:
                print(f"   ~ {p}")
        elif warns:
            print(f"[WARN] {path}: no failures, {len(warns)} warning(s)")
            for p in warns:
                print(f"   ~ {p}")
        else:
            print(f"[OK]   {path}: no overlaps detected")
    print(f"\n{'FAILED' if bad else 'CLEAN'}: {bad}/{len(sys.argv)-1} diagram(s) with failures")
    sys.exit(min(bad, 99))


if __name__ == "__main__":
    main()
