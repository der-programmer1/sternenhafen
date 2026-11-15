import {VERSION,MODULES,TECHS,MISSIONS,SECTORS,CREW_POOL,EVENTS,ACHIEVEMENTS,CONTRACTS} from './content.mjs';

export const MAX_OFFLINE=1800;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const failure=error=>({ok:false,error});
export function createGame(name='Aurelia',seed=Date.now()){
  return {version:VERSION,name:String(name).trim().slice(0,24)||'Aurelia',time:0,seed:Math.abs(Number(seed)||1)>>>0,nextId:3,
    resources:{credits:240,alloy:105,crystal:25,science:0,relic:0},
    modules:[{id:'m1',type:'core',x:0,y:0,level:1,assigned:null},{id:'m2',type:'mine',x:1,y:0,level:1,assigned:'ivo'}],
    crew:CREW_POOL.slice(0,3).map(c=>({...c,level:1,xp:0})),techs:[],expeditions:[],fragments:[],
    missionIndex:0,achievements:[],event:null,nextEvent:85,eventHistory:[],contracts:[0,1],contractSerial:0,
    stats:{built:0,expeditions:0,earned:0,visitors:0,salvage:0,bestSalvage:0,contracts:0},
    moraleBonus:0,lastSalvage:-90,won:false,paused:false,speed:1,savedAt:Date.now(),notices:[],
    log:[{time:0,type:'story',title:'Willkommen am Rand von Lyra',text:'Zwei Module, drei Menschen und sehr viel unbeschriebenes All. „Machen wir etwas daraus“, sagt Mara.'}]};
}
export function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function caps(s){const storage=s.modules.filter(m=>m.type==='storage').reduce((a,m)=>a+m.level,0);return {credits:1e10,alloy:450+450*storage,crystal:250+250*storage,science:1e8,relic:3};}
export function gain(s,rewards){const limit=caps(s);for(const [key,n] of Object.entries(rewards||{})){if(!(key in s.resources)||!Number.isFinite(n)||n<0)continue;const before=s.resources[key];s.resources[key]=Math.min(limit[key],before+n);if(key==='credits')s.stats.earned+=s.resources[key]-before;}}
export function canAfford(s,cost){return Object.entries(cost||{}).every(([key,n])=>Number.isFinite(n)&&n>=0&&s.resources[key]+1e-8>=n);}
function spend(s,cost){for(const [key,n]of Object.entries(cost||{}))s.resources[key]=Math.max(0,s.resources[key]-n);}
export function log(s,title,text,type='info'){s.log.unshift({time:s.time,title,text,type});s.log=s.log.slice(0,70);}
function notice(s,title,text,type='success'){s.notices.push({title,text,type});s.notices=s.notices.slice(-14);}
export function moduleAt(s,x,y){return s.modules.find(m=>m.x===x&&m.y===y);}
export function isBuildable(s,x,y){return Number.isInteger(x)&&Number.isInteger(y)&&Math.abs(x)<=5&&Math.abs(y)<=5&&!moduleAt(s,x,y)&&s.modules.some(m=>Math.abs(m.x-x)+Math.abs(m.y-y)===1);}
export function buildSites(s){const found=new Map();for(const m of s.modules)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=m.x+dx,y=m.y+dy;if(isBuildable(s,x,y))found.set(x+','+y,{x,y});}return [...found.values()];}
export function crewAway(s,id){return s.expeditions.some(e=>e.crewId===id);}
export function crewAssignment(s,id){return s.modules.find(m=>m.assigned===id);}
export function housing(s){return s.modules.reduce((a,m)=>a+(MODULES[m.type].housing||0)*m.level,0);}
export function morale(s){return clamp(72+s.moraleBonus+s.modules.reduce((a,m)=>a+(MODULES[m.type].morale||0)*m.level,0),45,100);}
export function crewBonus(crew,type){if(!crew)return 1;const match=crew.skill==='engineer'&&['mine','refinery'].includes(type)||crew.skill==='scientist'&&['lab','observatory'].includes(type)||crew.skill==='trader'&&type==='market';return (match?1.25:1)*(1+(crew.level-1)*.06);}
export function economy(s){
  let generated=0,demand=0;const rates={credits:0,alloy:0,crystal:0,science:0};
  for(const m of s.modules){const def=MODULES[m.type];generated+=(def.power||0)*Math.pow(1.65,m.level-1)*(m.type==='solar'&&s.techs.includes('solartech')?1.6:1);demand+=(def.energy||0)*Math.pow(1.3,m.level-1)*(s.techs.includes('efficiency')?.8:1);}
  const powerFactor=demand?Math.min(1,generated/demand):1;
  const crewFactor=.65+morale(s)/200;
  for(const m of s.modules){const def=MODULES[m.type];const worker=s.crew.find(c=>c.id===m.assigned&&!crewAway(s,c.id));let factor=Math.pow(1.65,m.level-1)*(def.energy?powerFactor:1);
    if(def.workers){factor*=worker?crewBonus(worker,m.type)*crewFactor:0;}
    if(m.type==='mine'&&s.techs.includes('automation'))factor*=1.15;
    if(['lab','observatory','refinery'].includes(m.type)&&s.techs.includes('harmonics'))factor*=1.25;
    for(const [key,n]of Object.entries(def.produces||{}))rates[key]+=n*factor;
  }
  return {generated,demand,powerFactor,rates,morale:morale(s),housing:housing(s),idle:s.crew.filter(c=>!crewAway(s,c.id)&&!crewAssignment(s,c.id)).length};
}
export function autoAssign(s,m){const def=MODULES[m.type];if(!def.workers)return;const free=s.crew.filter(c=>!crewAway(s,c.id)&&!crewAssignment(s,c.id)).sort((a,b)=>crewBonus(b,m.type)-crewBonus(a,m.type));if(free[0])m.assigned=free[0].id;}
export function build(s,type,x,y){
  const def=MODULES[type];if(typeof type!=='string'||!Object.hasOwn(MODULES,type)||type==='core')return failure('Dieses Modul lässt sich nicht bauen.');
  if(def.tech&&!s.techs.includes(def.tech))return failure('Erforsche zuerst '+TECHS.find(t=>t.id===def.tech).name+'.');
  if(def.max&&s.modules.filter(m=>m.type===type).length>=def.max)return failure('Dieses besondere Modul steht bereits.');
  if(!isBuildable(s,x,y))return failure('Baue auf ein freies, direkt benachbartes Feld.');
  if(!canAfford(s,def.cost))return failure('Dafür fehlt noch Material.');
  spend(s,def.cost);const m={id:'m'+s.nextId++,type,x,y,level:1,assigned:null};s.modules.push(m);autoAssign(s,m);s.stats.built++;
  log(s,def.name+' gebaut',def.workers&&!m.assigned?'Hier fehlt noch eine Crew-Person. Stelle jemanden ein oder weise eine Person zu.':'Ein neues Stück Zuhause.');
  if(type==='beacon'){s.won=true;log(s,'Ein Hafen in der Dunkelheit','Das Leuchtfeuer antwortet. Überall im Sektor drehen Schiffe ihre Antennen zu dir. „Wir sehen euch“, sagt die Stimme. „Wir kommen nach Hause.“','story');notice(s,'Das Leuchtfeuer leuchtet','Du hast Lyra einen Hafen geschenkt.','victory');}
  checkAchievements(s);return {ok:true,module:m};
}
export function upgradeCost(m){const cost={};for(const [key,n]of Object.entries(MODULES[m.type].cost))cost[key]=Math.ceil(n*Math.pow(1.45,m.level));return cost;}
export function upgrade(s,id){const m=s.modules.find(m=>m.id===id);if(!m||['core','beacon'].includes(m.type))return failure('Dieses Modul lässt sich nicht ausbauen.');const max=s.techs.includes('engineering')?3:2;if(m.level>=max)return failure(m.level===2?'Erforsche „Modulare Architektur“ für Stufe 3.':'Dieses Modul ist vollständig ausgebaut.');const cost=upgradeCost(m);if(!canAfford(s,cost))return failure('Für den Ausbau fehlt Material.');spend(s,cost);m.level++;checkAchievements(s);return {ok:true,module:m};}
export function recycle(s,id){
  const m=s.modules.find(m=>m.id===id);if(!m||['core','beacon'].includes(m.type))return failure('Das Herz deiner Station bleibt stehen.');
  if(MODULES[m.type].housing&&housing(s)-MODULES[m.type].housing*m.level<s.crew.length)return failure('Dann hätte deine Crew nicht genug Schlafplätze.');
  if(m.type==='dock'&&s.modules.filter(n=>n.type==='dock').reduce((a,n)=>a+n.level,0)-m.level<s.expeditions.length)return failure('Warte, bis die laufenden Expeditionen zurück sind.');
  const remaining=s.modules.filter(n=>n.id!==id);const reached=new Set(['m1']);let changed=true;while(changed){changed=false;for(const n of remaining)if(!reached.has(n.id)&&remaining.some(o=>reached.has(o.id)&&Math.abs(n.x-o.x)+Math.abs(n.y-o.y)===1)){reached.add(n.id);changed=true;}}
  if(reached.size!==remaining.length)return failure('Andere Module würden den Anschluss verlieren. Recycle zuerst die äußeren Module.');
  s.modules=remaining;const refund={};for(const[k,v]of Object.entries(MODULES[m.type].cost))refund[k]=Math.floor(v*.55);gain(s,refund);return {ok:true,refund};
}
export function assign(s,moduleId,crewId){const m=s.modules.find(m=>m.id===moduleId);if(!m||!MODULES[m.type].workers)return failure('Hier wird keine Person benötigt.');if(!crewId){m.assigned=null;return {ok:true};}const c=s.crew.find(c=>c.id===crewId);if(!c||crewAway(s,c.id))return failure('Diese Person ist gerade unterwegs.');for(const other of s.modules)if(other.assigned===crewId)other.assigned=null;m.assigned=crewId;return {ok:true};}
export function hireCost(s){return {credits:60+Math.max(0,s.crew.length-3)*25};}
export function hire(s){
  if(s.crew.length>=housing(s))return failure('Baue zuerst zusätzliche Wohnplätze.');if(s.crew.length>=24)return failure('Deine Station hat ihre Crew-Grenze von 24 Personen erreicht.');if(!canAfford(s,hireCost(s)))return failure('Für die Überfahrt fehlen Credits.');spend(s,hireCost(s));
  const index=s.crew.length;const base=CREW_POOL[index%CREW_POOL.length];const suffix=index>=CREW_POOL.length?' '+(Math.floor(index/CREW_POOL.length)+1):'';const c={...base,id:'c'+s.nextId++,name:base.name+suffix,level:1,xp:0};s.crew.push(c);for(const m of s.modules)if(MODULES[m.type].workers&&!m.assigned){autoAssign(s,m);}
  log(s,c.name+' ist angekommen',base.description,'story');checkAchievements(s);return {ok:true,crew:c};
}
export function research(s,id){const t=TECHS.find(t=>t.id===id);if(!t)return failure('Unbekannte Technologie.');if(s.techs.includes(id))return failure('Diese Technologie ist bereits erforscht.');if(!t.requires.every(x=>s.techs.includes(x)))return failure('Erforsche zuerst die vorausgesetzten Technologien.');if(!canAfford(s,t.cost))return failure('Für diese Forschung fehlen Wissen oder Kristalle.');spend(s,t.cost);s.techs.push(id);log(s,t.name,t.description,'research');notice(s,'Forschung abgeschlossen',t.name);checkAchievements(s);return {ok:true};}
export function expeditionCapacity(s){return s.modules.filter(m=>m.type==='dock').reduce((a,m)=>a+m.level,0);}
export function expeditionDuration(s,sector,crew){return Math.round(sector.duration*(crew?.skill==='pilot'?.82:1));}
export function sendExpedition(s,sectorId,crewId){
  const sector=SECTORS.find(x=>x.id===sectorId);if(!sector||!s.techs.includes(sector.tech))return failure('Diese Route ist noch nicht erforscht.');if(s.expeditions.length>=expeditionCapacity(s))return failure('Baue oder erweitere eine Andockbucht für einen weiteren Flug.');const crew=s.crew.find(c=>c.id===crewId);if(!crew||crewAway(s,crew.id))return failure('Wähle eine verfügbare Crew-Person.');if(!canAfford(s,sector.cost))return failure('Die Vorräte für diesen Flug fehlen noch.');
  spend(s,sector.cost);const assignment=crewAssignment(s,crew.id);if(assignment)assignment.assigned=null;const e={id:'e'+s.nextId++,sectorId,crewId,startsAt:s.time,endsAt:s.time+expeditionDuration(s,sector,crew),previousModule:assignment?.id||null};s.expeditions.push(e);log(s,crew.name+' startet',sector.name+' liegt vor dem Bug.','expedition');return {ok:true,expedition:e};
}
function finishExpedition(s,e){
  const sector=SECTORS.find(x=>x.id===e.sectorId),crew=s.crew.find(c=>c.id===e.crewId);if(!sector||!crew)return;
  const incident=random(s)<sector.risk*(crew.skill==='pilot'?.45:1);const rewards={};for(const[key,range]of Object.entries(sector.rewards)){let n=range[0]+random(s)*(range[1]-range[0]);if(crew.skill==='pilot')n*=1.15;if(s.modules.some(m=>m.type==='observatory'))n*=1.1;if(key==='credits'&&s.techs.includes('diplomacy'))n*=1.2;if(incident)n*=.72;rewards[key]=Math.round(n);}
  const newFragment=sector.fragment&&!s.fragments.includes(sector.id);if(newFragment){s.fragments.push(sector.id);rewards.relic=1;}
  gain(s,rewards);s.stats.expeditions++;crew.xp+=100;updateRank(s,crew);const prev=s.modules.find(m=>m.id===e.previousModule);if(prev&&!prev.assigned)prev.assigned=crew.id;
  const story={belt:'In einem alten Bordcomputer warten drei Töne und ein Stück einer Koordinate. Die erste Spur.',gardens:'Unter kristallenen Wurzeln liegt eine Datenkapsel. Das Signal wird klarer: „Wenn ihr das hört …“',relay:'Die Antenne wacht auf. „… dann lasst ein Licht an.“ Du hast das letzte Fragment gefunden.'};
  log(s,crew.name+' ist zurück',newFragment?story[sector.id]:incident?'Ein Staubsturm kostete etwas Fracht, aber alle sind sicher zurück.':sector.name+': ein guter Flug und neue Vorräte.',newFragment?'story':'expedition');
  notice(s,newFragment?'Ein Fragment des Signals':crew.name+' ist zurück',newFragment?story[sector.id]:'Fracht aus '+sector.name+' ist im Lager.');
}
function updateRank(s,crew){const newLevel=crew.xp>=6000?4:crew.xp>=2200?3:crew.xp>=600?2:1;if(newLevel>crew.level){crew.level=newLevel;notice(s,crew.name+' wächst an den Aufgaben','Erfahrung auf Stufe '+newLevel+'.');}}
export function missionProgress(s,mission=MISSIONS[s.missionIndex]){if(!mission)return {value:1,total:1,complete:true};let value=0;
  if(mission.kind==='module')value=s.modules.filter(m=>m.type===mission.target).length;
  if(mission.kind==='crew')value=s.crew.length;if(mission.kind==='tech')value=Number(s.techs.includes(mission.target));if(mission.kind==='expeditions')value=s.stats.expeditions;if(mission.kind==='fragments')value=s.fragments.length;
  return {value:Math.min(value,mission.amount),total:mission.amount,complete:value>=mission.amount};
}
export function claimMission(s){const m=MISSIONS[s.missionIndex];if(!m||!missionProgress(s,m).complete)return failure('Dieses Kapitel ist noch nicht abgeschlossen.');gain(s,m.reward);s.missionIndex++;log(s,'Kapitel abgeschlossen: '+m.title,'Ein guter nächster Schritt.','mission');notice(s,'Kapitel abgeschlossen',m.title);return {ok:true,mission:m};}
export function currentEvent(s){return EVENTS.find(e=>e.id===s.event?.id)||null;}
export function chooseEvent(s,index){const e=currentEvent(s),choice=e?.choices[index];if(!choice)return failure('Diese Begegnung ist nicht mehr verfügbar.');if(!canAfford(s,choice.cost))return failure('Dafür fehlen noch Vorräte. Du kannst auch die andere Antwort wählen.');spend(s,choice.cost);gain(s,choice.gain);s.moraleBonus=clamp(s.moraleBonus+(choice.morale||0),0,16);s.stats.visitors++;s.event=null;s.nextEvent=s.time+75+random(s)*65;log(s,e.title,choice.result,'story');notice(s,'Eine Begegnung bleibt',choice.result);checkAchievements(s);return {ok:true};}
export function trade(s,kind){const offers={alloy:{cost:{credits:45},gain:{alloy:20}},crystal:{cost:{credits:65},gain:{crystal:8}},sell:{cost:{alloy:25},gain:{credits:35}}};const offer=offers[kind];if(!offer)return failure('Dieses Angebot gibt es nicht.');if(!canAfford(s,offer.cost))return failure('Für diesen Handel fehlen Vorräte.');const limit=caps(s);if(Object.entries(offer.gain).some(([k,v])=>s.resources[k]+v>limit[k]))return failure('Dafür ist dein Lager zu voll.');spend(s,offer.cost);gain(s,offer.gain);return {ok:true};}
export function deliverContract(s,slot){if(!Number.isInteger(slot)||slot<0||slot>=s.contracts.length)return failure('Dieser Auftrag ist nicht mehr offen.');const c=CONTRACTS[s.contracts[slot]%CONTRACTS.length];if(!canAfford(s,c.cost))return failure('Für die Lieferung fehlt Material.');spend(s,c.cost);gain(s,c.gain);s.stats.contracts++;s.contractSerial++;const others=s.contracts.filter((_,i)=>i!==slot);let next=(s.contracts[slot]+2)%CONTRACTS.length;if(others.includes(next))next=(next+1)%CONTRACTS.length;s.contracts[slot]=next;notice(s,'Lieferung angekommen',c.name);return {ok:true};}
export function salvageReady(s){return s.time-s.lastSalvage>=45;}
export function awardSalvage(s,crates,scoreValue){if(!salvageReady(s))return failure('Dein Bergungsschiff wird gerade aufgetankt.');const count=clamp(Math.floor(Number(crates)||0),0,60);const rewards={alloy:8+count*3,credits:12+count*4,crystal:Math.floor(count/3),science:Math.floor(count/5)};gain(s,rewards);s.stats.salvage+=count;s.stats.bestSalvage=Math.max(s.stats.bestSalvage,count);s.lastSalvage=s.time;log(s,'Bergungsflug beendet',count+' Frachtstücke gesichert. Das kleine Schiff ist sicher zurück.','expedition');checkAchievements(s);return {ok:true,rewards,score:scoreValue};}
function achievementStat(s,id){return ({crew:s.crew.length,modules:s.modules.length,techs:s.techs.length,fragments:s.fragments.length,maxLevel:Math.max(...s.modules.map(m=>m.level)),won:Number(s.won)})[id]??s.stats[id]??0;}
export function checkAchievements(s){for(const a of ACHIEVEMENTS)if(!s.achievements.includes(a.id)&&achievementStat(s,a.stat)>=a.amount){s.achievements.push(a.id);notice(s,'Erinnerung freigeschaltet',a.title,'achievement');}}
export function advance(s,seconds,{offline=false}={}){
  if(s.paused||!Number.isFinite(seconds)||seconds<=0)return;let remaining=Math.min(seconds,MAX_OFFLINE);
  while(remaining>1e-8){const dt=Math.min(remaining,1);remaining-=dt;s.time+=dt;const eco=economy(s);const produced={};for(const[k,v]of Object.entries(eco.rates))produced[k]=v*dt;gain(s,produced);
    for(const c of s.crew)if(crewAssignment(s,c.id)&&!crewAway(s,c.id)){c.xp+=dt*eco.powerFactor;updateRank(s,c);}
    const returned=s.expeditions.filter(e=>e.endsAt<=s.time);s.expeditions=s.expeditions.filter(e=>e.endsAt>s.time);for(const e of returned)finishExpedition(s,e);
    if(!offline&&!s.event&&s.time>=s.nextEvent){const options=EVENTS.filter(e=>!s.eventHistory.slice(-2).includes(e.id));const event=options[Math.floor(random(s)*options.length)];s.event={id:event.id,arrivedAt:s.time};s.eventHistory.push(event.id);s.eventHistory=s.eventHistory.slice(-20);notice(s,'Besuch am Hafen',event.title,'visitor');}
  }
  if(offline&&!s.event&&s.time>=s.nextEvent)s.nextEvent=s.time+20;checkAchievements(s);
}
export function serialize(s){const result={...s,notices:[],savedAt:Date.now()};return JSON.stringify(result);}
function number(v,name,min=0,max=1e10){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Ungültiger Wert: '+name);return v;}
export function restore(input){
  const raw=typeof input==='string'?JSON.parse(input):input;if(!raw||raw.version!==VERSION)throw new Error('Dieser Spielstand gehört nicht zu dieser Spielversion.');
  const s=createGame(raw.name,raw.seed);s.name=String(raw.name||'Aurelia').replace(/[\u0000-\u001f]/g,'').slice(0,24)||'Aurelia';s.time=number(raw.time,'Spielzeit',0,1e9);s.seed=number(raw.seed,'Zufall',0,4294967295)>>>0;
  for(const key of Object.keys(s.resources))s.resources[key]=number(raw.resources?.[key],key);
  if(!Array.isArray(raw.modules)||raw.modules.length<1||raw.modules.length>121)throw new Error('Ungültige Stationsmodule.');
  const ids=new Set(),positions=new Set();s.modules=raw.modules.map(m=>{if(typeof m.type!=='string'||!Object.hasOwn(MODULES,m.type)||typeof m.id!=='string'||!/^m\d{1,9}$/.test(m.id)||ids.has(m.id))throw new Error('Ungültiges Modul.');ids.add(m.id);const x=number(m.x,'Position',-5,5),y=number(m.y,'Position',-5,5),level=number(m.level,'Stufe',1,3);if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(level)||positions.has(x+','+y)||['core','beacon'].includes(m.type)&&level!==1)throw new Error('Ungültiges Baufeld oder Modulstufe.');positions.add(x+','+y);return {id:m.id,type:m.type,x,y,level,assigned:typeof m.assigned==='string'?m.assigned:null};});
  const cores=s.modules.filter(m=>m.type==='core');if(cores.length!==1||cores[0].x!==0||cores[0].y!==0||cores[0].id!=='m1')throw new Error('Die Kommandozentrale fehlt.');
  const reached=new Set(['m1']);let grew=true;while(grew){grew=false;for(const m of s.modules)if(!reached.has(m.id)&&s.modules.some(n=>reached.has(n.id)&&Math.abs(m.x-n.x)+Math.abs(m.y-n.y)===1)){reached.add(m.id);grew=true;}}if(reached.size!==s.modules.length)throw new Error('Module ohne Verbindung.');
  if(!Array.isArray(raw.crew)||raw.crew.length<1||raw.crew.length>24)throw new Error('Ungültige Crew.');const crewIds=new Set();s.crew=raw.crew.map((c,i)=>{if(typeof c.id!=='string'||crewIds.has(c.id)||!/^(mara|ivo|pip|c\d{1,9})$/.test(c.id))throw new Error('Ungültige Crew-Kennung.');crewIds.add(c.id);const base=CREW_POOL.find(b=>b.name===c.name)||CREW_POOL[i%CREW_POOL.length];return {...base,id:c.id,name:String(c.name||base.name).slice(0,40),skill:['pilot','engineer','scientist','trader'].includes(c.skill)?c.skill:base.skill,level:Math.floor(number(c.level,'Erfahrung',1,4)),xp:number(c.xp,'Erfahrungspunkte',0,1e8)};});
  const assigned=new Set();for(const m of s.modules){if(!s.crew.some(c=>c.id===m.assigned)||assigned.has(m.assigned)||!MODULES[m.type].workers)m.assigned=null;else assigned.add(m.assigned);}
  s.techs=Array.isArray(raw.techs)?[...new Set(raw.techs.filter(id=>TECHS.some(t=>t.id===id)))]:[];
  s.expeditions=[];const flying=new Set(),flightIds=new Set();for(const e of Array.isArray(raw.expeditions)?raw.expeditions:[]){if(!SECTORS.some(z=>z.id===e.sectorId)||!crewIds.has(e.crewId)||flying.has(e.crewId)||typeof e.id!=='string'||!/^e\d{1,9}$/.test(e.id)||flightIds.has(e.id))throw new Error('Ungültige Expedition.');const startsAt=number(e.startsAt,'Abflug',0,1e9),endsAt=number(e.endsAt,'Ankunft',0,1e9);if(endsAt<=startsAt||endsAt-startsAt>600||startsAt>s.time+1)throw new Error('Ungültige Flugzeit.');flying.add(e.crewId);flightIds.add(e.id);s.expeditions.push({id:e.id,sectorId:e.sectorId,crewId:e.crewId,startsAt,endsAt,previousModule:ids.has(e.previousModule)?e.previousModule:null});}
  if(s.expeditions.length>expeditionCapacity(s))throw new Error('Zu viele Expeditionen.');for(const m of s.modules)if(flying.has(m.assigned))m.assigned=null;
  s.fragments=Array.isArray(raw.fragments)?[...new Set(raw.fragments.filter(id=>['belt','gardens','relay'].includes(id)))]:[];s.missionIndex=Math.floor(number(raw.missionIndex,'Kapitel',0,MISSIONS.length));s.achievements=Array.isArray(raw.achievements)?[...new Set(raw.achievements.filter(id=>ACHIEVEMENTS.some(a=>a.id===id)))]:[];
  for(const k of Object.keys(s.stats))s.stats[k]=number(raw.stats?.[k]??0,k,0,1e12);
  s.moraleBonus=number(raw.moraleBonus??0,'Stimmung',0,16);s.lastSalvage=number(raw.lastSalvage??-90,'Bergungsflug',-90,1e9);s.nextEvent=number(raw.nextEvent??s.time+60,'Begegnung',0,1e10);s.event=EVENTS.some(e=>e.id===raw.event?.id)?{id:raw.event.id,arrivedAt:s.time}:null;s.eventHistory=Array.isArray(raw.eventHistory)?raw.eventHistory.filter(id=>EVENTS.some(e=>e.id===id)).slice(-20):[];
  s.contracts=Array.isArray(raw.contracts)&&raw.contracts.length===2&&raw.contracts.every(n=>Number.isInteger(n)&&n>=0&&n<CONTRACTS.length)?raw.contracts:[0,1];s.contractSerial=number(raw.contractSerial??0,'Aufträge',0,1e9);s.won=s.modules.some(m=>m.type==='beacon');s.paused=raw.paused===true;s.speed=[1,2,4].includes(raw.speed)?raw.speed:1;s.savedAt=number(raw.savedAt??Date.now(),'Speicherzeit',0,1e15);
  s.nextId=Math.max(3,...s.modules.map(m=>Number(m.id.slice(1))+1),...s.crew.filter(c=>/^c\d+$/.test(c.id)).map(c=>Number(c.id.slice(1))+1),...s.expeditions.filter(e=>/^e\d+$/.test(e.id)).map(e=>Number(e.id.slice(1))+1));
  s.log=Array.isArray(raw.log)?raw.log.slice(0,70).map(l=>({time:typeof l.time==='number'&&Number.isFinite(l.time)?Math.max(0,l.time):0,title:String(l.title||'Logbuch').slice(0,100),text:String(l.text||'').slice(0,800),type:['info','story','research','mission','expedition'].includes(l.type)?l.type:'info'})):s.log;
  const limit=caps(s);for(const k of Object.keys(s.resources))s.resources[k]=Math.min(s.resources[k],limit[k]);s.notices=[];return s;
}
export function offlineProgress(s,now=Date.now()){const elapsed=s.paused?0:clamp((now-s.savedAt)/1000,0,MAX_OFFLINE);const before={...s.resources};if(elapsed>=10)advance(s,elapsed,{offline:true});s.savedAt=now;return {seconds:elapsed,rewards:Object.fromEntries(Object.keys(before).map(k=>[k,Math.max(0,s.resources[k]-before[k])]))};}
