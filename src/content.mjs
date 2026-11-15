export const VERSION = 1;
export const RESOURCE_NAMES = {credits:'Credits',alloy:'Legierung',crystal:'Kristalle',science:'Wissen',relic:'Signalfragmente'};
export const MODULES = {
  core:{name:'Kommandozentrale',short:'Zentrale',group:'basis',description:'Das Herz deiner Station. Liefert Grundenergie, drei Schlafplätze und ein kleines Versorgungsbudget.',cost:{},power:3,housing:3,produces:{credits:1.2},color:'#e9b66d',max:1},
  solar:{name:'Solarsegel',short:'Solarsegel',group:'basis',description:'Fängt das Licht von Lyra ein. Mehr Energie hält deine Produktion am Laufen.',cost:{credits:55,alloy:24},power:7,color:'#66d8ee'},
  mine:{name:'Asteroidenbohrer',short:'Bohrer',group:'produktion',description:'Gewinnt Legierung aus kleinen Felsbrocken. Braucht eine Person und Energie.',cost:{credits:75,alloy:32},energy:2,workers:1,produces:{alloy:.72},color:'#e8b66c'},
  habitat:{name:'Wohnmodul',short:'Quartier',group:'leben',description:'Ein Fenster ins All und vier neue Plätze für die Crew. Neue Menschen kommen über die Crew-Liste.',cost:{credits:90,alloy:38},energy:1,housing:4,color:'#f1b8a0'},
  lab:{name:'Forschungslabor',short:'Labor',group:'produktion',description:'Aus Neugier wird Wissen. Eine Person erforscht neue Möglichkeiten für deine Station.',cost:{credits:110,alloy:45},energy:3,workers:1,produces:{science:.30},color:'#b1a2f8'},
  dock:{name:'Andockbucht',short:'Dock',group:'basis',description:'Dein Tor zum Sektor. Jede Bucht ermöglicht eine gleichzeitige Expedition.',cost:{credits:130,alloy:52},energy:2,color:'#7ce3bb'},
  market:{name:'Handelskontor',short:'Kontor',group:'produktion',description:'Versorgt vorbeiziehende Schiffe und erwirtschaftet zusätzliche Credits.',cost:{credits:160,alloy:65},energy:2,workers:1,produces:{credits:2.8},color:'#e6c682'},
  storage:{name:'Frachtdepot',short:'Depot',group:'basis',description:'Erweitert das Lager um 450 Legierung und 250 Kristalle pro Stufe.',cost:{credits:100,alloy:42},storage:true,color:'#99b2ce'},
  garden:{name:'Sternengarten',short:'Garten',group:'leben',description:'Grün zwischen Stahl und Sternen. Hebt die Stimmung und damit die Leistung der ganzen Crew.',cost:{credits:150,alloy:50,crystal:12},energy:2,morale:10,tech:'ecology',color:'#94d68d'},
  refinery:{name:'Kristallraffinerie',short:'Raffinerie',group:'produktion',description:'Gewinnt seltene Kristalle aus kosmischem Staub. Eine verlässliche Quelle für fortgeschrittene Forschung.',cost:{credits:220,alloy:85,crystal:12},energy:4,workers:1,produces:{crystal:.16},tech:'automation',color:'#efb27d'},
  observatory:{name:'Observatorium',short:'Sternwarte',group:'produktion',description:'Ein großes Auge für das Unbekannte. Erzeugt Wissen und verstärkt Expeditionsfunde.',cost:{credits:320,alloy:110,crystal:25},energy:4,workers:1,produces:{science:.65},tech:'scanning',color:'#a6b7ff'},
  lounge:{name:'Nebula-Lounge',short:'Lounge',group:'leben',description:'Ein warmer Tee, eine gute Geschichte. +12 Stimmung für die ganze Crew – und damit mehr Freude an der Arbeit.',cost:{credits:280,alloy:85,crystal:20},energy:2,morale:12,tech:'diplomacy',color:'#e89cc3'},
  beacon:{name:'Lyra-Leuchtfeuer',short:'Leuchtfeuer',group:'wunder',description:'Ein Licht für alle, die den Weg verloren haben. Verbinde drei Signalfragmente und schreibe das letzte Kapitel.',cost:{credits:2400,alloy:600,crystal:140,science:100,relic:3},energy:8,tech:'beacon',color:'#f5da94',max:1}
};

