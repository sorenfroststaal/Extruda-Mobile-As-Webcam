import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function engine(){const window={};vm.runInNewContext(readFileSync('public/compositor.js','utf8'),{window,structuredClone,document:{createElement(){throw Error('Canvas failure')}}});return window.ExtrudaCompositor;}
test('image edits reject invalid data atomically and bound rectangles and masks',()=>{const e=engine();assert.equal(e.active(),false);assert.throws(()=>e.update({crop:{x:NaN,y:0,w:1,h:1}}));assert.equal(e.active(),false);const c=e.config;c.crop={x:-1,y:3,w:3,h:3};e.update(c);assert.equal(e.config.crop.x,0);assert.equal(e.config.crop.y,.97);assert.throws(()=>e.update({...e.config,masks:Array(13).fill({x:0,y:0,w:1,h:1,kind:'solid',color:'#000000',strength:24})}));});
test('failed processing blacks output and never draws raw video',()=>{const e=engine();e.update({...e.config,crop:{x:0,y:0,w:.5,h:1}});const calls=[];const ctx={fillRect(){calls.push('black')},drawImage(){calls.push('raw')}};assert.equal(e.render(ctx,{videoWidth:100,videoHeight:100},100,100,'contain',0,()=>({})),false);assert.deepEqual(calls,['black']);});
test('overlay reset releases bitmap and oversized images are refused',()=>{const e=engine();let closed=0;assert.throws(()=>e.setOverlay({width:10000,height:10000}));e.setOverlay({width:10,height:10,close(){closed++}});assert.equal(e.active(),true);e.reset();assert.equal(closed,1);assert.equal(e.active(),false);});
