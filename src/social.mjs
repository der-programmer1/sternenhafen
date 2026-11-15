import {TECHS,MISSIONS,ACHIEVEMENTS} from './content.mjs';

export const SOCIAL_VERSION = 1;
export const MAX_FRIENDS = 30;
export const MAX_PROFILE_CODE = 4096;
export const PUBLIC_GAME_URL = 'https://der-programmer1.github.io/sternenhafen/';
export const CATEGORIES = [
  {id:'total',name:'Gesamt',icon:'trophy'},
  {id:'station',name:'Stationsbau',icon:'build'},
  {id:'research',name:'Forschung',icon:'science'},
  {id:'exploration',name:'Entdeckungen',icon:'compass'},
  {id:'salvage',name:'Bergung',icon:'ship'}
];
const ID = /^[a-zA-Z0-9_-]{8,64}$/;
const INVALID = 'Dieser Stationslink ist unvollständig oder ungültig.';
const LIMITS = {modules:[1,121],levels:[1,363],crew:[1,24],techs:[0,TECHS.length],chapters:[0,MISSIONS.length],fragments:[0,3],achievements:[0,ACHIEVEMENTS.length],expeditions:[0,1000000],bestSalvage:[0,60],contracts:[0,1000000]};
function integer(value,min,max){if(!Number.isSafeInteger(value)||value<min||value>max)throw new Error(INVALID);return value;}
function cleanName(name){if(typeof name!=='string')throw new Error(INVALID);const value=Array.from(name.normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim()).slice(0,24).join('');if(!value)throw new Error(INVALID);return value;}

// A shared profile deliberately contains only public comparison metrics, never a game save.
export function validateProfile(raw){
  if(!raw||typeof raw!=='object'||raw.v!==SOCIAL_VERSION)throw new Error('Dieser Stationslink gehört nicht zu dieser Vergleichsversion.');
  if(typeof raw.id!=='string'||!ID.test(raw.id)||!raw.stats||typeof raw.stats!=='object'||Array.isArray(raw.stats))throw new Error(INVALID);
  const stats={};for(const [key,[min,max]] of Object.entries(LIMITS))stats[key]=integer(raw.stats[key],min,max);
  if(stats.levels<stats.modules||stats.levels>stats.modules*3||typeof raw.stats.beacon!=='boolean')throw new Error(INVALID);
  stats.beacon=raw.stats.beacon;
  return {v:SOCIAL_VERSION,id:raw.id,name:cleanName(raw.name),capturedAt:integer(raw.capturedAt,1577836800000,4102444800000),playedSeconds:integer(raw.playedSeconds,0,1000000000),stats};
}

export function profileFromGame(game,now=Date.now()){
  return validateProfile({v:SOCIAL_VERSION,id:game.stationId,name:game.name,capturedAt:now,playedSeconds:Math.floor(game.time),stats:{
    modules:game.modules.length,levels:game.modules.reduce((sum,m)=>sum+m.level,0),crew:game.crew.length,
    techs:game.techs.length,chapters:game.missionIndex,fragments:game.fragments.length,achievements:game.achievements.length,
    expeditions:Math.min(1000000,Math.floor(game.stats.expeditions)),bestSalvage:Math.min(60,Math.floor(game.stats.bestSalvage)),
    contracts:Math.min(1000000,Math.floor(game.stats.contracts)),beacon:game.modules.some(m=>m.type==='beacon')
  }});
}

export function scoreProfile(profile){
  const s=profile.stats;
  const station=s.levels*30+s.crew*40+s.chapters*60+(s.beacon?600:0);
  const research=s.techs*120+s.fragments*160+s.achievements*40;
  const exploration=Math.min(s.expeditions,100)*20+Math.min(s.contracts,100)*10;
  const salvage=Math.min(s.bestSalvage,60)*30;
  return {total:station+research+exploration+salvage,station,research,exploration,salvage};
}

export function stationTitle(points){
  if(points>=10000)return 'Lyra-Legende';
  if(points>=6000)return 'Sektorstütze';
  if(points>=3000)return 'Hafenbauer';
  if(points>=1000)return 'Pionier';
  return 'Neuankömmling';
}

export function encodeProfile(profile){
  const bytes=new TextEncoder().encode(JSON.stringify(validateProfile(profile)));
  const code='SH1.'+btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  if(code.length>MAX_PROFILE_CODE)throw new Error('Der Stationslink ist zu lang.');
  return code;
}