export const TECHS = [
  {id:'navigation',name:'Orbitalnavigation',description:'Berechne sichere Routen. Schaltet Expeditionen und die erste Spur des Signals frei.',cost:{science:12,crystal:5},requires:[],icon:'compass'},
  {id:'ecology',name:'Leben im Vakuum',description:'Schaltet den Sternengarten frei. Gute Stimmung erhöht die Leistung deiner Crew.',cost:{science:20,crystal:8},requires:[],icon:'leaf'},
  {id:'automation',name:'Staub zu Kristall',description:'Schaltet die Kristallraffinerie frei. Asteroidenbohrer liefern 15 % mehr Legierung.',cost:{science:30,crystal:12},requires:['navigation'],icon:'gem'},
  {id:'solartech',name:'Photonensegel',description:'Alle Solarsegel erzeugen 60 % mehr Energie.',cost:{science:40,crystal:18},requires:['navigation'],icon:'sun'},
  {id:'scanning',name:'Tiefenraumsensorik',description:'Schaltet das Observatorium und die Gläsernen Gärten als Expeditionsziel frei.',cost:{science:55,crystal:22},requires:['automation'],icon:'radar'},
  {id:'engineering',name:'Modulare Architektur',description:'Erlaubt Ausbauten bis Stufe 3. Mehr Leistung auf demselben Platz.',cost:{science:65,crystal:28},requires:['automation'],icon:'layers'},
  {id:'diplomacy',name:'Eine gemeinsame Sprache',description:'Schaltet die Nebula-Lounge frei. Expeditionen bringen 20 % mehr Credits zurück.',cost:{science:60,crystal:20},requires:['ecology'],icon:'message'},
  {id:'efficiency',name:'Geschlossener Kreislauf',description:'Alle Produktionsmodule benötigen 20 % weniger Energie.',cost:{science:90,crystal:35},requires:['solartech','ecology'],icon:'refresh'},
  {id:'deepspace',name:'Hinter dem letzten Licht',description:'Schaltet das stille Relais frei. Dort wartet das dritte Fragment des Signals.',cost:{science:115,crystal:45},requires:['scanning'],icon:'orbit'},
  {id:'harmonics',name:'Resonanztheorie',description:'Alle Forschungs- und Kristallerträge steigen um 25 %.',cost:{science:140,crystal:55},requires:['deepspace','engineering'],icon:'wave'},
  {id:'beacon',name:'Ein Licht für Lyra',description:'Schaltet das Lyra-Leuchtfeuer frei. Drei Fragmente werden zu einem Weg nach Hause.',cost:{science:200,crystal:80},requires:['deepspace','diplomacy'],icon:'spark'}
];

