import {icon} from './art.mjs';
import {CATEGORIES,MAX_FRIENDS,profileFromGame,scoreProfile,stationTitle,makeShareLink,readSharedProfile,hasSharedProfile,cleanFriends,upsertFriend,rankedProfiles,comparisonRows} from './social.mjs';

const STORAGE_KEY='sternenhafen.friends.v1';
const $=selector=>document.querySelector(selector);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>new Intl.NumberFormat('de-DE').format(value);
const stamp=value=>new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(value);

export class SocialUI{
  constructor({getGame,isStarted,onOpen,onRerender,toast,beforeShare}){
    this.getGame=getGame;this.isStarted=isStarted;this.onOpen=onOpen;this.onRerender=onRerender;this.toast=toast;this.beforeShare=beforeShare;
    this.friends=[];this.category='total';this.selectedId=null;this.pending=null;this.linkError='';this.storageWarning='';this.signature='';
    this.readStorage();this.loadInvitation();this.bind();
  }
  loadInvitation(){
    this.pending=null;this.linkError='';
    if(hasSharedProfile(location.href)){
      try{this.pending=readSharedProfile(location.href);this.selectedId=this.pending.id;}catch(error){this.linkError=error.message;}
    }
    this.renderWelcome();
  }
  readStorage(){
    try{const raw=localStorage.getItem(STORAGE_KEY);if(raw&&raw.length>150000)throw new Error('size');this.friends=cleanFriends(raw?JSON.parse(raw):[]);}
    catch{this.friends=[];this.storageWarning='Die gespeicherte Vergleichsliste konnte nicht geladen werden. Du kannst Stationslinks erneut hinzufügen.';}
  }
  persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(this.friends));this.storageWarning='';return true;}
    catch{this.storageWarning='Diese Vergleichsliste bleibt nur für diese Sitzung erhalten. Dein Browser erlaubt gerade keine dauerhafte Speicherung.';return false;}
  }
  clearSharedURL(){
    try{const url=new URL(location.href),hash=new URLSearchParams(url.hash.slice(1));hash.delete('station');url.hash=hash.toString();url.searchParams.delete('station');history.replaceState(null,'',url.pathname+url.search+url.hash);}catch{}
  }
  hasInvitation(){return Boolean(this.pending||this.linkError);}
  getOwn(){return profileFromGame(this.getGame());}
  getRows(own=this.getOwn()){
    return rankedProfiles([...this.friends.filter(p=>p.id!==own.id),own],this.category);
  }
  getOther(own=this.getOwn()){
    if(this.pending&&this.pending.id!==own.id&&this.pending.id===this.selectedId)return this.pending;
    const selected=this.friends.find(p=>p.id===this.selectedId&&p.id!==own.id);
    return selected||this.friends.find(p=>p.id!==own.id)||null;
  }
  renderWelcome(){
    const box=$('#shared-station-welcome');if(!box)return;box.hidden=!this.hasInvitation();
    if(this.linkError){box.innerHTML='<span class="eyebrow">EIN GETEILTER STATIONSLINK</span><p>'+esc(this.linkError)+'</p><button class="small-button" data-social="dismiss">Link verwerfen</button>';return;}
    if(this.pending){const points=scoreProfile(this.pending).total;box.innerHTML='<span class="eyebrow">EINE STATION AUS DEINEM FREUNDESKREIS</span><p><strong>'+esc(this.pending.name)+'</strong> hat einen Stand mit <b>'+num(points)+' Punkten</b> geteilt.</p><button class="small-button" data-social="open">'+icon('compare')+'Station vergleichen</button>';}
  }
  render(){
    const own=this.getOwn(),scores=scoreProfile(own),rows=this.getRows(own),rank=rows.find(r=>r.profile.id===own.id)?.rank||1;
    this.signature=JSON.stringify([own.id,own.name,own.stats]);
    return '<div class="social-panel" id="social-panel">'
      +'<p class="dialog-intro">Wie wächst dein Hafen im Vergleich? Teile deinen Stationslink und merke dir die Links deiner Freunde. Fremde Stationen zeigen ihren <strong>Stand beim Teilen</strong>; dein eigener Eintrag folgt deinem aktuellen Spiel.</p>'
      +'<div id="social-invitation">'+this.invitationHTML(own)+'</div>'
      +'<div class="social-overview"><section class="social-score-card"><span class="eyebrow">DEIN STATIONSSTAND</span><div class="social-score-number"><strong id="social-own-score">'+num(scores.total)+'</strong><span>PUNKTE</span></div><h3 id="social-own-name">'+esc(own.name)+'</h3><p><span id="social-own-tier">'+stationTitle(scores.total)+'</span><span class="social-rank-pill" id="social-own-rank">Rang '+rank+' / '+rows.length+'</span></p>'
      +'<button class="primary-button" data-social="copy"'+(!this.isStarted()?' disabled':'')+'>'+icon('copy')+'Deinen Stationslink kopieren</button>'
      +(!this.isStarted()?'<small>Starte oder öffne deine Station, um deinen eigenen Stand zu teilen.</small>':'<small>Der Link enthält deinen Stationsnamen und die Vergleichswerte.</small>')
      +'<details class="social-link-details" id="social-link-details"><summary>Stationslink anzeigen</summary><label class="sr-only" for="own-share-link">Dein Stationslink</label><input readonly id="own-share-link" value="'+esc(this.isStarted()?makeShareLink(own):'')+'" aria-describedby="own-link-help"><span id="own-link-help">Link auswählen und kopieren. Deine vollständige Speicherdatei wird nicht geteilt.</span></details></section>'
      +'<section class="social-breakdown"><span class="eyebrow">DAS MACHT DEINEN HAFEN AUS</span>'
      +CATEGORIES.filter(c=>c.id!=='total').map(c=>'<div class="social-category-score">'+icon(c.icon)+'<span>'+c.name+'</span><strong data-social-score="'+c.id+'">'+num(scores[c.id])+'</strong></div>').join('')
      +'<details class="social-rules"><summary>Wie entstehen die Punkte?</summary><ul><li><b>Stationsbau:</b> 30 je Modulstufe, 40 je Crew-Person, 60 je abgeschlossenem Kapitel und 600 für das Leuchtfeuer.</li><li><b>Forschung:</b> 120 je Technologie, 160 je Signalfragment und 40 je Erinnerung.</li><li><b>Entdeckungen:</b> 20 je Expedition und 10 je Lieferung, jeweils bis zu 100.</li><li><b>Bergung:</b> 30 je Frachtstück deiner besten Bergung, bis zu 60.</li></ul><p>Die Gesamtwertung addiert alle vier Bereiche. Guthaben und Spieltempo gehen nicht in die Punktzahl ein. Die Werte stammen aus den geteilten Spielständen.</p></details></section></div>'
      +'<section class="social-ranking-section"><div class="social-section-heading"><div><span class="eyebrow">GEMEINSAM EIN STÜCK WEITER</span><h3>Deine Freundesrangliste <span id="social-list-count">'+rows.length+'</span></h3></div><button class="small-button" data-social="refresh" aria-label="Eigenen Stationsstand aktualisieren">'+icon('refresh')+'Aktualisieren</button></div>'
      +'<form id="profile-import-form" class="social-import-form"><label for="profile-link-input">Geteilten Stationslink hinzufügen</label><div><input id="profile-link-input" name="station" type="text" maxlength="4608" placeholder="Stationslink oder SH1-Profilcode einfügen …" autocomplete="off" spellcheck="false" required><button class="small-button" type="submit">'+icon('plus')+'Hinzufügen</button></div><p id="profile-import-error" class="social-inline-error" role="alert" hidden></p></form>'
      +'<div class="social-filter-tabs" role="group" aria-label="Rangliste sortieren">'+CATEGORIES.map(c=>'<button data-social="category" data-category="'+c.id+'" aria-pressed="'+(this.category===c.id)+'" class="'+(this.category===c.id?'active':'')+'">'+icon(c.icon)+c.name+'</button>').join('')+'</div>'
      +'<div id="social-ranking">'+this.rankingHTML(own)+'</div></section>'
      +'<div id="social-comparison">'+this.comparisonHTML(own)+'</div>'
      +'<p class="social-storage-note" id="social-storage-note">'+esc(this.storageWarning||'Deine Vergleichsliste wird in diesem Browser gespeichert. Mit einem neuen Link kannst du den Stand einer befreundeten Station aktualisieren.')+'</p>'
      +'</div>';
  }
  invitationHTML(own){
    if(this.linkError)return '<div class="social-invitation error"><div>'+icon('alert')+'<strong>Der Stationslink konnte nicht gelesen werden.</strong></div><p>'+esc(this.linkError)+'</p><button class="small-button" data-social="dismiss">Link verwerfen</button></div>';
    if(!this.pending)return '';
    const self=this.pending.id===own.id;
    return '<div class="social-invitation"><div>'+icon('orbit')+'<strong>'+esc(this.pending.name)+(self?' ist deine eigene Station.':' hat einen Stationsstand geteilt.')+'</strong></div><p>'+num(scoreProfile(this.pending).total)+' Punkte · Stand '+stamp(this.pending.capturedAt)+'</p><div class="social-invitation-actions"><button class="small-button" data-social="remember">'+icon(self?'check':'plus')+(self?'Verstanden':'Vergleichen und merken')+'</button><button class="text-button" data-social="dismiss">Verwerfen</button></div></div>';
  }
  rankingHTML(own){
    const rows=this.getRows(own),other=this.getOther(own);
    return '<ol class="social-ranking-list">'+rows.map(row=>{const p=row.profile,self=p.id===own.id,selected=!self&&p.id===other?.id;return '<li class="social-ranking-row '+(self?'is-own':'')+(selected?' is-selected':'')+'" data-profile-row="'+p.id+'"><span class="social-rank-number" aria-label="Rang '+row.rank+'">'+String(row.rank).padStart(2,'0')+'</span><div class="social-station-identity"><strong>'+esc(p.name)+(self?'<span class="social-you">DU</span>':'')+'</strong><small>'+(self?'Dein aktueller Stand':'Geteilt · '+stamp(p.capturedAt))+'</small></div><div class="social-ranking-points"><strong>'+num(row.value)+'</strong><small>'+CATEGORIES.find(c=>c.id===this.category).name+'</small></div><div class="social-row-actions">'+(!self?'<button class="icon-button" data-social="view" data-profile="'+p.id+'" aria-label="Mit '+esc(p.name)+' vergleichen" title="Vergleichen">'+icon('compare')+'</button><button class="icon-button social-remove" data-social="remove" data-profile="'+p.id+'" aria-label="'+esc(p.name)+' aus der Vergleichsliste entfernen" title="Eintrag entfernen">'+icon('close')+'</button>':'<span class="social-own-star" aria-hidden="true">'+icon('spark')+'</span>')+'</div></li>';}).join('')+'</ol>'
      +(rows.length===1?'<div class="social-empty-state">'+icon('orbit')+'<div><strong>Ein Hafen ist erst der Anfang.</strong><p>Kopiere deinen Stationslink und teile ihn mit Freunden. Füge ihren Antwortlink hier ein, um eure Häfen nebeneinander zu sehen.</p></div></div>':'')
      +'<p class="social-ranking-caption">'+(rows.length>1?'Gleiche Punktzahlen teilen sich denselben Rang. ':'')+'Bis zu '+MAX_FRIENDS+' geteilte Stationen · Fremde Einträge sind Momentaufnahmen.</p>';
  }
  comparisonHTML(own){
    const other=this.getOther(own);if(!other)return '';
    const ownPoints=scoreProfile(own).total,theirPoints=scoreProfile(other).total,delta=ownPoints-theirPoints;
    return '<section class="social-comparison-section"><div class="social-section-heading"><div><span class="eyebrow">ZWEI HÄFEN. VIELE MÖGLICHKEITEN.</span><h3>Dein direkter Vergleich</h3></div><span class="social-comparison-gap">'+(delta===0?'Gleichauf':delta>0?num(delta)+' Punkte Vorsprung':num(-delta)+' Punkte bis '+esc(other.name))+'</span></div>'
      +'<div class="social-comparison-head"><span>'+icon('compare')+'</span><div><strong>'+esc(own.name)+'</strong><small>Deine Station · aktuell</small></div><div><strong>'+esc(other.name)+'</strong><small>Geteilt · '+stamp(other.capturedAt)+'</small></div></div>'
      +'<table class="social-comparison-table"><caption class="sr-only">Vergleich von '+esc(own.name)+' und '+esc(other.name)+'</caption><thead><tr><th scope="col">Vergleichswert</th><th scope="col">Du</th><th scope="col">'+esc(other.name)+'</th><th scope="col">Differenz</th></tr></thead><tbody>'
      +comparisonRows(own,other).map(row=>'<tr><th scope="row">'+row.label+'</th><td>'+num(row.mine)+'</td><td>'+num(row.theirs)+'</td><td class="'+(row.delta>0?'positive':row.delta<0?'negative':'equal')+'">'+(row.delta>0?'+':'')+num(row.delta)+'</td></tr>').join('')
      +'<tr><th scope="row">Leuchtfeuer</th><td>'+icon(own.stats.beacon?'check':'minus')+'<span class="sr-only">'+(own.stats.beacon?'Errichtet':'Noch offen')+'</span></td><td>'+icon(other.stats.beacon?'check':'minus')+'<span class="sr-only">'+(other.stats.beacon?'Errichtet':'Noch offen')+'</span></td><td></td></tr></tbody></table></section>';
  }
  refresh(force=false){
    if(!$('#social-panel'))return;
    const own=this.getOwn(),key=JSON.stringify([own.id,own.name,own.stats]);if(!force&&key===this.signature)return;this.signature=key;
    const scores=scoreProfile(own),rows=this.getRows(own),rank=rows.find(r=>r.profile.id===own.id)?.rank||1;
    $('#social-own-score').textContent=num(scores.total);$('#social-own-name').textContent=own.name;$('#social-own-tier').textContent=stationTitle(scores.total);$('#social-own-rank').textContent='Rang '+rank+' / '+rows.length;$('#social-list-count').textContent=rows.length;
    document.querySelectorAll('[data-social-score]').forEach(el=>el.textContent=num(scores[el.dataset.socialScore]));
    const linkInput=$('#own-share-link');if(this.isStarted()&&linkInput&&document.activeElement!==linkInput)linkInput.value=makeShareLink(own);
    $('#social-ranking').innerHTML=this.rankingHTML(own);$('#social-comparison').innerHTML=this.comparisonHTML(own);
    document.querySelectorAll('[data-social="category"]').forEach(b=>{const active=b.dataset.category===this.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }
  rerender(clearInput=false){const draft=$('#profile-link-input')?.value||'';this.onRerender();if(!clearInput&&$('#profile-link-input'))$('#profile-link-input').value=draft;}
  remember(profile){
    const outcome=upsertFriend(this.friends,profile,this.getGame().stationId);
    this.friends=outcome.profiles;if(outcome.status!=='self')this.selectedId=profile.id;
    const durable=outcome.status==='self'?true:this.persist();this.pending=null;this.linkError='';this.clearSharedURL();this.renderWelcome();this.rerender(true);
    const messages={self:['Das ist deine Station.','Dein aktueller Stand ist bereits in der Rangliste.'],older:['Der neuere Stand bleibt erhalten.','Diese Station ist schon mit einem aktuelleren Link gemerkt.'],unchanged:['Schon an Bord.','Dieser Stationsstand steht bereits in deiner Rangliste.'],updated:['Stationsstand aktualisiert.','Der neue Link ersetzt den vorherigen Stand derselben Station.'],added:['Ein neuer Hafen in deiner Rangliste.',profile.name+' ist jetzt zum Vergleich gemerkt.']};
    const [title,text]=messages[outcome.status];this.toast(title,durable?text:'Der Eintrag bleibt für diese Sitzung erhalten.');
  }
  async copyLink(button){
    if(!this.isStarted())return;this.beforeShare?.();const link=makeShareLink(this.getOwn());const input=$('#own-share-link');if(input)input.value=link;
    button.disabled=true;
    try{await navigator.clipboard.writeText(link);this.toast('Stationslink kopiert.','Teile ihn mit Freunden, damit sie ihren Hafen mit deinem vergleichen können.');}
    catch{const details=$('#social-link-details');if(details)details.open=true;if(input){input.focus();input.select();}this.toast('Dein Stationslink ist bereit.','Wähle „Kopieren“, um den markierten Link zu teilen.');}
    finally{button.disabled=false;}
  }
  bind(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-social]');if(!button||button.disabled)return;
      const action=button.dataset.social;
      if(action==='open'){this.onOpen();return;}
      if(action==='copy'){void this.copyLink(button);return;}
      if(action==='refresh'){this.refresh(true);return;}
      if(action==='category'){if(CATEGORIES.some(c=>c.id===button.dataset.category)){this.category=button.dataset.category;this.refresh(true);}return;}
      if(action==='view'){this.selectedId=button.dataset.profile;this.refresh(true);$('#social-comparison')?.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
      if(action==='remember'){try{if(this.pending)this.remember(this.pending);}catch(error){this.toast('Der Eintrag wurde nicht hinzugefügt.',error.message,'error');}return;}
      if(action==='dismiss'){this.pending=null;this.linkError='';this.clearSharedURL();this.renderWelcome();this.rerender();return;}
      if(action==='remove'){
        this.friends=this.friends.filter(p=>p.id!==button.dataset.profile);if(this.selectedId===button.dataset.profile)this.selectedId=null;this.persist();this.rerender();this.toast('Eintrag entfernt.','Mit einem Stationslink kannst du ihn jederzeit wieder hinzufügen.');
      }
    });
    document.addEventListener('submit',event=>{
      if(event.target.id!=='profile-import-form')return;event.preventDefault();
      try{this.remember(readSharedProfile($('#profile-link-input').value));}
      catch(error){const message=$('#profile-import-error');message.hidden=false;message.textContent=error.message;$('#profile-link-input').setAttribute('aria-invalid','true');}
    });
    document.addEventListener('input',event=>{if(event.target.id==='profile-link-input'){event.target.removeAttribute('aria-invalid');$('#profile-import-error').hidden=true;}});
    window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){this.readStorage();this.rerender();}});
    window.addEventListener('hashchange',()=>{this.loadInvitation();if(this.hasInvitation()&&this.isStarted())this.onOpen();else this.rerender();});
  }
}
