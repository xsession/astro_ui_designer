import fs from 'node:fs';
import path from 'node:path';
import { createSampleProject, createNode } from '../standalone/js/model.js';
import { generateAstroProject } from '../standalone/js/astro-exporter.js';
import { applyAnimationPreset } from '../standalone/js/animation.js';
import { createZip } from '../standalone/js/zip.js';
import { ensureStorybookProject, createComponentStory, addStoryStep, addStoryAssertion } from '../standalone/js/storybook-cleanroom.js';

const project=createSampleProject();
const compRoot=createNode('card',{name:'InfoPanelRoot'});
compRoot.children.push(createNode('heading',{props:{text:'Title',level:'3'},bindings:{text:'props.title'}}));
compRoot.children.push(createNode('slot',{props:{name:''}}));
project.components.push({id:'demo-info-panel',name:'InfoPanel',filename:'InfoPanel.astro',description:'Demo reusable component',props:[{name:'title',type:'string',default:'Information'}],root:compRoot});
ensureStorybookProject(project);
const infoDef=project.components.find(c=>c.id==='demo-info-panel');
const primaryStory=createComponentStory(infoDef,'Primary',project);primaryStory.args.title='Information';primaryStory.tags=['stable'];primaryStory.parameters.a11y.mode='error';addStoryStep(primaryStory,'wait','',1);addStoryAssertion(primaryStory,'visible',compRoot.id,true);
const longStory=createComponentStory(infoDef,'Long title',project);longStory.args.title='A deliberately longer component title';longStory.viewport='mobile';
const inst=createNode('componentInstance',{name:'InfoPanelInstance',props:{definitionId:'demo-info-panel',propValues:{title:'Reusable component'}}});
inst.children.push(createNode('text',{props:{text:'This content is passed through the default Astro slot.'}}));
applyAnimationPreset(inst,'fadeUp');inst.timeline.engine='css';inst.timeline.trigger='hover';inst.timeline.reducedMotion='disable';
project.pages[0].root.children.push(inst);
const animatedButton=createNode('button',{name:'WaapiDemoButton',props:{text:'Animate with JavaScript'}});applyAnimationPreset(animatedButton,'scaleIn');animatedButton.timeline.engine='waapi';animatedButton.timeline.trigger='click';animatedButton.timeline.reducedMotion='shorten';project.pages[0].root.children.push(animatedButton);
const files=generateAstroProject(project);
const out=path.resolve('examples/generated-astro');fs.rmSync(out,{recursive:true,force:true});
for(const [name,data] of Object.entries(files)){const fp=path.join(out,name);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,data instanceof Uint8Array?data:String(data));}
fs.writeFileSync('astro-output-sample.zip',createZip(files));
console.log(`Generated ${Object.keys(files).length} files`);