export const MISSIONS = [
  {id:'firstlight',title:'Ein bisschen Licht',description:'Baue dein erstes Solarsegel. Wähle es im Baumenü und setze es auf ein markiertes Nachbarfeld.',kind:'module',target:'solar',amount:1,reward:{credits:80,alloy:28}},
  {id:'home',title:'Ein Fenster zu den Sternen',description:'Baue ein Wohnmodul. Eine Station wird erst durch ihre Menschen zu einem Zuhause.',kind:'module',target:'habitat',amount:1,reward:{credits:100,alloy:25,crystal:5}},
  {id:'company',title:'Platz für eine neue Geschichte',description:'Öffne „Crew“ und stelle eine weitere Person ein. In deinem neuen Wohnmodul ist Platz.',kind:'crew',amount:4,reward:{credits:90,alloy:25}},
  {id:'curiosity',title:'Was da draußen wohl wartet?',description:'Baue ein Forschungslabor. Eine freie Person übernimmt den Dienst automatisch.',kind:'module',target:'lab',amount:1,reward:{credits:120,crystal:12}},
  {id:'gateway',title:'Die Tür zum All',description:'Baue eine Andockbucht. Von hier starten deine Expeditionen.',kind:'module',target:'dock',amount:1,reward:{credits:100,alloy:35,science:5}},
  {id:'routes',title:'Zwischen den Sternen lesen',description:'Erforsche Orbitalnavigation unter „Forschung“. Dein Labor sammelt das nötige Wissen.',kind:'tech',target:'navigation',amount:1,reward:{credits:100,crystal:10}},
  {id:'firstflight',title:'Nicht mehr nur ein Punkt im All',description:'Schicke über die Sternenkarte eine Crew-Person zum Trümmergürtel und warte auf ihre Rückkehr.',kind:'expeditions',amount:1,reward:{credits:180,alloy:50,crystal:15}},
  {id:'business',title:'Der erste Stammkunde',description:'Baue ein Handelskontor. Weise ihm bei Bedarf im Modulfenster eine Person zu.',kind:'module',target:'market',amount:1,reward:{credits:180,alloy:35}},
  {id:'garden',title:'Etwas, das wächst',description:'Erforsche „Leben im Vakuum“ und baue einen Sternengarten.',kind:'module',target:'garden',amount:1,reward:{credits:180,crystal:18,science:10}},
  {id:'fragments',title:'Jemand hat ein Licht hinterlassen',description:'Finde die drei Signalfragmente. Das erste liegt im Trümmergürtel, das zweite in den Gläsernen Gärten, das dritte am stillen Relais.',kind:'fragments',amount:3,reward:{credits:350,alloy:100,science:35}},
  {id:'beacon',title:'Ein Hafen in der Dunkelheit',description:'Erforsche „Ein Licht für Lyra“ und baue das Leuchtfeuer. Ein Frachtdepot schafft Platz für die nötige Legierung.',kind:'module',target:'beacon',amount:1,reward:{credits:1200,alloy:200,crystal:80}}
];

export const SECTORS = [
  {id:'belt',name:'Der Trümmergürtel',subtitle:'Zwischen Schrauben und Sternen',description:'Alte Frachter drehen ihre stillen Kreise. Viel brauchbares Material – und ein leises Signal.',duration:45,tech:'navigation',cost:{credits:20},rewards:{alloy:[45,70],credits:[40,70],crystal:[3,7],science:[3,7]},risk:.08,color:'#e5b879',x:24,y:60,fragment:true},
  {id:'nebula',name:'Nalas Nebelmarkt',subtitle:'Kein Weg ist umsonst',description:'Eine Handvoll Handelsschiffe trifft sich im goldenen Nebel. Kristalle wechseln hier gern den Besitzer.',duration:70,tech:'navigation',cost:{credits:45},rewards:{credits:[95,150],crystal:[12,22],science:[4,9]},risk:.12,color:'#edb787',x:43,y:30},
  {id:'gardens',name:'Die Gläsernen Gärten',subtitle:'Etwas lebt hier noch',description:'Licht bricht sich in kristallinen Blättern. Unter den Wurzeln wartet die zweite Spur.',duration:100,tech:'scanning',cost:{credits:70,alloy:15},rewards:{crystal:[22,38],science:[20,35],alloy:[20,35]},risk:.18,color:'#88dbb8',x:62,y:58,fragment:true},
  {id:'relay',name:'Das stille Relais',subtitle:'Dort, wo die Karten enden',description:'Eine vergessene Antenne. Drei Sekunden Rauschen, dann eine menschliche Stimme.',duration:140,tech:'deepspace',cost:{credits:100,crystal:10},rewards:{science:[40,65],crystal:[30,50],alloy:[45,70]},risk:.22,color:'#aca4ed',x:82,y:29,fragment:true},
  {id:'drift',name:'Die wandernde Flotte',subtitle:'Fremde, bis man sich kennt',description:'Karawanen, Geschichtenerzähler und ein paar sehr gute Mechaniker. Hier gibt es immer einen Auftrag.',duration:110,tech:'diplomacy',cost:{credits:80},rewards:{credits:[220,360],alloy:[45,75],crystal:[12,22]},risk:.10,color:'#e4a5c5',x:79,y:79}
];

