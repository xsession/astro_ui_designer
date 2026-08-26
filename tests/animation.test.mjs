import assert from 'node:assert/strict';
import { createNode, createProject } from '../standalone/js/model.js';
import { ensureAnimation, createAnimationTrack, addAnimationKeyframe, moveAnimationKeyframe, removeAnimationKeyframe, applyAnimationPreset, resolveAnimationEngine, compiledKeyframes, generateAnimationCss, generateAnimationJs, animationRuntimePayload, validateAnimation } from '../standalone/js/animation.js';
import { generateAstroProject } from '../standalone/js/astro-exporter.js';

const n=createNode('card');
const a=ensureAnimation(n);
assert.equal(a.engine,'auto'); assert.equal(a.trigger,'manual'); assert.equal(a.duration,500);
assert.equal(resolveAnimationEngine(a),'waapi','manual auto uses WAAPI');
a.trigger='hover';assert.equal(resolveAnimationEngine(a),'css','hover auto uses CSS');

assert.equal(applyAnimationPreset(n,'fadeUp'),true);
assert.equal(n.timeline.tracks.length,2); assert.equal(n.timeline.duration,520);
const opacity=n.timeline.tracks.find(t=>t.property==='opacity');assert.ok(opacity);
const mid=addAnimationKeyframe(n,opacity.id,.5,'.4');assert.equal(mid.at,.5);assert.equal(opacity.keyframes.length,3);
assert.equal(moveAnimationKeyframe(n,opacity.id,mid.id,.6),true);assert.equal(opacity.keyframes.find(k=>k.id===mid.id).at,.6);
assert.equal(removeAnimationKeyframe(n,opacity.id,mid.id),true);assert.equal(opacity.keyframes.length,2);
const frames=compiledKeyframes(n.timeline);assert.equal(frames.length,2);assert.equal(frames[0].opacity,'0');assert.equal(frames[1].opacity,'1');

n.timeline.engine='css';n.timeline.trigger='hover';n.timeline.delay=120;n.timeline.iterations=2;n.timeline.direction='alternate';
let css=generateAnimationCss(n,'.demo');
assert.ok(css.includes('@keyframes ui-animation-'));assert.ok(css.includes('.demo:hover'));assert.ok(css.includes('animation-delay: 120ms'));assert.ok(css.includes('animation-direction: alternate'));assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('animation: none !important'));
n.timeline.trigger='scroll';n.timeline.scroll.timeline='view';css=generateAnimationCss(n,'.demo');assert.ok(css.includes('animation-timeline: view(block)'));assert.ok(css.includes('animation-duration: 1ms'));

n.timeline.engine='waapi';n.timeline.trigger='click';let js=generateAnimationJs(n,"document.querySelector('.demo')");assert.ok(js.includes('.animate(keyframes, options)'));assert.ok(js.includes("addEventListener('click'"));assert.ok(js.includes('prefers-reduced-motion'));
const payload=animationRuntimePayload(n);assert.equal(payload.engine,'waapi');assert.equal(payload.trigger,'click');assert.equal(payload.keyframes.length,2);
assert.equal(validateAnimation(n).length,0);
n.timeline.engine='css';n.timeline.trigger='click';assert.ok(validateAnimation(n).some(i=>i.code==='ANIM05'));

const extra=createAnimationTrack(n,'borderRadius');extra.keyframes[0].value='0px';extra.keyframes[1].value='24px';assert.equal(n.timeline.tracks.length,3);
const p=createProject();n.timeline.engine='waapi';n.timeline.trigger='click';p.pages[0].root.children.push(n);const files=generateAstroProject(p);
assert.ok(files['src/scripts/ui-animation-definitions.ts'].includes(n.id));assert.ok(files['src/scripts/ui-runtime.ts'].includes('uiAnimationDefinitions'));assert.ok(files['src/pages/index.astro'].includes('data-ui-animation-id'));

const cssNode=createNode('button');applyAnimationPreset(cssNode,'scaleIn');cssNode.timeline.engine='css';cssNode.timeline.trigger='load';p.pages[0].root.children.push(cssNode);const files2=generateAstroProject(p);assert.ok(files2['src/styles/global.css'].includes(`ui-animation-${cssNode.id}`));
console.log('animation.test: OK (model, presets, keyframes, CSS, WAAPI, exporter)');
