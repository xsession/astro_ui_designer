import assert from 'node:assert/strict';
import { createProject, createNode, migrateProject } from '../standalone/js/model.js';
import {
  ensureStorybookProject, ensureComponentStories, createComponentStory, duplicateComponentStory,
  createStoryMatrix, inferControls, setStoryArg, materializeStoryComponent, addStoryStep,
  addStoryAssertion, filterStories, createStoryResult, setStoryResult, overallStatus,
  saveVisualBaseline, compareVisualBaseline, generateAutodocs, exportPortableStoryManifest,
  exportStorybookCsf, exportComponentManifest, storybookSummary, STORY_VIEWPORTS, STORY_BACKGROUNDS
} from '../standalone/js/storybook-cleanroom.js';

const project=migrateProject(createProject('Component Lab Test'));
const root=createNode('card',{name:'ButtonCard'});
const title=createNode('heading',{name:'Title',props:{text:'Default title',level:'3'},bindings:{text:'props.title'}});
const button=createNode('button',{name:'ActionButton',props:{text:'Run'},bindings:{disabled:'props.disabled'}});
root.children.push(title,button);
const component={
  id:'component-button-card',name:'ButtonCard',filename:'ButtonCard.astro',description:'A test card.',
  props:[
    {name:'title',type:'string',default:'Hello',description:'Card title'},
    {name:'disabled',type:'boolean',default:false},
    {name:'count',type:'number',default:3},
    {name:'tone',type:'enum',default:'primary',options:['primary','danger']},
    {name:'accentColor',type:'string',default:'#ff0000'}
  ],root
};
project.components.push(component);
const sb=ensureStorybookProject(project);
assert.equal(project.schemaVersion,7);
assert.equal(sb.settings.defaultViewport,'desktop');
assert.ok(STORY_VIEWPORTS.some(v=>v.id==='mobile'));
assert.ok(STORY_BACKGROUNDS.some(v=>v.id==='dark'));
ensureComponentStories(component,project);
assert.deepEqual(component.storyMeta.tags,['dev','test','autodocs']);

const story=createComponentStory(component,'Primary',project);
assert.equal(story.args.title,'Hello');
assert.equal(story.args.disabled,false);
assert.equal(story.args.count,3);
story.tags=['stable'];
story.argTypes.count={min:0,max:10,step:1};
const controls=inferControls(component,story);
assert.equal(controls.find(x=>x.name==='title').control,'text');
assert.equal(controls.find(x=>x.name==='disabled').control,'boolean');
assert.equal(controls.find(x=>x.name==='count').control,'number');
assert.equal(controls.find(x=>x.name==='tone').control,'select');
assert.equal(controls.find(x=>x.name==='accentColor').control,'color');
assert.equal(controls.find(x=>x.name==='count').max,10);

setStoryArg(story,'title','Changed',component);
setStoryArg(story,'disabled','true',component);
setStoryArg(story,'count','7',component);
assert.equal(story.args.title,'Changed');
assert.equal(story.args.disabled,true);
assert.equal(story.args.count,7);
const rendered=materializeStoryComponent(component,story);
assert.notEqual(rendered.id,root.id);
assert.equal(rendered.children[0].props.text,'Changed');
assert.equal(rendered.children[1].props.disabled,true);
assert.equal(rendered.children[0].meta.storySourceId,title.id);

const step=addStoryStep(story,'click',button.id,'');
const assertion=addStoryAssertion(story,'visible',button.id,true);
assert.equal(step.type,'click');
assert.equal(assertion.type,'visible');
const copy=duplicateComponentStory(component,story.id);
assert.ok(copy && copy.id!==story.id && copy.name.includes('Copy'));
const matrix=createStoryMatrix(component,project,{themes:['default','dark'],viewports:['mobile','desktop'],locales:['en']});
assert.equal(matrix.length,4);
assert.equal(matrix[0].tags[0],'matrix');
assert.ok(filterStories(project,{query:'primary'}).some(x=>x.story.id===story.id));
assert.ok(filterStories(project,{includeTags:['stable']}).some(x=>x.story.id===story.id));
assert.equal(filterStories(project,{excludeTags:['stable']}).some(x=>x.story.id===story.id),false);

project.storybook.results[story.id]=createStoryResult();
setStoryResult(project,story.id,'render','pass',['Rendered']);
setStoryResult(project,story.id,'interaction','pass',[]);
setStoryResult(project,story.id,'a11y','pass',[]);
setStoryResult(project,story.id,'visual','pass',[]);
assert.equal(overallStatus(project.storybook.results[story.id]),'pass');
setStoryResult(project,copy.id,'render','fail',['boom']);
assert.equal(filterStories(project,{failuresOnly:true})[0].story.id,copy.id);

assert.equal(compareVisualBaseline(project,story.id,'abcd').status,'missing');
saveVisualBaseline(project,story.id,'abcd');
assert.equal(compareVisualBaseline(project,story.id,'abcd').status,'pass');
assert.equal(compareVisualBaseline(project,story.id,'efgh').status,'fail');

const docs=generateAutodocs(component,project);
assert.match(docs,/# ButtonCard/);
assert.match(docs,/`title`/);
assert.match(docs,/Primary/);
const manifest=exportPortableStoryManifest(project);
assert.equal(manifest.format,'astro-ui-portable-stories');
assert.equal(manifest.components[0].name,'ButtonCard');
assert.ok(manifest.components[0].stories.length>=6);
const csf=exportStorybookCsf(component,{framework:'react',importPath:'./ButtonCard'});
assert.match(csf,/@storybook\/react-vite/);
assert.match(csf,/export const Primary/);
assert.match(csf,/component: ButtonCard/);
assert.match(csf,/storybook\/test/);
assert.match(csf,/userEvent\.click/);
assert.match(csf,/toBeVisible/);
const vue=exportStorybookCsf(component,{framework:'vue',importPath:'./ButtonCard.vue'});
assert.match(vue,/@storybook\/vue3-vite/);
const svelte=exportStorybookCsf(component,{framework:'svelte',importPath:'./ButtonCard.svelte'});
assert.match(svelte,/@storybook\/svelte-vite/);
const componentManifest=exportComponentManifest(project);
assert.equal(componentManifest.format,'astro-ui-component-manifest');
assert.equal(componentManifest.components[0].name,'ButtonCard');
assert.ok(componentManifest.components[0].documentation.includes('# ButtonCard'));
const summary=storybookSummary(project);
assert.equal(summary.stories,component.stories.length);
assert.equal(summary.baselines,1);
console.log(`storybook-cleanroom.test: OK (${summary.stories} stories, ${controls.length} controls)`);
