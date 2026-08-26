export const uiAnimationDefinitions = {
  "button-t8srmqf-1q": {
    "engine": "waapi",
    "trigger": "click",
    "keyframes": [
      {
        "offset": 0,
        "opacity": "0",
        "transform": "scale(.92)"
      },
      {
        "offset": 1,
        "opacity": "1",
        "transform": "scale(1)"
      }
    ],
    "options": {
      "duration": 420,
      "delay": 0,
      "easing": "cubic-bezier(.2,.8,.2,1)",
      "iterations": 1,
      "direction": "normal",
      "fill": "both"
    },
    "playbackRate": 1,
    "reducedMotion": "shorten",
    "scroll": {
      "timeline": "view",
      "source": "nearest",
      "axis": "block",
      "rangeStart": "entry 0%",
      "rangeEnd": "cover 100%"
    }
  }
} as const;
