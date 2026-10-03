(() => {
  "use strict";

  const RESOURCE = typeof GetParentResourceName === "function" ? GetParentResourceName() : null;
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));

  const icons = {
    paint:"i-paint", engine:"i-engine", suspension:"i-suspension", armor:"i-armor",
    body:"i-body", livery:"i-livery", neon:"i-neon", headlights:"i-light",
    smoke:"i-smoke", sounds:"i-sound", wheels:"i-wheel"
  };

  const categories = [
    {id:"paint",label:"Paint",title:"Paint & Finish",sub:"Primary, secondary and specialty finishes."},
    {id:"engine",label:"Engine",title:"Engine Performance",sub:"ECU stages with live projected top-speed impact."},
    {id:"suspension",label:"Suspension",title:"Suspension",sub:"Ride-height and handling setups paid in cash."},
    {id:"armor",label:"Armor",title:"Vehicle Armor",sub:"Protection levels paid in cash."},
    {id:"body",label:"Body",title:"Body Components",sub:"Only compatible modifications for this vehicle are shown."},
    {id:"livery",label:"Liveries",title:"Liveries",sub:"Vehicle-specific liveries and graphic packages."},
    {id:"neon",label:"Neon",title:"Neon Lighting",sub:"Full-spectrum underglow with premium animated color."},
    {id:"headlights",label:"Headlights",title:"Headlights",sub:"Custom xenon colors and premium rainbow lighting."},
    {id:"smoke",label:"Tire Smoke",title:"Tire Smoke",sub:"Custom smoke colors and premium rainbow effect."},
    {id:"sounds",label:"Engine Sounds",title:"Engine Sound Swap",sub:"30 GTA-style sound profiles from subtle to extreme."},
    {id:"wheels",label:"Wheels",title:"Wheels",sub:"Street, track, tuner, luxury and premium wheel families."}
  ];

  const paintFinishes = {
    normal:[
      ["Carbon Black","#111417",125000],["Graphite","#34383c",125000],["Ice White","#e8eceb",125000],
      ["Torino Red","#d71f31",145000],["Racing Blue","#1756e8",145000],["British Green","#0b4b34",145000],
      ["Sunrise Orange","#ff6b1a",160000],["Taxi Yellow","#f7c62a",160000],["Hot Pink","#e6409f",175000],
      ["Ultra Blue","#2c83ff",175000],["Lime Green","#58d637",175000],["Wine Red","#5e1320",175000]
    ],
    matte:[
      ["Matte Black","#171918",240000],["Matte Gray","#555a58",240000],["Matte White","#d7d8d2",260000],
      ["Matte Red","#a7272e",275000],["Matte Blue","#263c72",275000],["Matte Green","#274f39",275000],
      ["Matte Purple","#50355f",295000],["Matte Sand","#9d8b6b",295000],["Matte Ice","#a8c5c7",320000]
    ],
    metallic:[
      ["Midnight Silver","#363b42",380000],["Steel Silver","#858d93",380000],["Candy Red","#9e1025",420000],
      ["Deep Ocean","#102b59",420000],["Emerald","#0c573d",450000],["Royal Purple","#4b1d6b",450000],
      ["Copper","#a95c2b",480000],["Champagne","#b9a177",480000],["Electric Blue","#176bd4",520000]
    ],
    chrome:[
      ["Mirror Chrome","#bfc7ca",0,85],["Dark Chrome","#60696e",0,95],["Gold Chrome","#c8a348",0,110],
      ["Rose Chrome","#c9898e",0,120],["Blue Chrome","#6d91bb",0,120],["Green Chrome","#659779",0,120]
    ],
    chameleon:[
      ["Oil Slick","linear-gradient(135deg,#5725ff,#00d8d1,#ff3c9a)",0,160],["Aurora","linear-gradient(135deg,#1bd889,#2f69ff,#bc42ff)",0,175],
      ["Sunset Shift","linear-gradient(135deg,#ff473d,#ffb22e,#a82eff)",0,180],["Arctic Shift","linear-gradient(135deg,#d7fbff,#54d9ff,#7d64ff)",0,190],
      ["Toxic Shift","linear-gradient(135deg,#d9ff32,#25ff86,#00a5a7)",0,200],["Prismatic","conic-gradient(#ff4b63,#ffcf45,#54ff91,#4eeaff,#775cff,#e84fff,#ff4b63)",0,240]
    ]
  };

  const engineStages = [
    {id:"stage0",name:"Factory ECU",desc:"Stock engine calibration",stage:0,diamond:0},
    {id:"stage1",name:"Stage 1",desc:"+15% projected max speed",stage:1,diamond:110},
    {id:"stage2",name:"Stage 2",desc:"+30% projected max speed",stage:2,diamond:225},
    {id:"stage3",name:"Stage 3",desc:"+45% projected max speed",stage:3,diamond:390},
    {id:"stage4",name:"Stage 4",desc:"+60% projected max speed",stage:4,diamond:620},
    {id:"stage4turbo",name:"Stage 4 Turbo",desc:"Stage 4 + 30% final-speed multiplier",stage:4,diamond:850,lei:400,turbo:true,premium:true}
  ];

  const suspension = [
    ["Stock Suspension","Factory ride height",0],["Street Suspension","Mild drop / road setup",450000],
    ["Sport Suspension","Lower, firmer road setup",850000],["Competition Suspension","Track-focused drop",1600000],
    ["Lowered Suspension","Maximum static drop",2400000]
  ];

  const armor = [
    ["Stock Armor","0% additional armor",0,0],["Armor Upgrade 20%","Light reinforcement",900000,20],
    ["Armor Upgrade 40%","Moderate reinforcement",1800000,40],["Armor Upgrade 60%","Heavy reinforcement",3200000,60],
    ["Armor Upgrade 80%","Advanced reinforcement",5200000,80],["Armor Upgrade 100%","Maximum reinforcement",8500000,100]
  ];

  const bodyCatalog = [
    ["spoilers","Spoilers"],["frontBumper","Front Bumpers"],["rearBumper","Rear Bumpers"],["sideSkirt","Side Skirts"],
    ["exhaust","Exhausts"],["frame","Chassis / Frame"],["grille","Grilles"],["hood","Hoods"],["fender","Left Fenders"],
    ["rightFender","Right Fenders"],["roof","Roofs"],["horn","Horns"],["plateHolder","Plate Holders"],["vanityPlate","Vanity Plates"],
    ["trimA","Interior Trim"],["ornaments","Ornaments"],["dashboard","Dashboards"],["dials","Dials"],["doorSpeakers","Door Speakers"],
    ["seats","Seats"],["steeringWheel","Steering Wheels"],["shiftLever","Shift Levers"],["plaques","Plaques"],["speakers","Speakers"],
    ["trunk","Trunks"],["hydraulics","Hydraulics"],["engineBlock","Engine Blocks"],["airFilter","Air Filters"],["struts","Struts"],
    ["archCover","Arch Covers"],["aerials","Aerials"],["trimB","Exterior Trim"],["tank","Tanks"],["windows","Windows"]
  ];

  const soundNames = [
    "Compact I4","Classic I4","Street I4 Turbo","Rally I4","Retro Boxer","Modern Boxer","Smooth I6","Sport I6",
    "Twin-Turbo I6","Classic V6","Sport V6","Race V6","Muscle V8","Modern V8","Supercharged V8","Track V8",
    "High-Rev V8","Luxury V8","Classic V10","High-Rev V10","Exotic V10","Grand Tourer V12","Luxury V12","Supercar V12",
    "Race V12","Hypercar V12","Aggressive Turbo","Anti-Lag Race","Extreme Pops","Competition Thunder"
  ];
  const soundIds = [
    "BLISTA","SULTAN","JESTER","OMNIS","COMET2","COMET6","SENTINEL","ELEGY","JESTER3","SCHAFTER3",
    "FELTZER2","KURUMA","DOMINATOR","GAUNTLET","VIGERO","BUFFALO4","CHEETAH","PARAGON","INFERNUS","VACCA",
    "TENF","COGNOSCENTI","WINDSOR","ZENTORNO","ITALIGTO","IGNUS","CYCLONE2","S95","VECTRE","TURISMO3"
  ];
  const soundPrices = soundNames.map((_,i) => Math.round((12000000 + Math.pow(i/29,1.72)*488000000)/1000000)*1000000);

  const wheelFamilies = {
    "Sport":["Inferno","Deep Five","LozSpeed Mk.V","Diamond Cut","Chrono","Feroci RR","FiftyNine","Mercie","Synthetic Z","Organic Type II"],
    "Muscle":["Classic Five","Dukes","Muscle Freak","Kracka","Azreal","Mecha","Black Top","Drag SPL","Old School","Street King"],
    "Lowrider":["Flare","Wired","Triple Golds","Big Worm","Seven Fives","Split Six","Fresh Mesh","Lead Sled","Turbine","Smoothie"],
    "SUV":["VIP","Benefactor","Cosmo","Bippu","Royal Six","Fagorme","Deluxe","Iced Out","Cutter","V Spec"],
    "Offroad":["Raider","Mudslinger","Nevis","Cairngorm","Amazon","Challenger","Dune Basher","Five Star","Rock Crawler","Mil Spec"],
    "Tuner":["Cosmo MkII","Super Mesh","Outsider","Rollas","Driftmeister","Slicer","El Quatro","Dubbed","Five Star","Endo v.2"],
    "High End":["Shadow","Hyper","Blade","Diamond","Supagee","Chromatic Z","Mercie Ch.Lip","Obey RS","Cheetah RR","Carbon Solar"],
    "Street":["Retro Steelie","Poverty Spec","Concave Racer","Deep Flake","Cosmo Street","Aero Star","Track Star","Street SPL","Forged Five","Apex Mesh"],
    "Track":["Rally Throwback","Gravel Trap","Stove Top","Split Star","Speed Boy","90s Running","Tropos","Exos","Super Luxe","Carbon Racer"],
    "Open Wheel":["Formula S1","Formula S2","Aero Disc","Turbofan","Centerlock 5","Centerlock 7","GP Mesh","Monocoque","Race Blade","Qualifying"],
    "Benny's":["Chrome OG","Gold OG","Bespoke Mesh","Bespoke Five","Lowrider Classic","Big Dog","Chrome Web","Luxury Wire","Triple Spoke","Vintage Dish"]
  };

  const colorPalette = [
    "#ffffff","#b8c0c4","#5c6267","#111416","#ff3152","#ff6d2f","#ffb72e",
    "#f1ef42","#77e143","#27e58b","#27d9cc","#34a8ff","#4059ff","#8051ff",
    "#c04fff","#ef43a1","#7b281d","#5b341c","#d5bd8a","#94a9b4","#2a394c"
  ];

  const state = {
    category:"paint", subtab:"normal", selected:null, cart:[],
    wallet:{bank:42800000,cash:8400000,diamonds:2840,lei:1250},
    vehicle:{name:"PROGEN EMERUS",plate:"VANTA 01",baseTopSpeed:312,power:812,torque:786},
    capabilities:{
      body:Object.fromEntries(bodyCatalog.map(([id]) => [id, true])),
      livery:true,liveryCount:12,neon:true,headlights:true,smoke:true,wheels:true
    }
  };

  function money(n){
    if(!n) return "$0";
    if(n >= 1000000) return "$" + (n/1000000).toFixed(n % 1000000 ? 1 : 0) + "M";
    return "$" + n.toLocaleString();
  }
  function kk(n){ return Math.round(n/1000000) + "kk"; }
  function svg(id){ return '<svg><use href="#' + id + '"/></svg>'; }
  function priceHTML(item){
    let out = "";
    if(item.cash) out += '<span class="price">' + svg("i-cash") + money(item.cash) + '</span>';
    if(item.diamond) out += '<span class="price diamond">' + svg("i-diamond") + item.diamond.toLocaleString() + '</span>';
    if(item.lei) out += '<span class="price lei">' + svg("i-lei") + item.lei.toLocaleString() + '</span>';
    if(!item.cash && !item.diamond && !item.lei) out += '<span class="price">OWNED</span>';
    return item.diamond && item.lei ? '<span class="dual-price">' + out + '</span>' : out;
  }
  function escapeHtml(v){
    return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }
  async function nui(event, payload={}){
    if(!RESOURCE){
      console.debug("[NUI preview]", event, payload);
      return {ok:true,preview:true};
    }
    try{
      const r = await fetch("https://" + RESOURCE + "/" + event, {
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
      });
      try{return await r.json();}catch{return {ok:r.ok};}
    }catch(err){ console.warn("NUI callback failed",event,err); return {ok:false}; }
  }

  function renderRail(){
    $("#categoryRail").innerHTML = categories.map((c,i) =>
      '<button class="cat-btn ' + (state.category===c.id?"active":"") + '" data-category="' + c.id + '" aria-label="' + c.label + '">' +
      svg(icons[c.id]) + '<span class="tip">' + String(i+1).padStart(2,"0") + " / " + c.label.toUpperCase() + '</span></button>'
    ).join("");
    $$(".cat-btn").forEach(btn => btn.addEventListener("click", () => setCategory(btn.dataset.category)));
  }

  function setCategory(id){
    state.category=id; state.selected=null;
    const c=categories.find(x=>x.id===id);
    $("#categoryIndex").textContent=String(categories.indexOf(c)+1).padStart(2,"0")+" / "+c.label.toUpperCase();
    $("#categoryTitle").textContent=c.title;
    $("#categorySubtitle").textContent=c.sub;
    renderRail(); renderPanel(); updateSelectedPreview();
  }

  function tabs(items, active){
    return '<div class="section-tabs">' + items.map(t =>
      '<button class="subtab ' + (t.id===active?"active":"") + '" data-subtab="' + t.id + '">' + t.label + '</button>'
    ).join("") + '</div>';
  }

  function optionRow(item, extraClass=""){
    const active = state.selected && state.selected.key === item.key;
    return '<button class="option-row ' + extraClass + " " + (active?"active":"") + '" data-option="' + escapeHtml(item.key) + '">' +
      (item.stageNumber !== undefined ? '<span class="stage-number">' + item.stageNumber + '</span>' : '<span class="option-icon">' + svg(item.icon || icons[state.category]) + '</span>') +
      '<span class="option-main"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.desc || "") + '</small></span>' +
      priceHTML(item) + '</button>';
  }

  function wireOptions(items){
    $$("[data-option]", $("#panelContent")).forEach(btn => btn.addEventListener("click", () => {
      const item=items.find(x=>x.key===btn.dataset.option);
      if(item) selectItem(item);
    }));
  }
  function wireSubtabs(onChange){
    $$("[data-subtab]", $("#panelContent")).forEach(btn => btn.addEventListener("click", () => {
      state.subtab=btn.dataset.subtab; state.selected=null; onChange(); renderPanel(); updateSelectedPreview();
    }));
  }

  function paintItems(){
    return paintFinishes[state.subtab].map((x,i) => ({
      key:"paint:"+state.subtab+":"+i,category:"paint",name:x[0],desc:state.subtab.charAt(0).toUpperCase()+state.subtab.slice(1)+" finish",
      cash:x[2]||0,diamond:x[3]||0,color:x[1],finish:state.subtab,icon:"i-paint"
    }));
  }

  function renderPaint(){
    if(!paintFinishes[state.subtab]) state.subtab="normal";
    const items=paintItems();
    let html=tabs([
      {id:"normal",label:"NORMAL"},{id:"matte",label:"MATTE"},{id:"metallic",label:"METALLIC"},
      {id:"chrome",label:"CHROME ◇"},{id:"chameleon",label:"CHAMELEON ◇"}
    ],state.subtab);
    html+='<div class="section-title">FINISH PRESETS</div><div class="option-list">';
    html+=items.map(item => {
      const bg=item.color.includes("gradient")?item.color:item.color;
      const active=state.selected&&state.selected.key===item.key;
      return '<button class="option-row ' + (item.diamond?"premium ":"") + (active?"active":"") + '" data-option="' + item.key + '">' +
        '<span class="option-icon" style="background:' + bg + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)"></span>' +
        '<span class="option-main"><strong>' + item.name + '</strong><small>' + item.finish.toUpperCase() + ' · LIVE BODY PREVIEW</small></span>' + priceHTML(item) + '</button>';
    }).join("");
    html+='</div><div class="section-title">CUSTOM COLOR</div><div class="color-picker-row"><input type="color" id="customPaint" value="#55f58a"><div class="color-picker-meta"><span>HEX COLOR</span><strong id="hexPaint">#55F58A</strong></div></div>';
    html+=actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>';
    wireSubtabs(()=>{});
    wireOptions(items);
    $("#customPaint").addEventListener("input",e=>{
      $("#hexPaint").textContent=e.target.value.toUpperCase();
      const custom={key:"paint:custom:"+state.subtab,category:"paint",name:"Custom "+state.subtab,desc:e.target.value.toUpperCase(),color:e.target.value,finish:state.subtab,cash:["normal","matte","metallic"].includes(state.subtab)?650000:0,diamond:["chrome","chameleon"].includes(state.subtab)?260:0};
      selectItem(custom,false);
    });
    wireAdd();
  }

  function renderEngine(){
    const items=engineStages.map(x=>({
      key:"engine:"+x.id,category:"engine",name:x.name,desc:x.desc,stage:x.stage,turbo:!!x.turbo,
      diamond:x.diamond,lei:x.lei||0,premium:!!x.premium,stageNumber:x.turbo?"4T":x.stage
    }));
    let html='<div class="info-box">'+svg("i-info")+'<span>Each stage adds <b>15%</b> to base max speed. Stage 4 Turbo applies a further <b>30%</b> multiplier after Stage 4.</span></div>';
    html+='<div class="section-title">ECU CALIBRATION</div><div class="option-list">'+items.map(i=>optionRow(i,"stage-card "+(i.premium?"premium turbo":""))).join("")+'</div>'+actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>'; wireOptions(items); wireAdd();
  }

  function renderSimple(list,type){
    const items=list.map((x,i)=>({key:type+":"+i,category:type,name:x[0],desc:x[1],cash:x[2],level:x[3]||0,icon:icons[type]}));
    $("#panelContent").innerHTML='<div class="content-enter"><div class="section-title">AVAILABLE SETUPS</div><div class="option-list">'+items.map(i=>optionRow(i)).join("")+'</div>'+actionArea()+'</div>';
    wireOptions(items);wireAdd();
  }

  function bodyItems(){
    const supported=bodyCatalog.filter(([id])=>state.capabilities.body && state.capabilities.body[id]!==false);
    return supported.map(([id,label],i)=>({key:"body:"+id,category:"body",bodyId:id,name:label,desc:"Compatible options available",cash:650000+i*125000,icon:"i-body"}));
  }
  function renderBody(){
    const items=bodyItems();
    const html='<div class="info-box">'+svg("i-info")+'<span>Categories are filtered from the vehicle capability payload. Unsupported GTA mod slots never appear here.</span></div>'+
      '<div class="section-title">SUPPORTED BODY SLOTS <span>'+items.length+' AVAILABLE</span></div><div class="option-list">'+items.map(i=>optionRow(i)).join("")+'</div>'+actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>';wireOptions(items);wireAdd();
  }

  function renderLivery(){
    if(!state.capabilities.livery){
      $("#panelContent").innerHTML='<div class="empty-state"><strong>No liveries supported</strong><span>This vehicle did not report a livery slot.</span></div>';return;
    }
    const count=Math.max(1,state.capabilities.liveryCount||8);
    const items=Array.from({length:count},(_,i)=>({key:"livery:"+i,category:"livery",name:i===0?"Factory Livery":"Livery "+String(i).padStart(2,"0"),desc:"Vehicle-specific graphic package",diamond:i===0?0:35+i*8,icon:"i-livery"}));
    $("#panelContent").innerHTML='<div class="content-enter"><div class="section-title">VEHICLE LIVERIES</div><div class="option-list">'+items.map(i=>optionRow(i,i.diamond?"premium":"")).join("")+'</div>'+actionArea()+'</div>';wireOptions(items);wireAdd();
  }

  function effectItems(type){
    const label=type==="neon"?"Neon":type==="headlights"?"Headlight":"Smoke";
    const base=type==="headlights"?28:34;
    return colorPalette.map((c,i)=>({key:type+":"+i,category:type,name:label+" "+String(i+1).padStart(2,"0"),desc:c.toUpperCase(),diamond:base+Math.floor(i/4)*3,color:c,icon:icons[type]}));
  }
  function renderEffect(type){
    const items=effectItems(type);
    const rainbow={key:type+":rainbow",category:type,name:"Rainbow "+(type==="smoke"?"Smoke":type==="headlights"?"Headlights":"Neon"),desc:"Premium animated spectrum",diamond:type==="headlights"?220:260,color:"rainbow",premium:true,icon:icons[type]};
    items.push(rainbow);
    let html='<div class="section-title">COLOR SPECTRUM</div><div class="color-grid">';
    html+=colorPalette.map((c,i)=>'<button class="swatch '+(state.selected&&state.selected.key===type+":"+i?"active":"")+'" data-option="'+type+":"+i+'" style="--swatch:'+c+'" title="'+c+'"></button>').join("");
    html+='<button class="swatch rainbow '+(state.selected&&state.selected.key===rainbow.key?"active":"")+'" data-option="'+rainbow.key+'" title="Rainbow"></button></div>';
    html+='<div class="section-title">CUSTOM RGB</div><div class="color-picker-row"><input type="color" id="customEffect" value="#55f58a"><div class="color-picker-meta"><span>LIVE COLOR</span><strong id="hexEffect">#55F58A</strong></div></div>';
    html+='<div class="option-list">'+optionRow(rainbow,"premium")+'</div>'+actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>';wireOptions(items);wireAdd();
    $("#customEffect").addEventListener("input",e=>{
      $("#hexEffect").textContent=e.target.value.toUpperCase();
      selectItem({key:type+":custom",category:type,name:"Custom "+type,desc:e.target.value.toUpperCase(),diamond:95,color:e.target.value,icon:icons[type]},false);
    });
  }

  function renderSounds(){
    const items=soundNames.map((name,i)=>({
      key:"sounds:"+i,category:"sounds",name:name,desc:soundIds[i]+" · "+(i>25?"EXTREME / POPS":i>18?"EXOTIC / AGGRESSIVE":i>10?"SPORT / PERFORMANCE":"STREET / CLEAN"),
      cash:soundPrices[i],soundId:soundIds[i],icon:"i-sound"
    }));
    let html='<div class="info-box">'+svg("i-info")+'<span>Sound profiles are preview identifiers for your FiveM resource. No copyrighted audio is embedded in this NUI.</span></div>';
    html+='<div class="section-title">ENGINE AUDIO <span>12KK — 500KK</span></div><div class="option-list">'+items.map((i,n)=>optionRow(i,n>24?"premium":"")).join("")+'</div>'+actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>';wireOptions(items);wireAdd();
  }

  function renderWheels(){
    if(!wheelFamilies[state.subtab]) state.subtab="Sport";
    const familyNames=Object.keys(wheelFamilies);
    const items=wheelFamilies[state.subtab].map((name,i)=>({
      key:"wheels:"+state.subtab+":"+i,category:"wheels",name:name,desc:state.subtab.toUpperCase()+" · WHEEL "+String(i+1).padStart(2,"0"),
      cash:["Sport","Muscle","Lowrider","SUV","Offroad","Tuner","Street"].includes(state.subtab)?850000+i*120000:0,
      diamond:["High End","Track","Open Wheel","Benny's"].includes(state.subtab)?55+i*9:0,
      premium:["High End","Track","Open Wheel","Benny's"].includes(state.subtab),wheelType:state.subtab,wheelIndex:i,icon:"i-wheel"
    }));
    let html=tabs(familyNames.map(x=>({id:x,label:x.toUpperCase()})),state.subtab);
    html+='<div class="section-title">WHEEL DESIGNS</div><div class="option-list">'+items.map(i=>optionRow(i,i.premium?"premium":"")).join("")+'</div>'+actionArea();
    $("#panelContent").innerHTML='<div class="content-enter">'+html+'</div>';wireSubtabs(()=>{});wireOptions(items);wireAdd();
  }

  function actionArea(){
    return '<div class="preview-actions"><button class="add-btn" id="addBtn" '+(!state.selected?"disabled":"")+'>+ ADD PREVIEW TO BUILD</button></div>';
  }
  function wireAdd(){
    const btn=$("#addBtn"); if(!btn)return;
    btn.disabled=!state.selected;
    btn.addEventListener("click",addSelected);
  }

  function renderPanel(){
    state.subtab = state.category==="paint" && !paintFinishes[state.subtab] ? "normal" :
                   state.category==="wheels" && !wheelFamilies[state.subtab] ? "Sport" : state.subtab;
    switch(state.category){
      case "paint":renderPaint();break;
      case "engine":renderEngine();break;
      case "suspension":renderSimple(suspension,"suspension");break;
      case "armor":renderSimple(armor,"armor");break;
      case "body":renderBody();break;
      case "livery":renderLivery();break;
      case "neon":renderEffect("neon");break;
      case "headlights":renderEffect("headlights");break;
      case "smoke":renderEffect("smoke");break;
      case "sounds":renderSounds();break;
      case "wheels":renderWheels();break;
    }
  }

  function selectItem(item,rerender=true){
    state.selected={...item};
    previewItem(item);
    updateSelectedPreview();
    updateProjectedSpeed(item);
    if(rerender) renderPanel();
    else { const b=$("#addBtn"); if(b)b.disabled=false; }
  }

  function previewItem(item){
    const payload={...item,vehicle:state.vehicle};
    if(item.category==="paint") nui("previewPaint",payload);
    else if(["neon","headlights","smoke"].includes(item.category)) nui("previewEffect",payload);
    else if(item.category==="sounds") nui("previewEngineSound",payload);
    else nui("previewMod",payload);
  }

  function addSelected(){
    if(!state.selected)return;
    const item={...state.selected};
    const uniqueByCategory=["paint","engine","suspension","armor","livery","neon","headlights","smoke","sounds"];
    if(uniqueByCategory.includes(item.category)) state.cart=state.cart.filter(x=>x.category!==item.category);
    if(item.category==="wheels") state.cart=state.cart.filter(x=>x.category!=="wheels");
    if(item.category==="body") state.cart=state.cart.filter(x=>!(x.category==="body"&&x.bodyId===item.bodyId));
    state.cart.push(item);
    renderCart();
    toast("Added to build",item.name+" will be charged only at checkout.");
  }

  function removeItem(key){
    state.cart=state.cart.filter(x=>x.key!==key);
    nui("removePreview",{key});
    renderCart();updateProjectedSpeed();
  }

  function renderCart(){
    const list=$("#buildList");
    $("#cartCount").textContent=state.cart.length;
    $("#pendingCount").textContent=state.cart.length+" ITEM"+(state.cart.length===1?"":"S");
    if(!state.cart.length){
      list.innerHTML='<div class="empty-state">'+svg("i-cart")+'<strong>Your build is clean</strong><span>Preview an upgrade, then add it to your build.</span></div>';
    }else{
      list.innerHTML=state.cart.map(item=>{
        const p=item.cash?money(item.cash):item.diamond&&item.lei?(item.diamond+"◇ + "+item.lei+"L"):item.diamond?(item.diamond+"◇"):(item.lei+"L");
        return '<div class="cart-item"><strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(categories.find(c=>c.id===item.category)?.label||item.category)+'</small><span class="cart-price">'+p+'</span><button class="remove-item" data-remove="'+escapeHtml(item.key)+'">×</button></div>';
      }).join("");
      $$("[data-remove]",list).forEach(b=>b.addEventListener("click",()=>removeItem(b.dataset.remove)));
    }
    const totals=state.cart.reduce((a,x)=>({cash:a.cash+(x.cash||0),diamond:a.diamond+(x.diamond||0),lei:a.lei+(x.lei||0)}),{cash:0,diamond:0,lei:0});
    $("#totalCash").textContent=money(totals.cash);
    $("#totalDiamonds").textContent=totals.diamond.toLocaleString();
    $("#totalLei").textContent=totals.lei.toLocaleString();
    $("#checkoutBtn").disabled=!state.cart.length;
    updateProjectedSpeed();
  }

  function updateSelectedPreview(){
    const box=$("#selectedPreview");
    const item=state.selected;
    if(!item){
      box.innerHTML='<div class="selected-icon">'+svg(icons[state.category])+'</div><div><small>CURRENT PREVIEW</small><strong>No selection</strong><span>Choose an option to preview it live.</span></div>';
      return;
    }
    box.innerHTML='<div class="selected-icon">'+svg(icons[item.category])+'</div><div><small>CURRENT PREVIEW</small><strong>'+escapeHtml(item.name)+'</strong><span>'+escapeHtml(item.desc||"Ready to add")+'</span></div>';
  }

  function currentEngineItem(extra){
    if(extra && extra.category==="engine") return extra;
    return state.cart.find(x=>x.category==="engine") || null;
  }
  function updateProjectedSpeed(extra){
    const engine=currentEngineItem(extra);
    const stage=engine?.stage||0;
    const turbo=!!engine?.turbo;
    const multiplier=(1+0.15*stage)*(turbo?1.30:1);
    const projected=Math.round(state.vehicle.baseTopSpeed*multiplier);
    const delta=Math.round((multiplier-1)*100);
    $("#projectedSpeed").innerHTML=projected+' <small>KM/H</small>';
    $("#speedDelta").textContent=(delta>=0?"+":"")+delta+"%";
    $("#speedValue").innerHTML=projected+' <small>KM/H</small>';
    $("#speedBar").style.width=Math.min(100,62+delta*.35)+"%";
  }

  function toast(title,message){
    const el=document.createElement("div");el.className="toast";
    el.innerHTML="<strong>"+escapeHtml(title)+"</strong><span>"+escapeHtml(message)+"</span>";
    $("#toastStack").appendChild(el);
    setTimeout(()=>{el.style.opacity="0";el.style.transform="translateX(10px)";setTimeout(()=>el.remove(),220)},2600);
  }

  async function checkout(){
    if(!state.cart.length)return;
    const totals=state.cart.reduce((a,x)=>({cash:a.cash+(x.cash||0),diamonds:a.diamonds+(x.diamond||0),lei:a.lei+(x.lei||0)}),{cash:0,diamonds:0,lei:0});
    const result=await nui("purchase",{items:state.cart,totals,vehicle:state.vehicle});
    if(result && result.ok!==false){
      toast("Build applied","Payment accepted and modifications committed.");
      if(!RESOURCE){
        state.wallet.cash=Math.max(0,state.wallet.cash-totals.cash);
        state.wallet.diamonds=Math.max(0,state.wallet.diamonds-totals.diamonds);
        state.wallet.lei=Math.max(0,state.wallet.lei-totals.lei);
        renderWallet();
      }
      state.cart=[];renderCart();
    }else toast("Payment failed",result?.message||"The server rejected this checkout.");
  }

  function renderWallet(){
    $("#bankValue").textContent=money(state.wallet.bank);
    $("#cashValue").textContent=money(state.wallet.cash);
    $("#diamondValue").textContent=state.wallet.diamonds.toLocaleString();
    $("#leiValue").textContent=state.wallet.lei.toLocaleString();
  }

  function resetBuild(){
    state.cart=[];state.selected=null;
    nui("resetPreview",{});
    renderCart();renderPanel();updateSelectedPreview();updateProjectedSpeed();
    toast("Preview reset","All queued modifications were cleared.");
  }

  function handleMessage(data){
    if(!data||!data.action)return;
    if(data.action==="open"){
      document.body.style.display="";
      if(data.wallet) state.wallet={...state.wallet,...data.wallet};
      if(data.vehicle) state.vehicle={...state.vehicle,...data.vehicle};
      if(data.capabilities) state.capabilities={...state.capabilities,...data.capabilities,body:{...state.capabilities.body,...(data.capabilities.body||{})}};
      renderWallet();
      $("#vehicleName").textContent=state.vehicle.name||"CURRENT VEHICLE";
      $("#vehiclePlate").textContent=state.vehicle.plate||"";
      if(state.vehicle.power) $("#powerValue").innerHTML=Math.round(state.vehicle.power)+' <small>HP</small>';
      if(state.vehicle.torque) $("#torqueValue").innerHTML=Math.round(state.vehicle.torque)+' <small>NM</small>';
      renderPanel();renderCart();
    }
    if(data.action==="close") document.body.style.display="none";
    if(data.action==="setWallet"&&data.wallet){state.wallet={...state.wallet,...data.wallet};renderWallet();}
    if(data.action==="setVehicle"&&data.vehicle){state.vehicle={...state.vehicle,...data.vehicle};updateProjectedSpeed();}
    if(data.action==="setCapabilities"&&data.capabilities){state.capabilities={...state.capabilities,...data.capabilities,body:{...state.capabilities.body,...(data.capabilities.body||{})}};renderPanel();}
    if(data.action==="purchaseResult") toast(data.success?"Purchase complete":"Purchase failed",data.message||"Server response received.");
  }

  function setupPointerPreview(){
    let down=false,lastX=0;
    $(".center-stage").style.pointerEvents="auto";
    $(".center-stage").addEventListener("pointerdown",e=>{down=true;lastX=e.clientX;});
    window.addEventListener("pointerup",()=>down=false);
    window.addEventListener("pointermove",e=>{
      if(!down)return;const dx=e.clientX-lastX;lastX=e.clientX;
      nui("rotatePreview",{delta:dx});
    });
    $(".center-stage").addEventListener("wheel",e=>{nui("rotatePreview",{zoom:e.deltaY>0?1:-1});},{passive:true});
  }

  function setupKeyboard(){
    window.addEventListener("keydown",e=>{
      if(e.key==="Escape"){nui("close",{});if(!RESOURCE)toast("Close requested","In FiveM this returns focus to the game.");}
      if(e.key==="Enter"&&state.selected) addSelected();
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){
        const rows=$$("[data-option]",$("#panelContent")); if(!rows.length)return;
        e.preventDefault();
        let idx=rows.findIndex(x=>x.classList.contains("active"));
        idx=e.key==="ArrowDown"?Math.min(rows.length-1,idx+1):Math.max(0,idx<0?0:idx-1);
        rows[idx].click();rows[idx].scrollIntoView({block:"nearest",behavior:"smooth"});
      }
    });
  }

  function setupModes(){
    $$(".mode").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".mode").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
      if(btn.dataset.mode!=="tuning") toast(btn.textContent+" view","This shell keeps tuning controls active; wire this tab to your server module.");
    }));
  }

  $("#checkoutBtn").addEventListener("click",checkout);
  $("#resetBtn").addEventListener("click",resetBuild);
  $("#closeBtn").addEventListener("click",()=>nui("close",{}));
  $("#cartToggle").addEventListener("click",()=>$("#configPanel").classList.toggle("cart-focus"));
  window.addEventListener("message",e=>handleMessage(e.data));
  setupPointerPreview();setupKeyboard();setupModes();
  renderRail();renderWallet();renderPanel();renderCart();updateSelectedPreview();updateProjectedSpeed();

  window.VantaTuning = {state,setCategory,handleMessage,resetBuild};
})();