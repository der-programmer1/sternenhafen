import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {readSharedProfile,makeShareLink} from '../src/social.mjs';

const require=createRequire(import.meta.url);
let chromium;
try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const base=(process.env.TEST_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
await mkdir('test-results',{recursive:true});
const SAVE='sternenhafen.save.v1',FRIENDS='sternenhafen.friends.v1',errors=[];
function watch(page){page.on('pageerror',e=>errors.push(e.message));}
function localLink(link){const url=new URL(base+'/');url.hash=new URL(link).hash;return url.href;}
async function state(page,key=SAVE){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);}
async function openRanking(page){await page.locator('.main-tabs [data-panel="social"]').click();await page.locator('#social-panel').waitFor();}
async function close(page){if(await page.locator('#panel-dialog').isVisible())await page.locator('#dialog-close').click();}
async function paste(page,link){await page.locator('#profile-link-input').fill(link);await page.locator('#profile-import-form button[type="submit"]').click();}
async function copy(page){await page.bringToFront();await page.locator('[data-social="copy"]').click();const expected=await page.locator('#own-share-link').inputValue();await page.waitForFunction(async link=>await navigator.clipboard.readText()===link,expected);return page.evaluate(()=>navigator.clipboard.readText());}

try{
  const alphaContext=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const alpha=await alphaContext.newPage();watch(alpha);await alpha.goto(base+'/');await alpha.locator('#new-station-name').fill('Hafen Ägir 🚀');await alpha.locator('#start-button').click();await alpha.locator('[data-action="pause"]').click();
  await alpha.locator('[data-build="solar"]').click();await alpha.locator('#station-canvas').press('Enter');await alpha.locator('[data-action="close-inspector"]').click();await alpha.locator('[data-action="claim"]').click();await openRanking(alpha);
  const alphaLink=await copy(alpha),firstProfile=readSharedProfile(alphaLink),alphaState=await state(alpha);
  assert.equal(firstProfile.id,alphaState.stationId);assert.equal(firstProfile.stats.modules,3);assert.equal(firstProfile.stats.chapters,1);assert.equal('resources' in firstProfile,false);assert.ok(new URL(alphaLink).hash.startsWith('#station=SH1.'));
  console.log('✓ Erster echter Spieler teilt einen kompakten Profil-Link per Zwischenablage');

  const betaContext=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const beta=await betaContext.newPage();watch(beta);await beta.goto(localLink(alphaLink));assert.match(await beta.locator('#shared-station-welcome').innerText(),/Hafen Ägir/);
  await beta.screenshot({path:'test-results/social-shared-welcome.png'});await beta.locator('[data-social="open"]').click();assert.equal(await beta.locator('#social-panel').isVisible(),true);assert.equal(await state(beta),null);
  await beta.locator('[data-social="remember"]').click();assert.equal((await state(beta,FRIENDS)).length,1);assert.equal(await beta.locator('.social-ranking-row').count(),2);assert.equal(await beta.evaluate(()=>location.hash),'');
  await close(beta);await beta.locator('#new-station-name').fill('Hafen Borealis');await beta.locator('#start-button').click();await beta.locator('[data-action="pause"]').click();await openRanking(beta);
  const betaId=(await state(beta)).stationId;assert.notEqual(betaId,firstProfile.id);assert.equal(await beta.locator('.social-ranking-row').first().getAttribute('data-profile-row'),firstProfile.id);assert.match(await beta.locator('#social-comparison').innerText(),/Hafen Ägir/);assert.match(await beta.locator('#social-comparison').innerText(),/130 Punkte bis/);
  console.log('✓ Zweiter, getrennter Browser vergleicht und merkt den ersten Stand ohne seinen Spielstand zu ersetzen');

  await beta.locator('[data-social="category"][data-category="salvage"]').click();assert.deepEqual(await beta.locator('.social-rank-number').allTextContents(),['01','01']);await beta.locator('[data-social="category"][data-category="total"]').click();
  await paste(beta,alphaLink);assert.equal((await state(beta,FRIENDS)).length,1);assert.equal(await beta.locator('.social-ranking-row').count(),2);
  const ownLink=await copy(beta);await paste(beta,ownLink);assert.equal((await state(beta,FRIENDS)).length,1);assert.equal((await state(beta)).stationId,betaId);
  console.log('✓ Gleichstände, Kategorie-Rangliste und Schutz vor doppelten oder eigenen Einträgen');

  await close(alpha);await alpha.locator('[data-build="solar"]').click();await alpha.locator('#station-canvas').press('Enter');await alpha.locator('[data-action="close-inspector"]').click();await alpha.locator('#settings-button').click();await alpha.locator('#rename-station').fill('Ägir · Zweiter Stand');await alpha.locator('#rename-form button').click();await close(alpha);await openRanking(alpha);const newerLink=await copy(alpha),newer=readSharedProfile(newerLink);
  assert.equal(newer.id,firstProfile.id);assert.equal(newer.stats.modules,4);assert.ok(newer.capturedAt>firstProfile.capturedAt);
  await paste(beta,newerLink);assert.equal((await state(beta,FRIENDS)).length,1);assert.equal((await state(beta,FRIENDS))[0].name,'Ägir · Zweiter Stand');await paste(beta,alphaLink);assert.equal((await state(beta,FRIENDS))[0].stats.modules,4);
  await beta.screenshot({path:'test-results/social-desktop.png'});
  const savedBeta=await state(beta);await beta.reload();await beta.locator('#start-button').click();await openRanking(beta);assert.equal((await state(beta)).stationId,betaId);assert.equal((await state(beta,FRIENDS))[0].stats.modules,4);assert.equal(await beta.locator('.social-ranking-row').count(),2);
  console.log('✓ Ein neuer Link aktualisiert dieselbe Station; alte Links und Neuladen verlieren keinen Fortschritt');

  const beforeFriends=JSON.stringify(await state(beta,FRIENDS));await paste(beta,'https://example.org/#station=SH1.bad');assert.equal(JSON.stringify(await state(beta,FRIENDS)),beforeFriends);assert.equal(await beta.locator('#profile-import-error').isVisible(),true);assert.equal((await state(beta)).stationId,betaId);
  const hostile={...newer,id:'hostile-station-01',name:'<svg onload=z=1>'};await paste(beta,makeShareLink(hostile));assert.equal(await beta.locator('svg[onload]').count(),0);assert.equal(await beta.evaluate(()=>window.z),undefined);assert.match(await beta.locator('#social-ranking').innerText(),/<svg onload=z=1>/);await beta.locator('[data-social="remove"][data-profile="hostile-station-01"]').click();assert.equal((await state(beta,FRIENDS)).length,1);
  console.log('✓ Beschädigte Links verändern keine Daten; fremde Namen werden als Text angezeigt');

  const restoredContext=await browser.newContext({viewport:{width:1200,height:900}});const restoredPage=await restoredContext.newPage();watch(restoredPage);await restoredPage.goto(base+'/');await restoredPage.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:SAVE,value:savedBeta});await restoredPage.reload();await restoredPage.locator('#start-button').click();await openRanking(restoredPage);await paste(restoredPage,ownLink);assert.equal(await restoredPage.locator('.social-ranking-row').count(),1);assert.equal((await state(restoredPage)).stationId,betaId);
  await restoredPage.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new DOMException('Clipboard unavailable','NotAllowedError');}}}));await restoredPage.locator('[data-social="copy"]').click();await restoredPage.waitForFunction(()=>document.querySelector('#social-link-details').open);assert.ok((await restoredPage.locator('#own-share-link').inputValue()).includes('#station=SH1.'));assert.equal(await restoredPage.locator('#own-share-link').getAttribute('readonly'),'');
  console.log('✓ Identität bleibt bei Gerätewechsel erhalten; Kopieren hat einen manuellen Ausweg');

  const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await mobileContext.newPage();watch(mobile);await mobile.goto(localLink(newerLink));await mobile.locator('[data-social="open"]').tap();await mobile.locator('[data-social="remember"]').tap();assert.equal(await mobile.locator('.social-ranking-row').count(),2);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await mobile.locator('#social-panel').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await mobile.locator('#dialog-body').evaluate(el=>el.closest('dialog').scrollTo(0,0));await mobile.screenshot({path:'test-results/social-mobile.png'});
  await close(mobile);await mobile.locator('#new-station-name').fill('Mobiler Hafen');await mobile.locator('#start-button').tap();const nav=await mobile.locator('.bottom-nav').boundingBox();assert.ok(nav.x>=0&&nav.width<=390);await mobile.locator('.main-tabs [data-panel="social"]').tap();assert.equal(await mobile.locator('#social-panel').isVisible(),true);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  console.log('✓ Geteilte Stationen, Vergleich und neue Navigation funktionieren per Touch');

  const invalidContext=await browser.newContext({viewport:{width:320,height:740}});const invalid=await invalidContext.newPage();watch(invalid);await invalid.goto(base+'/#station=SH1.bad');assert.match(await invalid.locator('#shared-station-welcome').innerText(),/ungültig/);await invalid.locator('#start-button').click();assert.equal(await invalid.locator('#social-panel').isVisible(),true);await invalid.locator('#social-panel [data-social="dismiss"]').click();assert.equal(await invalid.evaluate(()=>location.hash),'');assert.equal(await invalid.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await close(invalid);await invalid.locator('.main-tabs [data-panel="social"]').click();assert.equal(await invalid.locator('#social-panel').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  console.log('✓ Ungültige Einladungen sind verwerfbar; kleine Displays bleiben bedienbar');
  assert.deepEqual(errors,[]);console.log('✓ Keine ungefangenen Browserfehler');
}finally{await browser.close();}
