import {MODULES} from './content.mjs';
import {buildSites,isBuildable,moduleAt} from './engine.mjs';

const PATHS={
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 gem:'<path d="m7 3-5 6 10 13L22 9l-5-6Zm-5 6h20M7 3l5 19L17 3"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15.5 7.5c-5-3-8 5-4.5 7.5 1.5 1 3 1 4.5 0M6 10h8M6 13h7"/>',
 alloy:'<path d="m4 6 10-3 6 5-1 10-10 3-6-5Zm0 0 6 5 10-3M10 11l-1 10"/>',
 science:'<path d="M9 3h6m-5 0v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10"/><circle cx="12" cy="17" r=".6"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
 crew:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-2-4"/>',
 heart:'<path d="M20.8 5.5a5 5 0 0 0-7.1 0L12 7.2l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 22l8.8-9.4a5 5 0 0 0 0-7.1Z"/>',
 build:'<path d="m3 8 9-5 9 5-9 5Zm0 0v9l9 5 9-5V8M12 13v9"/>',
 orbit:'<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><circle cx="20" cy="5" r="2"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
 layers:'<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5"/>',
 message:'<path d="M21 4H3v14h5l4 4v-4h9ZM7 9h10M7 13h6"/>',
 radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 20 4"/>',
 refresh:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/>',
 wave:'<path d="M2 12h3l3-8 5 16 4-12 2 4h3"/>',
 spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM20 2v4m-2-2h4"/>',
 leaf:'<path d="M21 3C9 2 2 8 6 16c8 6 15-1 15-13ZM3 22 17 8"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 close:'<path d="m5 5 14 14M5 19 19 5"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 pause:'<path d="M7 4h3v16H7Zm7 0h3v16h-3Z"/>',
 play:'<path d="m7 3 15 9-15 9Z"/>',
 volume:'<path d="M3 9h4l5-5v16l-5-5H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 mute:'<path d="M3 9h4l5-5v16l-5-5H3Zm14-1 5 8m0-8-5 8"/>',
 settings:'<path d="m9 3-1 3-3 1-2 4 2 3-1 3 4 3 3-1 3 2 4-2 1-4 3-2-1-5-4-1-2-3Z"/><circle cx="12" cy="12" r="3"/>',
 zoom:'<circle cx="10" cy="10" r="7"/><path d="m16 16 6 6M7 10h6m-3-3v6"/>',
 fit:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
 grid:'<path d="M3 3h18v18H3Zm6 0v18m6-18v18M3 9h18M3 15h18"/>',
 book:'<path d="M12 5C8 2 3 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-1-10 1Zm0 0v15"/>',
 trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0Zm0 2H3v4c0 3 2 4 5 4m9-8h4v4c0 3-2 4-5 4M12 14v6m-5 2h10"/>',
 rocket:'<path d="M14 3h7v7L11 20l-7-7Zm-9 9-3 1v7h7l1-3M4 21l-2 1m14-15h.01"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
 download:'<path d="M12 3v13m-5-5 5 5 5-5M3 17v4h18v-4"/>',
 upload:'<path d="M12 17V4m-5 5 5-5 5 5M3 17v4h18v-4"/>',
 alert:'<path d="m12 3 10 18H2Zm0 6v5m0 3v1"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 minus:'<path d="M4 12h16"/>',
 ship:'<path d="m12 2 7 15-7-3-7 3Zm-3 17 3 3 3-3"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 16h12l1-16M10 10v7m4-7v7"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3v1"/>'
};
export const icon=(name,cls='')=>'<svg class="icon '+cls+'" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(PATHS[name]||PATHS.spark)+'</svg>';
export const resourceIcon=key=>icon(({credits:'coin',alloy:'alloy',crystal:'gem',science:'science',relic:'wave'})[key]);
export function portrait(c){return '<svg class="portrait" viewBox="0 0 40 40" aria-hidden="true" shape-rendering="crispEdges"><rect width="40" height="40" rx="7" fill="'+c.color+'18"/><path fill="'+c.color+'" d="M9 31h4v-6h14v6h4v9H9Z"/><path fill="'+c.hair+'" d="M11 11h3V8h12v3h3v15H11Z"/><path fill="'+c.skin+'" d="M14 14h12v13H14Zm3 13h6v4h-6Z"/><path fill="'+(c.robot?'#9ae7db':'#233141')+'" d="M16 18h2v3h-2Zm7 0h2v3h-2Z"/><path fill="'+c.hair+'" d="M14 11h12v5H14Zm0 0h4v10h-4Z"/>'+(c.robot?'<path fill="#75f5dc" d="M15 19h4v2h-4Zm7 0h4v2h-4Z"/>':'')+'<path fill="#ffffff44" d="M14 32h4v6h-4Z"/></svg>';}
export function moduleIcon(type){const d=MODULES[type];let shapes='';
  if(type==='solar')shapes='<path fill="#23577b" stroke="#63c8e0" d="M2 14h13v15H2Zm23-5h13v15H25Z"/><path stroke="#55a1bc" d="M7 14v15m4-15v15M2 19h13M2 24h13m15-15v15m4-15v15m-9-10h13m-13 5h13"/><path fill="#a9cbd2" d="M17 14h6v17h-6Z"/>';
  else if(type==='garden')shapes='<path fill="#466862" d="m4 26 16-7 16 7-16 9Z"/><path fill="#79b57d" d="M8 12h9v13H8Zm13-5h9v17h-9Z"/><path fill="#a5d99b" d="M6 14h13v5H6Zm13-5h13v6H19Z"/>';
  else if(type==='lab'||type==='observatory')shapes='<path fill="#38536b" d="m5 28 15-7 15 7-15 8Z"/><path fill="#6e9eaf" d="M8 20a12 12 0 0 1 24 0v8H8Z"/><path fill="#9dd1db" d="M12 13h6v12h-6Z"/><path fill="#91ead9" d="M20 10h4v15h-4Z"/>';
  else if(type==='dock')shapes='<path fill="#3d6870" d="m3 23 17-8 17 8-17 10Z"/><path fill="none" stroke="#83d7c5" d="m10 24 10-5 10 5-10 5Z"/><path fill="#c9d6d7" d="m20 5 7 14-7-3-7 3Z"/>';
  else if(type==='mine'||type==='refinery')shapes='<path fill="#795d43" d="m4 27 16-8 16 8-16 9Z"/><path fill="#7e8e9d" d="M10 12h10v17H10Zm13-5h6v18h-6Z"/><path fill="#e6b96d" d="M9 13h12v5H9Zm-3 7h9v8H6Z"/><path fill="#62d7d0" d="M24 9h3v10h-3Z"/>';
  else if(type==='beacon')shapes='<path fill="#536a79" d="m6 30 14-6 14 6-14 7Z"/><path fill="#c3b082" d="M17 7h6v23h-6Z"/><path fill="#fff0b0" d="m20 1 4 9-4 5-4-5Z"/><path stroke="#e8d18a" fill="none" d="M7 14q13 8 26 0M4 10q16 11 32 0"/>';
  else shapes='<path fill="#5e6e81" d="m5 17 15-7 15 7v15l-15 7-15-7Z"/><path fill="'+d.color+'" d="m5 17 15-7 15 7-15 8Z"/><path fill="#2e4156" d="m20 25 15-8v15l-15 7Z"/><path fill="#efcf8c" d="M9 24h4v5H9Zm7 3h3v5h-3Z"/><path fill="#8dd7d2" d="m24 25 6-3v5l-6 3Z"/>';
  return '<svg class="module-icon" viewBox="0 0 40 40" shape-rendering="crispEdges" aria-hidden="true">'+shapes+'</svg>';
}

