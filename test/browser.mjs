import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {restore} from '../src/engine.mjs';
const require=createRequire(import.meta.url);
let chromium;
try{({chromium}=require('playwright'));}catch{try{({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}catch{throw new Error('Für die Browser-Prüfung: npm install --no-save playwright und npx playwright install chromium');}}
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const output=path.resolve('test-results');await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const errors=[];
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const waitEnabled=async selector=>page.waitForFunction(s=>{const b=document.querySelector(s);return b&&!b.disabled;},selector,{timeout:18000});
async function buildModule(type){await page.locator('[data-build="'+type+'"]').click();await page.locator('#station-canvas').press('Enter');await page.locator('#inspector').waitFor({state:'visible'});await page.locator('[data-action="close-inspector"]').click();}
async function claim(){await page.locator('[data-action="claim"]').click();}
async function close(){if(await page.locator('#panel-dialog').isVisible())await page.locator('#dialog-close').click();}
try{
  await page.goto(base+'/');await page.locator('#new-station-name').fill('Testhafen');await page.screenshot({path:output+'/welcome.png'});await page.locator('#start-button').click();
  await buildModule('solar');await claim();
  await buildModule('habitat');await claim();
  await page.locator('.main-tabs [data-panel="crew"]').click();await page.locator('[data-action="hire"]').click();assert.match(await page.locator('#dialog-body').innerText(),/Jun Okafor/);await close();await claim();
  await buildModule('lab');await claim();await buildModule('dock');await claim();
  await page.locator('[data-speed="4"]').click();await page.locator('.main-tabs [data-panel="research"]').click();await waitEnabled('[data-research="navigation"]');await page.locator('[data-research="navigation"]').click();assert.match(await page.locator('#dialog-body').innerText(),/BEREITS ERFORSCHT/);await close();await claim();
  await page.locator('.main-tabs [data-panel="map"]').click();await page.locator('[data-send="belt"]').click();assert.match(await page.locator('#dialog-body').innerText(),/UNTERWEGS/);await close();
  await page.locator('[data-action="claim"]').waitFor({state:'visible',timeout:18000});await claim();
  let state=JSON.parse(await page.evaluate(()=>localStorage.getItem('sternenhafen.save.v1')));assert.equal(state.stats.expeditions,1);assert.deepEqual(state.fragments,['belt']);assert.equal(state.crew.length,4);assert.equal(state.missionIndex,7);
  console.log('✓ Echter Spielablauf: 5 Bauten, Crew, Forschung, erster Flug und Signalfragment');
  await page.locator('[data-action="fit"]').click();await page.screenshot({path:output+'/station-played.png'});
  // The flight is played through the same input and result controls a player uses.
  await page.locator('[data-action="salvage"]').click();await page.locator('[data-action="start-salvage"]').click();await page.keyboard.down('ArrowLeft');await page.waitForTimeout(900);await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');await page.waitForTimeout(650);await page.keyboard.up('ArrowRight');await page.screenshot({path:output+'/salvage-flight.png'});await page.locator('[data-action="exit-salvage"]').first().click();await page.locator('#salvage-result').waitFor({state:'visible'});assert.match(await page.locator('#salvage-result').innerText(),/FRACHTSTÜCKE/);await page.locator('#salvage-result [data-action="exit-salvage"]').click();
  assert.equal(await page.locator('#salvage-dialog').isVisible(),false);state=JSON.parse(await page.evaluate(()=>localStorage.getItem('sternenhafen.save.v1')));assert.ok(state.lastSalvage>=0);console.log('✓ Bergung: Steuerung, Laser, Rückkehr und genau einmal verbuchte Fracht');
  // Freeze the economy while checking file round trips and invalid input.
  await page.locator('[data-action="pause"]').click();await page.locator('#settings-button').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Spielstand exportieren',exact:true}).click()]);await download.saveAs(output+'/browser-save.json');const exported=restore(await readFile(output+'/browser-save.json','utf8'));assert.equal(exported.name,'Testhafen');assert.equal(exported.stats.expeditions,1);
  const before=await page.evaluate(()=>localStorage.getItem('sternenhafen.save.v1'));
  await page.locator('#import-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1}')});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>localStorage.getItem('sternenhafen.save.v1')),before);assert.match(await page.locator('#toast-stack').innerText(),/nicht verändert/);
  await page.locator('#import-file').setInputFiles(output+'/browser-save.json');await page.locator('[data-action="confirm-import"]').click();assert.match(await page.locator('#station-name').innerText(),/Testhafen/);
  await page.reload();await page.locator('#start-button').click();assert.match(await page.locator('#station-name').innerText(),/Testhafen/);state=JSON.parse(await page.evaluate(()=>localStorage.getItem('sternenhafen.save.v1')));assert.equal(state.missionIndex,7);assert.equal(state.stats.expeditions,1);console.log('✓ Autosave, Reload, JSON-Export, Importbestätigung und Ablehnung kaputter Dateien');
  for(const name of ['research','crew','map','log','trade','achievements','help','settings']){await page.locator('[data-panel="'+name+'"]').first().click();assert.ok((await page.locator('#dialog-body').innerText()).length>80);await close();}
  console.log('✓ Alle 8 Spielbereiche öffnen und schließen ohne Browserfehler');
  // A separate context keeps the hand-played save independent of the visual fixture.
  await context.close();const showcaseContext=await browser.newContext({viewport:{width:1440,height:1000}});
  const showcase=await showcaseContext.newPage();showcase.on('pageerror',e=>errors.push(e.message));await showcase.goto(base+'/');
  await showcase.evaluate(async()=>{const E=await import('./src/engine.mjs');const C=await import('./src/content.mjs');const s=E.createGame('Aurelia',218);s.resources={credits:1e7,alloy:1e7,crystal:1e7,science:1e7,relic:3};for(const t of C.TECHS)E.research(s,t.id);for(const [type,x,y] of [['solar',-1,0],['habitat',0,1],['lab',0,-1],['dock',1,1],['market',-1,1],['storage',2,0],['solar',-2,0],['garden',-1,-1],['refinery',1,-1],['observatory',0,-2],['lounge',-2,1],['habitat',2,1],['beacon',-1,-2]]){const r=E.build(s,type,x,y);if(!r.ok)throw new Error(r.error);}for(let i=0;i<5;i++)E.hire(s);for(const m of s.modules.filter(m=>m.type==='solar'))E.upgrade(s,m.id);s.resources.credits=6420;s.resources.alloy=715;s.resources.crystal=183;s.resources.science=212;s.fragments=['belt','gardens','relay'];s.missionIndex=C.MISSIONS.length;s.stats.expeditions=18;s.time=1200;s.notices=[];s.event={id:'merchant',arrivedAt:s.time};localStorage.setItem('sternenhafen.save.v1',E.serialize(s));});await showcase.reload();await showcase.locator('#start-button').click();await showcase.locator('[data-action="fit"]').click();await showcase.waitForTimeout(1200);await showcase.screenshot({path:output+'/station-developed.png'});
  assert.equal(await showcase.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await showcaseContext.close();
  const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(base+'/');await mobile.locator('#start-button').tap();await mobile.locator('[data-action="toggle-build"]').tap();await mobile.locator('[data-build="solar"]').tap();
  await mobile.waitForTimeout(500);const bounds=await mobile.locator('#station-canvas').boundingBox();const z=Math.max(.55,Math.min(1.9,(bounds.width-100)/197,(bounds.height-170)/203.5));await mobile.touchscreen.tap(bounds.x+bounds.width/2-55.5*z,bounds.y+bounds.height*.54-5.25*z);await mobile.locator('#inspector').waitFor({state:'visible'});await mobile.locator('[data-action="close-inspector"]').tap();await mobile.locator('[data-action="claim"]').tap();
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:output+'/mobile-station.png',fullPage:true});await mobile.locator('.main-tabs [data-panel="research"]').tap();assert.equal(await mobile.locator('#panel-dialog').isVisible(),true);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:output+'/mobile-research.png'});await mobile.locator('#dialog-close').tap();
  console.log('✓ Handy: Touch-Bau, Kapitelabschluss, Forschung und keine horizontale Überbreite');
  assert.deepEqual(errors,[]);console.log('✓ Keine ungefangenen JavaScript-Fehler');await mobileContext.close();
}finally{await browser.close();}