export const CREW_POOL = [
  {id:'mara',name:'Mara Vale',role:'Pilotin',trait:'Ruhige Hand',description:'„Wir müssen nicht schnell sein. Nur ankommen.“',skill:'pilot',color:'#e4b47b',skin:'#e7ac86',hair:'#7d414e'},
  {id:'ivo',name:'Ivo Chen',role:'Ingenieur',trait:'Ein Händchen für Metall',description:'Repariert Dinge, die laut Handbuch nicht kaputtgehen können.',skill:'engineer',color:'#78c6bd',skin:'#ddb391',hair:'#23364b'},
  {id:'pip',name:'PIP-7',role:'Analyst',trait:'Angenehm neugierig',description:'Hat 4.096 Fragen. Die erste: „Sind wir schon ein Zuhause?“',skill:'scientist',color:'#b3a2e6',skin:'#96c6c9',hair:'#497580',robot:true},
  {id:'jun',name:'Jun Okafor',role:'Botanikerin',trait:'Grüner Daumen',description:'Hat eine Bohne im Gepäck. Nennt sie aus Gründen „Admiral“.',skill:'scientist',color:'#a4d28d',skin:'#a57158',hair:'#283b3c'},
  {id:'sol',name:'Sol Reyes',role:'Händler',trait:'Kennt jemanden',description:'Kennt immer jemanden. Manchmal kennt derjenige auch Sol.',skill:'trader',color:'#e5a69c',skin:'#d1a17a',hair:'#64363a'},
  {id:'ada',name:'Ada Frost',role:'Ingenieurin',trait:'Improvisationstalent',description:'„Ein Kabelbinder ist auch nur eine sehr kleine Brücke.“',skill:'engineer',color:'#a4bfdf',skin:'#efd0b4',hair:'#d29d62'},
  {id:'tavi',name:'Tavi Sato',role:'Pilot',trait:'Sternenblick',description:'Findet Wege, die noch keinen Namen haben.',skill:'pilot',color:'#e7ca7e',skin:'#e3b296',hair:'#4c3958'},
  {id:'nox',name:'Nox',role:'Forscher',trait:'Denkt um drei Ecken',description:'Behauptet, das Universum habe ihn zuerst angestarrt.',skill:'scientist',color:'#bfade9',skin:'#bca5ca',hair:'#3b355b'},
  {id:'lumi',name:'Lumi Aalto',role:'Händlerin',trait:'Offenes Ohr',description:'Merkt sich Namen. Und wie du deinen Tee trinkst.',skill:'trader',color:'#edb4ca',skin:'#f1c4a8',hair:'#a66b5a'},
  {id:'bea',name:'Bea Navarro',role:'Ingenieurin',trait:'Werkzeugpoesie',description:'Klopft Maschinen zweimal auf die Schulter. Funktioniert meistens.',skill:'engineer',color:'#8bd1ce',skin:'#bc8b6e',hair:'#382f3c'},
  {id:'orin',name:'Orin Bell',role:'Pilot',trait:'Gelassenheit',description:'Hat schon einmal ein Schiff mit einer Teekanne repariert.',skill:'pilot',color:'#b0ba8e',skin:'#d4a383',hair:'#9b9eaa'},
  {id:'keo',name:'Keo Lin',role:'Forscherin',trait:'Neugier ohne Ende',description:'Sammelt neue Wörter für bisher unbenannte Farben.',skill:'scientist',color:'#a3b6ed',skin:'#edbba0',hair:'#39465c'}
];