const poly=(ctx,points,fill,stroke)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.7;ctx.stroke();}};
function box(ctx,x,y,w,d,h,top='#426173',left='#263e50',right='#1c2d40'){
  poly(ctx,[[x-w/2,y-h],[x,y+d/2-h],[x,y+d/2],[x-w/2,y]],left,'#05101c66');
  poly(ctx,[[x,y+d/2-h],[x+w/2,y-h],[x+w/2,y],[x,y+d/2]],right,'#05101c66');
  poly(ctx,[[x-w/2,y-h],[x,y-d/2-h],[x+w/2,y-h],[x,y+d/2-h]],top,'#8ea9b028');
}
function glow(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}

export function drawModule(ctx,type,x,y,level,time,{ghost=false,selected=false}={}){
  const d=MODULES[type];ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#01070c55';ctx.beginPath();ctx.ellipse(0,17,45,16,0,0,Math.PI*2);ctx.fill();
  box(ctx,0,5,72,36,6,'#2b4355','#152b3c','#102333');
  poly(ctx,[[-30,0],[0,-15],[30,0],[0,15]],'#304b5c','#78939c44');
  ctx.fillStyle=d.color;ctx.globalAlpha=.6;ctx.fillRect(-3,16,6,2);ctx.globalAlpha=1;
  if(type==='solar'){
    box(ctx,0,-4,14,12,16,'#6b8c9c','#3d596e','#2b4156');
    for(const side of [-1,1]){ctx.save();ctx.translate(side*26,-22);poly(ctx,[[-22,0],[4,-12],[24,-1],[-2,12]],'#154466','#70beca');for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(-22+i*6.5,-i*3);ctx.lineTo(-2+i*6.5,12-i*3);ctx.strokeStyle='#4f91b2';ctx.lineWidth=.6;ctx.stroke();}for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(-22+i*6, i*3.5);ctx.lineTo(4+i*6,-12+i*3.5);ctx.stroke();}ctx.restore();}
    glow(ctx,0,-10,21,'#4ac4d81c');
  }else if(type==='mine'){
    box(ctx,0,-5,42,24,21,'#7a8791','#465263','#344252');box(ctx,13,-15,14,11,29,'#c2a16b','#786346','#604e3d');
    ctx.fillStyle='#eac07c';ctx.fillRect(9,-47+Math.sin(time*3)*2,5,17);ctx.fillStyle='#8ad8d6';ctx.fillRect(-15,-23,4,6);ctx.fillRect(-8,-20,4,6);box(ctx,-16,7,13,9,9,'#ba9464','#78613f','#5a4938');
    glow(ctx,12,-25,13,'#e5ac4530');
  }else if(type==='core'){
    box(ctx,0,-3,53,31,27,'#708597','#384e63','#2a4054');box(ctx,-2,-30,34,21,15,'#9badb7','#526b7c','#3b566c');
    ctx.fillStyle='#a1e3dc';ctx.fillRect(-21,-23,7,5);ctx.fillRect(-11,-18,7,5);poly(ctx,[[6,-22],[20,-29],[20,-22],[6,-15]],'#72b8cd');
    ctx.strokeStyle='#acbbc1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4,-45);ctx.lineTo(4,-65);ctx.stroke();ctx.fillStyle='#e9b56e';ctx.fillRect(1,-68,6,4);glow(ctx,4,-66,17,'#f1c78026');
    ctx.fillStyle='#e9c18a';ctx.fillRect(-4,-36,4,3);ctx.fillRect(3,-39,4,3);
  }else if(type==='habitat'||type==='lounge'||type==='market'){
    const isLounge=type==='lounge',isMarket=type==='market';box(ctx,0,-4,51,29,29,isLounge?'#906478':isMarket?'#a28b68':'#8095a4',isLounge?'#554354':'#526276',isLounge?'#41384c':'#394b61');
    box(ctx,0,-33,53,30,4,isLounge?'#cb8ca1':isMarket?'#d5b17c':'#adbdc4','#63798a','#435e72');
    ctx.fillStyle='#edca8e';for(let i=0;i<3;i++)poly(ctx,[[-21+i*7,-25+i*3.8],[-17+i*7,-23+i*3.8],[-17+i*7,-16+i*3.8],[-21+i*7,-18+i*3.8]],ctx.fillStyle);
    for(let i=0;i<3;i++)poly(ctx,[[5+i*6,-16-i*3.4],[9+i*6,-18-i*3.4],[9+i*6,-11-i*3.4],[5+i*6,-9-i*3.4]],isMarket?'#8bdbce':'#e9c58b');
    if(isLounge){ctx.fillStyle='#edb5bd';ctx.fillRect(-7,-48,14,5);glow(ctx,0,-41,30,'#de7fa720');}
    if(isMarket){box(ctx,-20,8,15,10,10,'#d4ad71','#8d6d43','#6c5339');ctx.fillStyle='#91dfba';ctx.fillRect(2,-48,4,10);ctx.fillRect(-2,-45,12,3);}
  }else if(type==='lab'){
    box(ctx,0,-5,47,28,12,'#547184','#34495e','#2a4054');const g=ctx.createLinearGradient(-20,-42,20,-15);g.addColorStop(0,'#6ba9bf');g.addColorStop(.5,'#36638c');g.addColorStop(1,'#27496c');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-25,22,20,0,Math.PI,0);ctx.lineTo(22,-17);ctx.ellipse(0,-17,22,11,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.strokeStyle='#9dd9d8';ctx.lineWidth=.7;ctx.stroke();ctx.beginPath();ctx.ellipse(0,-24,10,20,0,Math.PI,0);ctx.stroke();ctx.fillStyle='#9be6dc';for(let i=0;i<3;i++){const a=time*.7+i*2;ctx.fillRect(Math.cos(a)*12,-25+Math.sin(a)*5,2,2);}glow(ctx,0,-25,25,'#65bfbf20');
  }else if(type==='dock'){
    box(ctx,0,-3,60,32,9,'#3d6b72','#284956','#1b3648');poly(ctx,[[-20,-10],[0,-20],[20,-10],[0,0]],null,'#92d7c5');ctx.strokeStyle='#8bdac0';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-8,-9);ctx.lineTo(0,-13);ctx.lineTo(8,-9);ctx.moveTo(-4,-7);ctx.lineTo(4,-11);ctx.stroke();for(const side of[-1,1])box(ctx,side*25,-3,8,6,14,'#8dafa9','#426d76','#2e515f');
    ctx.fillStyle=Math.sin(time*2)>0?'#86dbaf':'#406c67';ctx.fillRect(-27,-20,3,3);ctx.fillRect(24,-20,3,3);
  }else if(type==='storage'){
    for(const[x0,y0]of [[-16,0],[9,8],[13,-8]]){box(ctx,x0,y0,23,14,19,'#8394a4','#53657b','#3b5066');ctx.strokeStyle='#c4b38b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0-9,y0-18);ctx.lineTo(x0,y0-13);ctx.lineTo(x0+9,y0-18);ctx.stroke();}
  }else if(type==='garden'){
    box(ctx,0,-4,53,30,8,'#4d7566','#35564f','#294746');poly(ctx,[[-19,-9],[0,-18],[19,-9],[0,1]],'#3c856e');for(const [tx,ty]of [[-13,-15],[9,-12],[2,-25]]){ctx.fillStyle='#96836a';ctx.fillRect(tx-1,ty-10,3,15);ctx.fillStyle='#71af82';ctx.fillRect(tx-7,ty-17,14,10);ctx.fillStyle='#92cf91';ctx.fillRect(tx-5,ty-22,10,8);ctx.fillStyle='#afdba0';ctx.fillRect(tx-3,ty-25,6,6);}glow(ctx,0,-19,24,'#82d79c17');
  }else if(type==='refinery'){
    box(ctx,0,-2,47,27,18,'#59677b','#3c465a','#2b364e');for(const side of[-1,1]){box(ctx,side*12,-14,15,10,27,'#b7b1a3','#6d6f76','#4b515f');ctx.fillStyle='#e8b26b';ctx.fillRect(side*12-3,-35,6,12);glow(ctx,side*12,-28,13,'#e4a15725');}ctx.fillStyle='#9d7fd2';ctx.fillRect(-7,-16,14,7);
  }else if(type==='observatory'){
    box(ctx,0,-4,40,25,19,'#75849e','#46556f','#34415d');ctx.save();ctx.translate(0,-32);ctx.rotate(Math.sin(time*.12)*.25-.4);ctx.fillStyle='#93a8c9';ctx.beginPath();ctx.ellipse(0,-4,25,13,0,0,Math.PI);ctx.lineTo(25,-4);ctx.closePath();ctx.fill();ctx.strokeStyle='#c0d2e5';ctx.beginPath();ctx.ellipse(0,-4,25,7,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-20);ctx.stroke();ctx.fillStyle='#8ce7db';ctx.fillRect(-2,-23,4,4);ctx.restore();
  }else if(type==='beacon'){
    box(ctx,0,-5,48,28,13,'#b2a77f','#716a55','#535345');box(ctx,0,-17,15,10,57,'#d5c695','#877f62','#646a5d');const pulse=(Math.sin(time*2)+1)/2;glow(ctx,0,-77,45+pulse*10,'#f4d99a35');poly(ctx,[[0,-95],[9,-78],[0,-65],[-9,-78]],'#ffecb1','#fff4d2');for(let i=0;i<3;i++){ctx.globalAlpha=.3+Math.sin(time*1.5+i)*.2;ctx.strokeStyle='#efd994';ctx.beginPath();ctx.ellipse(0,-61+i*15,21+i*5,7+i*2,0,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
  }
  if(level>1){ctx.fillStyle='#f3d390';for(let i=0;i<level;i++)ctx.fillRect(20+i*4,7-i*2,2,3);}
  if(selected){poly(ctx,[[-37,0],[0,-19],[37,0],[0,19]],null,'#90e5db');glow(ctx,0,2,37,'#68d8d022');}
  ctx.restore();
}

export class StationRenderer{
  constructor(canvas,options){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.options=options;this.camera={x:0,y:0,zoom:1.55};this.buildType=null;this.selected=null;this.hover=null;this.grid=false;this.effects=[];this.lastDraw=0;this.w=800;this.h=600;this.stars=Array.from({length:160},(_,i)=>({x:((i*7919+31)%10000)/10000,y:((i*3571+17)%10000)/10000,r:i%7===0?1.3:.6,a:.2+(i%9)/15}));this.resize=new ResizeObserver(()=>this.size());this.resize.observe(canvas);this.size();this.bind();}
  size(){const rect=this.canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.dpr=dpr;}
  project(x,y){return {x:(x-y)*37,y:(x+y)*18.5};}
  screen(x,y){const p=this.project(x,y);return {x:this.w/2+this.camera.x+p.x*this.camera.zoom,y:this.h*.54+this.camera.y+p.y*this.camera.zoom};}
  tile(px,py){const x=(px-this.w/2-this.camera.x)/this.camera.zoom,y=(py-this.h*.54-this.camera.y)/this.camera.zoom;return {x:Math.round((x/37+y/18.5)/2),y:Math.round((y/18.5-x/37)/2)};}
  fit(){const ms=this.options.getState().modules;const points=ms.map(m=>this.project(m.x,m.y));const minX=Math.min(...points.map(p=>p.x))-80,maxX=Math.max(...points.map(p=>p.x))+80,minY=Math.min(...points.map(p=>p.y))-115,maxY=Math.max(...points.map(p=>p.y))+70;this.camera.zoom=Math.max(.55,Math.min(1.9,(this.w-100)/(maxX-minX),(this.h-170)/(maxY-minY)));this.camera.x=-(minX+maxX)/2*this.camera.zoom;this.camera.y=-(minY+maxY)/2*this.camera.zoom;}
  zoom(amount){this.camera.zoom=Math.max(.5,Math.min(2.5,this.camera.zoom*amount));}
  effect(x,y,text,color='#91e0c7'){this.effects.push({x,y,text,color,start:performance.now()});}
  pick(px,py){const s=this.options.getState();const ordered=[...s.modules].sort((a,b)=>(b.x+b.y)-(a.x+a.y));return ordered.find(m=>{const p=this.screen(m.x,m.y);return Math.abs(px-p.x)<31*this.camera.zoom&&py>p.y-(m.type==='beacon'?100:60)*this.camera.zoom&&py<p.y+18*this.camera.zoom;});}
  bind(){const c=this.canvas;let down=null;const point=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
    c.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=point(e);down={...p,cx:this.camera.x,cy:this.camera.y,moved:false};c.setPointerCapture(e.pointerId);c.focus({preventScroll:true});});
    c.addEventListener('pointermove',e=>{const p=point(e);if(down){const dx=p.x-down.x,dy=p.y-down.y;if(Math.hypot(dx,dy)>5)down.moved=true;if(down.moved){this.camera.x=down.cx+dx;this.camera.y=down.cy+dy;}}this.hover=this.tile(p.x,p.y);const m=this.pick(p.x,p.y);c.style.cursor=this.buildType?'crosshair':down?.moved?'grabbing':m?'pointer':'grab';this.options.onHover?.(this.buildType?this.hover:m);});
    c.addEventListener('pointerup',e=>{if(!down)return;const p=point(e);if(!down.moved){const tile=this.tile(p.x,p.y);if(this.buildType)this.options.onBuild(this.buildType,tile.x,tile.y);else{const m=this.pick(p.x,p.y);this.selected=m?.id||null;this.options.onSelect(m||null);}}down=null;c.style.cursor=this.buildType?'crosshair':'grab';});
    c.addEventListener('pointercancel',()=>down=null);c.addEventListener('pointerleave',()=>{if(!down){this.hover=null;this.options.onHover?.(null);}});
    c.addEventListener('wheel',e=>{e.preventDefault();const p=point(e),old=this.camera.zoom;this.zoom(Math.exp(-e.deltaY*.001));const factor=this.camera.zoom/old;this.camera.x=p.x-this.w/2-(p.x-this.w/2-this.camera.x)*factor;this.camera.y=p.y-this.h*.54-(p.y-this.h*.54-this.camera.y)*factor;},{passive:false});
    c.addEventListener('keydown',e=>{if(this.buildType&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)){e.preventDefault();if(!this.hover)this.hover=buildSites(this.options.getState())[0]||{x:0,y:0};if(e.key==='ArrowUp')this.hover.y--;if(e.key==='ArrowDown')this.hover.y++;if(e.key==='ArrowLeft')this.hover.x--;if(e.key==='ArrowRight')this.hover.x++;if(e.key==='Enter')this.options.onBuild(this.buildType,this.hover.x,this.hover.y);}if(e.key==='Escape')this.options.onCancel?.();});
  }
  draw(now){if(now-this.lastDraw<32)return;this.lastDraw=now;const ctx=this.ctx,w=this.w,h=this.h,s=this.options.getState();if(!w||!h)return;const time=s.time;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a1323';ctx.fillRect(0,0,w,h);
    const neb=ctx.createRadialGradient(w*.35,h*.65,0,w*.35,h*.65,w*.7);neb.addColorStop(0,'#173e4b42');neb.addColorStop(1,'transparent');ctx.fillStyle=neb;ctx.fillRect(0,0,w,h);
    for(const star of this.stars){ctx.globalAlpha=star.a*(.7+.3*Math.sin(now*.0004+star.x*20));ctx.fillStyle='#b6cfdf';ctx.fillRect(star.x*w,star.y*h,star.r,star.r);}ctx.globalAlpha=1;
    ctx.save();ctx.translate(w*.84,h*.21);ctx.rotate(-.3);const planet=ctx.createRadialGradient(-34,-32,5,15,5,110);planet.addColorStop(0,'#7d87994f');planet.addColorStop(.55,'#3a53635a');planet.addColorStop(1,'#142438');ctx.fillStyle=planet;ctx.beginPath();ctx.arc(0,0,94,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(0,0,94,0,Math.PI*2);ctx.clip();for(let i=-95;i<95;i+=10){ctx.strokeStyle=i%20===5?'#9ea8a909':'#0b16281f';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(0,i,120,25,0,0,Math.PI*2);ctx.stroke();}ctx.restore();ctx.strokeStyle='#a1b2b00c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,145,30,-.25,0,Math.PI*2);ctx.stroke();ctx.restore();
    ctx.save();ctx.translate(w/2+this.camera.x,h*.54+this.camera.y);ctx.scale(this.camera.zoom,this.camera.zoom);ctx.imageSmoothingEnabled=false;
    const ordered=[...s.modules].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
    ctx.strokeStyle='#5782941a';ctx.lineWidth=.6;ctx.setLineDash([3,8]);ctx.beginPath();ctx.ellipse(0,14,200,90,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    if(this.grid){for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++){const p=this.project(x,y);poly(ctx,[[p.x-36,p.y],[p.x,p.y-18],[p.x+36,p.y],[p.x,p.y+18]],null,'#5a8c9b15');}}
    for(const m of ordered)for(const n of ordered)if(n.id>m.id&&Math.abs(n.x-m.x)+Math.abs(n.y-m.y)===1){const a=this.project(m.x,m.y),b=this.project(n.x,n.y);ctx.strokeStyle='#496472';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(a.x,a.y+4);ctx.lineTo(b.x,b.y+4);ctx.stroke();ctx.strokeStyle='#162c3d';ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle='#78aea52c';ctx.lineWidth=1;ctx.stroke();}
    if(this.buildType||this.grid){for(const tile of buildSites(s)){const p=this.project(tile.x,tile.y);poly(ctx,[[p.x-34,p.y],[p.x,p.y-17],[p.x+34,p.y],[p.x,p.y+17]],'#65bbb00b','#7dbab344');if(this.buildType){ctx.strokeStyle='#7ab6ad55';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x,p.y+3);ctx.stroke();}}}
    for(const m of ordered){const p=this.project(m.x,m.y);drawModule(ctx,m.type,p.x,p.y,m.level,time,{selected:m.id===this.selected||(!this.buildType&&this.hover?.x===m.x&&this.hover?.y===m.y)});if(MODULES[m.type].workers&&!m.assigned){ctx.fillStyle='#e6bb7d';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('!',p.x+26,p.y-35);}}
    for(let i=0;i<s.crew.length;i++){const c=s.crew[i];if(s.expeditions.some(e=>e.crewId===c.id))continue;const a=ordered[i%ordered.length],b=ordered[(i+1)%ordered.length];const pa=this.project(a.x,a.y),pb=this.project(b.x,b.y);let t=(Math.sin(time*.12+i*2)+1)/2;const x=pa.x+(pb.x-pa.x)*t-10,y=pa.y+(pb.y-pa.y)*t+10;ctx.fillStyle='#030c1577';ctx.fillRect(x-3,y+3,8,2);ctx.fillStyle=c.color;ctx.fillRect(x,y-4,4,6);ctx.fillStyle=c.skin;ctx.fillRect(x,y-7,4,3);ctx.fillStyle='#bbcbd6';ctx.fillRect(x,y+2,1,2);ctx.fillRect(x+3,y+2,1,2);}
    if(s.event){const x=-160+Math.sin(time*.4)*5,y=-80+Math.sin(time*.65)*3;glow(ctx,x-16,y,22,'#77d6e02b');poly(ctx,[[x+24,y],[x+4,y-12],[x-16,y-6],[x-16,y+6],[x+4,y+12]],'#8b9eae','#b1c5c8');ctx.fillStyle='#83e1d4';ctx.fillRect(x+6,y-3,9,5);ctx.fillStyle='#b3acdf';ctx.fillRect(x-24,y-3,10,6);}
    if(this.buildType&&this.hover){const p=this.project(this.hover.x,this.hover.y),valid=isBuildable(s,this.hover.x,this.hover.y);ctx.globalAlpha=.48;drawModule(ctx,this.buildType,p.x,p.y,1,time,{ghost:true});ctx.globalAlpha=1;poly(ctx,[[p.x-36,p.y],[p.x,p.y-18],[p.x+36,p.y],[p.x,p.y+18]],valid?'#68d8a51c':'#e9948a1c',valid?'#90d5b8':'#e6988e');}
    this.effects=this.effects.filter(e=>now-e.start<1600);for(const e of this.effects){const p=this.project(e.x,e.y),t=(now-e.start)/1600;ctx.globalAlpha=1-t;ctx.fillStyle=e.color;ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(e.text,p.x,p.y-55-t*35);}ctx.globalAlpha=1;ctx.restore();
    const fade=ctx.createLinearGradient(0,h-110,0,h);fade.addColorStop(0,'transparent');fade.addColorStop(1,'#080f1c80');ctx.fillStyle=fade;ctx.fillRect(0,h-110,w,110);
  }
}
