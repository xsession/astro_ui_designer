import assert from 'node:assert/strict';
import { parseQuad, serializeQuad, gradientCss, shadowCss, filterCss, transformCss, transitionCss, ensureCssNode, styleTarget, customPropertyName } from '../standalone/js/css-tools.js';
import { createSampleProject, allNodes } from '../standalone/js/model.js';
import { generateAstroProject } from '../standalone/js/astro-exporter.js';

assert.deepEqual(parseQuad('8px'),['8px','8px','8px','8px']);
assert.deepEqual(parseQuad('8px 12px'),['8px','12px','8px','12px']);
assert.equal(serializeQuad(['8px','12px','8px','12px']),'8px 12px');
assert.match(gradientCss({type:'linear',angle:45,colorA:'#000',colorB:'#fff'}),/linear-gradient\(45deg/);
assert.match(shadowCss({x:0,y:8,blur:24,spread:0,color:'#000'}),/0px 8px 24px 0px #000/);
assert.match(filterCss({blur:4,brightness:110,contrast:100,saturate:80,hue:0,grayscale:0,sepia:0}),/blur\(4px\).*brightness\(110%\).*saturate\(80%\)/);
assert.equal(transformCss({x:10,y:20,rotate:15,scaleX:1.2,scaleY:1}), 'translate(10px, 20px) rotate(15deg) scale(1.2, 1)');
assert.equal(transitionCss({property:'opacity',duration:180,easing:'ease-out',delay:20}), 'opacity 180ms ease-out 20ms');
assert.equal(customPropertyName('brand color'),'--brand-color');

const project=createSampleProject();
const node=allNodes(project.pages[0].root).find(n=>n.type==='button') || project.pages[0].root.children[0];
ensureCssNode(node);
styleTarget(node,'base','hover').backgroundColor='#111827';
styleTarget(node,'base','focusVisible').outline='2px solid #60a5fa';
node.cssVariables['--local-accent']='#f97316';
const files=generateAstroProject(project);
const css=files['src/styles/global.css'];
assert.match(css,/--local-accent:\s*#f97316;/);
assert.match(css,new RegExp(`\\.ui-${node.id}\\:hover`));
assert.match(css,/background-color:\s*#111827;/);
assert.match(css,/focus-visible/);
assert.match(css,/outline:\s*2px solid #60a5fa/);
console.log('css-tools.test OK');