export const EVENTS = [
  {id:'merchant',speaker:'Nala · Händlerin',title:'„Ich war gerade in der Gegend.“',text:'Ein kleiner Frachter dockt an. Nala hat Kristalle, eine neue Frisur und angeblich überhaupt keine Eile.',choices:[{label:'12 Kristalle kaufen',cost:{credits:65},gain:{crystal:12},result:'Nala schiebt dir eine sorgfältig verpackte Kiste zu. „Für gute Nachbarn immer.“'},{label:'Auf einen Tee einladen',gain:{science:4},morale:1,result:'Ihr tauscht Geschichten aus. Auf Nalas Sternenkarte steht neben deiner Station jetzt ein kleines Herz.'}]},
  {id:'robot',speaker:'R-03 · Reisender',title:'Ein sehr höfliches Klappern',text:'Ein alter Wartungsroboter bittet um Ersatzteile. Er möchte nichts geschenkt – er hat etwas aus dem Trümmergürtel mitgebracht.',choices:[{label:'20 Legierung teilen',cost:{alloy:20},gain:{crystal:10,science:6},result:'R-03 verbeugt sich und schenkt dir eine Schachtel merkwürdig leuchtender Splitter.'},{label:'Die Werkbank anbieten',gain:{credits:20},result:'Der Roboter repariert sich selbst und hinterlässt eine blitzblanke Werkbank. Und ein Trinkgeld.'}]},
  {id:'plant',speaker:'Jun · Offener Funk',title:'Eine Pflanze sucht ein Fenster',text:'Ein vorbeiziehender Gärtner sucht ein Zuhause für eine kleine, leuchtende Pflanze. Angeblich mag sie schlechte Musik.',choices:[{label:'Ein Fenster freimachen',cost:{credits:35},morale:4,result:'Die Pflanze zieht ein. Jemand nennt sie „Lambert“. PIP-7 übt seitdem Flöte.'},{label:'Samen tauschen',gain:{crystal:4,science:5},result:'Ihr tauscht Samen und Koordinaten. Ein guter Handel muss nicht groß sein.'}]},
  {id:'signal',speaker:'PIP-7 · Analyse',title:'Drei Töne in der Stille',text:'Zwischen dem Rauschen wiederholt sich eine winzige Melodie. Keine Notrufkennung. Eher … eine Einladung.',choices:[{label:'Das Muster entschlüsseln',cost:{science:6},gain:{crystal:8,science:15},result:'Es ist eine alte Navigationsfolge. Die Koordinaten passen zu den Routen im Sektor.'},{label:'Eine Antwort senden',gain:{science:4},morale:2,result:'Mara summt die drei Töne zurück. Für einen Moment klingt das All weniger leer.'}]},
  {id:'repair',speaker:'Ivo · Maschinenraum',title:'Das Geräusch war vorher nicht da',text:'Ein Ventil pfeift in einer Tonart, die Ivo „ausbaufähig“ nennt. Es ist noch nichts kaputt, aber er hätte einen Vorschlag.',choices:[{label:'Vorsorglich austauschen',cost:{alloy:18},gain:{science:8},morale:2,result:'Das neue Ventil ist leise. Ivo ist glücklich. Niemand muss wissen, dass das alte noch auf seinem Schreibtisch steht.'},{label:'Gemeinsam nachsehen',gain:{science:3},result:'Ein Nachmittag mit Werkzeug und Tee. Es war eine lose Schraube.'}]},
  {id:'festival',speaker:'Crew-Kanal',title:'Heute ist doch bestimmt irgendwas',text:'Sol findet, dass ein Außenposten einen eigenen Feiertag braucht. Der Name „Tag der noch funktionierenden Luftschleuse“ steht hoch im Kurs.',choices:[{label:'Eine Runde ausgeben',cost:{credits:75},morale:5,result:'Der erste Stationsfeiertag endet mit schiefen Liedern und einer überraschend guten Rede von PIP-7.'},{label:'Sternenlicht reicht',morale:2,result:'Ihr schaltet für zehn Minuten das Licht herunter. Die Sterne übernehmen die Dekoration.'}]},
  {id:'survey',speaker:'Kartografie-Kollektiv',title:'Ein leeres Feld auf der Karte',text:'Ein unabhängiges Forschungsschiff fragt nach deinen Beobachtungen. Im Gegenzug gibt es Material aus seinem Vorrat.',choices:[{label:'12 Wissen teilen',cost:{science:12},gain:{alloy:35,credits:60},result:'Dein Stationsname steht nun klein gedruckt auf einer neuen Sternenkarte.'},{label:'Erst einmal zuhören',gain:{science:5},result:'Die Forscher erzählen von einem gläsernen Garten. Du notierst die Richtung.'}]},
  {id:'cargo',speaker:'Versorgungsschiff Motte',title:'Eine Kiste zu viel',text:'Die Motte hat eine Palette übrig. Der Kapitän möchte sie lieber hier lassen, als sie durch den halben Sektor zurückzufliegen.',choices:[{label:'Für 45 Credits übernehmen',cost:{credits:45},gain:{alloy:30,crystal:5},result:'Die Kiste enthält Ersatzteile, fünf Kristalle und einen sehr alten Witz auf dem Lieferschein.'},{label:'Beim Umladen helfen',gain:{credits:25},morale:1,result:'Zwanzig Minuten Arbeit, ein gutes Gespräch. Die Motte wird sich an den Hafen erinnern.'}]}
];