export function decodeProfile(code){
  if(typeof code!=='string'||code.length>MAX_PROFILE_CODE||!/^SH1\.[a-zA-Z0-9_-]+$/.test(code))throw new Error(INVALID);
  try{
    const base=code.slice(4).replace(/-/g,'+').replace(/_/g,'/');
    const binary=atob(base+'='.repeat((4-base.length%4)%4));
    if(binary.length>2800)throw new Error(INVALID);
    const value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0)));
    return validateProfile(JSON.parse(value));
  }catch(error){if(error.message?.includes('Vergleichsversion'))throw error;throw new Error(INVALID);}
}

export function makeShareLink(profile,base=PUBLIC_GAME_URL){
  const url=new URL(base);url.search='';url.hash='station='+encodeProfile(profile);return url.href;
}

export function readSharedProfile(input){
  if(typeof input!=='string'||input.length>MAX_PROFILE_CODE+512)throw new Error(INVALID);
  const value=input.trim();if(value.startsWith('SH1.'))return decodeProfile(value);
  let url;try{url=new URL(value,PUBLIC_GAME_URL);}catch{throw new Error(INVALID);}
  const code=new URLSearchParams(url.hash.replace(/^#/, '')).get('station')||url.searchParams.get('station');
  if(!code)throw new Error('In diesem Link steckt kein geteiltes Stationsprofil.');
  return decodeProfile(code);
}

export function hasSharedProfile(input){
  try{const url=new URL(input,PUBLIC_GAME_URL);return new URLSearchParams(url.hash.slice(1)).has('station')||url.searchParams.has('station');}catch{return false;}
}

export function cleanFriends(raw){
  if(!Array.isArray(raw))return [];
  const unique=new Map();
  for(const value of raw.slice(0,MAX_FRIENDS*3)){
    try{const profile=validateProfile(value),previous=unique.get(profile.id);if(!previous||profile.capturedAt>=previous.capturedAt)unique.set(profile.id,profile);}catch{}
  }
  return [...unique.values()].slice(0,MAX_FRIENDS);
}

export function upsertFriend(friends,candidate,ownId){
  const profile=validateProfile(candidate),items=cleanFriends(friends);
  if(profile.id===ownId)return {profiles:items,status:'self'};
  const index=items.findIndex(p=>p.id===profile.id);
  if(index>=0){
    if(items[index].capturedAt>profile.capturedAt)return {profiles:items,status:'older'};
    if(JSON.stringify(items[index])===JSON.stringify(profile))return {profiles:items,status:'unchanged'};
    items[index]=profile;return {profiles:items,status:'updated'};
  }
  if(items.length>=MAX_FRIENDS)throw new Error('Deine Rangliste enthält bereits 30 Stationen. Entferne zuerst einen alten Eintrag.');
  return {profiles:[...items,profile],status:'added'};
}

export function rankedProfiles(profiles,category='total'){
  if(!CATEGORIES.some(c=>c.id===category))category='total';
  const unique=new Map();for(const raw of profiles){const p=validateProfile(raw),old=unique.get(p.id);if(!old||p.capturedAt>=old.capturedAt)unique.set(p.id,p);}
  const rows=[...unique.values()].map(profile=>({profile,scores:scoreProfile(profile)}));
  rows.sort((a,b)=>b.scores[category]-a.scores[category]||a.profile.name.localeCompare(b.profile.name,'de')||a.profile.id.localeCompare(b.profile.id));
  let lastValue=null,rank=0;return rows.map((row,index)=>{const value=row.scores[category];if(value!==lastValue)rank=index+1;lastValue=value;return {...row,rank,value};});
}

export function comparisonRows(own,other){
  const a=scoreProfile(own),b=scoreProfile(other);
  return [
    ['Stationspunkte',a.total,b.total],['Module',own.stats.modules,other.stats.modules],['Modulstufen',own.stats.levels,other.stats.levels],
    ['Crew',own.stats.crew,other.stats.crew],['Technologien',own.stats.techs,other.stats.techs],['Abgeschlossene Kapitel',own.stats.chapters,other.stats.chapters],
    ['Signalfragmente',own.stats.fragments,other.stats.fragments],['Expeditionen',own.stats.expeditions,other.stats.expeditions],
    ['Lieferaufträge',own.stats.contracts,other.stats.contracts],['Beste Bergung · Fracht',own.stats.bestSalvage,other.stats.bestSalvage],
    ['Erinnerungen',own.stats.achievements,other.stats.achievements]
  ].map(([label,mine,theirs])=>({label,mine,theirs,delta:mine-theirs}));
}
