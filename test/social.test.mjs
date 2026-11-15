import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,serialize,restore,build,buildSites} from '../src/engine.mjs';
import {profileFromGame,scoreProfile,validateProfile,stationTitle,encodeProfile,decodeProfile,makeShareLink,readSharedProfile,hasSharedProfile,cleanFriends,upsertFriend,rankedProfiles,comparisonRows,MAX_FRIENDS,MAX_PROFILE_CODE} from '../src/social.mjs';

const NOW=Date.UTC(2026,10,15,12);
const profile=(name='Aurelia')=>profileFromGame(createGame(name,42),NOW);
const clone=value=>JSON.parse(JSON.stringify(value));

test('a public profile includes comparison metrics but no resources, crew names, positions or log',()=>{
  const p=profile();assert.deepEqual(Object.keys(p),['v','id','name','capturedAt','playedSeconds','stats']);
  const json=JSON.stringify(p);for(const privateValue of ['resources','Mara Vale','Ivo Chen','notices','log','assigned','seed','nextId'])assert.equal(json.includes(privateValue),false);
  assert.equal(p.stats.modules,2);assert.equal(p.stats.crew,3);assert.equal(scoreProfile(p).total,180);
});
test('the score has exact documented contributions and does not depend on money, speed or idle time',()=>{
  const s=createGame(),before=scoreProfile(profileFromGame(s,NOW));s.resources.credits=999999;s.stats.earned=999999;s.time=100000;s.speed=4;
  assert.deepEqual(scoreProfile(profileFromGame(s,NOW)),before);
  const p=profile();p.stats={modules:3,levels:5,crew:4,techs:2,chapters:3,fragments:1,achievements:2,expeditions:4,bestSalvage:7,contracts:5,beacon:true};
  assert.deepEqual(scoreProfile(validateProfile(p)),{station:1090,research:480,exploration:130,salvage:210,total:1910});
});
test('repeated expeditions and deliveries have bounded influence on the comparison',()=>{
  const p=profile();p.stats.expeditions=1000000;p.stats.contracts=1000000;p.stats.bestSalvage=60;
  const score=scoreProfile(validateProfile(p));assert.equal(score.exploration,3000);assert.equal(score.salvage,1800);
});
test('shared profile links round trip German, non-Latin and emoji station names',()=>{
  for(const name of ['Grüße aus Lyra','東京 🚀','Звёздный порт','A & B <3']){const p=profile(name);assert.deepEqual(decodeProfile(encodeProfile(p)),p);assert.deepEqual(readSharedProfile(makeShareLink(p)),p);}
});
test('a share uses the fragment and reveals no profile in the request query',()=>{
  const p=profile(),url=new URL(makeShareLink(p));assert.equal(url.search,'');assert.ok(url.hash.startsWith('#station=SH1.'));assert.equal(hasSharedProfile(url.href),true);
  assert.equal(hasSharedProfile('https://example.org/'),false);
});
test('a pasted profile code and an explicit query invitation can also be decoded',()=>{
  const p=profile(),code=encodeProfile(p);assert.deepEqual(readSharedProfile('  '+code+'  '),p);assert.deepEqual(readSharedProfile('https://example.org/?station='+code),p);
});
test('malformed, oversized, corrupted and incompatible profile codes are rejected',()=>{
  for(const code of ['', 'SH1.!!!', 'SH1.a', 'not a station link', 'SH1.'+'a'.repeat(MAX_PROFILE_CODE),'{"version":1}'])assert.throws(()=>readSharedProfile(code));
  const incompatible=profile();incompatible.v=2;assert.throws(()=>validateProfile(incompatible),/Vergleichsversion/);
});
test('profile validation rejects nonfinite, negative, fractional and inconsistent values',()=>{
  for(const mutate of [p=>p.stats.modules=-1,p=>p.stats.crew=1.5,p=>p.stats.techs=Infinity,p=>p.stats.levels=1,p=>p.stats.levels=50,p=>p.stats.beacon='true',p=>p.id='" onclick="bad',p=>p.capturedAt=NaN,p=>p.playedSeconds=-1]){const p=profile();mutate(p);assert.throws(()=>validateProfile(p));}
});
test('unknown score claims and private fields are discarded rather than trusted',()=>{
  const p=profile();p.score=99999999;p.resources={credits:9999};p.stats.total=99999999;const safe=validateProfile(p);
  assert.equal('score' in safe,false);assert.equal('resources' in safe,false);assert.equal('total' in safe.stats,false);assert.equal(scoreProfile(safe).total,180);
});
test('station identity survives exports, imports, renaming and game progression',()=>{
  const s=createGame('Aurelia'),id=s.stationId;s.name='Neuer Name';const point=buildSites(s)[0];build(s,'solar',point.x,point.y);
  assert.equal(restore(serialize(s)).stationId,id);assert.equal(profileFromGame(s,NOW).id,id);assert.notEqual(createGame().stationId,id);
});
test('old version-one saves gain an identity without resetting their progress',()=>{
  const s=createGame('Mein alter Hafen');const point=buildSites(s)[0];build(s,'solar',point.x,point.y);const raw=JSON.parse(serialize(s));delete raw.stationId;
  const migrated=restore(raw);assert.ok(migrated.stationId);assert.equal(migrated.modules.length,3);assert.equal(migrated.name,s.name);assert.deepEqual(migrated.resources,s.resources);assert.equal(restore(serialize(migrated)).stationId,migrated.stationId);
});
test('a friend can be added, updated by identity and never duplicated by renaming',()=>{
  const friend=profile('Mara-Hafen');let result=upsertFriend([],friend,'own-station');assert.equal(result.status,'added');
  friend.name='Mara II';friend.capturedAt+=1000;friend.stats.techs=2;result=upsertFriend(result.profiles,friend,'own-station');assert.equal(result.status,'updated');assert.equal(result.profiles.length,1);assert.equal(result.profiles[0].name,'Mara II');
});
test('an old link cannot overwrite a newer shared snapshot',()=>{
  const older=profile(),newer=clone(older);newer.capturedAt+=1000;newer.stats.techs=5;
  const result=upsertFriend([newer],older,'own-station');assert.equal(result.status,'older');assert.deepEqual(result.profiles,[newer]);
});
test('one’s own station link is not counted as a second player',()=>{
  const own=profile();const result=upsertFriend([],own,own.id);assert.equal(result.status,'self');assert.deepEqual(result.profiles,[]);
});
test('the friends list has a clear capacity and corrupt stored entries are isolated',()=>{
  const items=Array.from({length:MAX_FRIENDS},(_,i)=>profile('Station '+i));assert.throws(()=>upsertFriend(items,profile('Noch ein Hafen'),'own-station'),/30/);
  assert.equal(cleanFriends([null,{v:9},items[0],items[0]]).length,1);assert.deepEqual(cleanFriends({}),[]);
});
test('ranking is category-specific and ties share rank rather than an arbitrary advantage',()=>{
  const a=profile('A'),b=profile('B'),c=profile('C');a.stats.techs=1;b.stats.techs=1;
  let rows=rankedProfiles([c,b,a]);assert.deepEqual(rows.map(r=>r.rank),[1,1,3]);assert.equal(rows[0].profile.id,a.id);
  c.stats.bestSalvage=10;rows=rankedProfiles([a,b,c],'salvage');assert.equal(rows[0].profile.id,c.id);assert.deepEqual(rows.map(r=>r.rank),[1,2,2]);
});
test('duplicate shared identities occupy a single ranking entry with the newer values',()=>{
  const a=profile(),b=clone(a);b.capturedAt+=1000;b.stats.techs=3;const rows=rankedProfiles([a,b]);assert.equal(rows.length,1);assert.equal(rows[0].scores.research,360);
});
test('direct comparisons include the actual point and progress differences',()=>{
  const a=profile(),b=profile();a.stats.techs=2;b.stats.bestSalvage=10;
  const rows=comparisonRows(a,b);assert.equal(rows.find(r=>r.label==='Technologien').delta,2);assert.equal(rows.find(r=>r.label==='Beste Bergung · Fracht').delta,-10);assert.equal(rows[0].delta,-60);
});
test('rank titles have deterministic meaningful thresholds',()=>{
  assert.equal(stationTitle(180),'Neuankömmling');assert.equal(stationTitle(1000),'Pionier');assert.equal(stationTitle(3000),'Hafenbauer');assert.equal(stationTitle(6000),'Sektorstütze');assert.equal(stationTitle(10000),'Lyra-Legende');
});