export const ACHIEVEMENTS = [
  {id:'builder',title:'Ein Anfang',description:'Baue dein erstes Modul.',stat:'built',amount:1},
  {id:'town',title:'Nicht mehr allein',description:'Beherberge 6 Crew-Mitglieder.',stat:'crew',amount:6},
  {id:'architect',title:'Eine kleine Stadt',description:'Besitze 15 Module.',stat:'modules',amount:15},
  {id:'researcher',title:'Gute Fragen',description:'Erforsche 5 Technologien.',stat:'techs',amount:5},
  {id:'captain',title:'Hin und zurück',description:'Schließe 10 Expeditionen ab.',stat:'expeditions',amount:10},
  {id:'salvager',title:'Schätze im Staub',description:'Sammle insgesamt 30 Frachtstücke in Bergungsflügen.',stat:'salvage',amount:30},
  {id:'ace',title:'Ruhige Hand',description:'Sammle 15 Frachtstücke in einem Bergungsflug.',stat:'bestSalvage',amount:15},
  {id:'wealth',title:'Handel verbindet',description:'Verdiene insgesamt 10.000 Credits.',stat:'earned',amount:10000},
  {id:'host',title:'Ein guter Nachbar',description:'Begrüße 8 Besucher.',stat:'visitors',amount:8},
  {id:'upgrade',title:'Geht da noch was?',description:'Baue ein Modul auf Stufe 3 aus.',stat:'maxLevel',amount:3},
  {id:'signal',title:'Eine Stimme im All',description:'Finde alle 3 Signalfragmente.',stat:'fragments',amount:3},
  {id:'light',title:'Ein Hafen in der Dunkelheit',description:'Errichte das Lyra-Leuchtfeuer.',stat:'won',amount:1}
];

export const CONTRACTS = [
  {id:'hull',name:'Hülle für die Motte',text:'Die Motte braucht neue Außenplatten.',cost:{alloy:65},gain:{credits:160,science:3}},
  {id:'lenses',name:'Linsen für den Leuchtturm',text:'Ein Nachbar repariert seine Sensoren.',cost:{crystal:20},gain:{credits:190,alloy:25}},
  {id:'charts',name:'Karten für die Karawane',text:'Ein paar gute Daten sparen einen langen Umweg.',cost:{science:30},gain:{credits:200,crystal:10}},
  {id:'spares',name:'Ersatzteile auf Vorrat',text:'Nala baut eine zweite Handelsroute auf.',cost:{alloy:110,crystal:8},gain:{credits:320,science:12}}
];
