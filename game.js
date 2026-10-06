const SAVE_KEY="ashfall-v3";
const canvas=document.getElementById("worldCanvas");
const ctx=canvas.getContext("2d");
const view=document.getElementById("viewport");

const DATA={
  WORLD:{w:2200,h:1500},
  areas:{
    greywood:{name:"Greywood",sub:"Old Forest",color:"#26332b",spawn:[1010,900]},
    cinder:{name:"Cinder Road",sub:"The Burnt Highway",color:"#382c24",spawn:[390,620]},
    salt:{name:"Saltmarsh",sub:"Drowned Country",color:"#20302c",spawn:[1020,760]},
    high:{name:"Highreach",sub:"Mountain Kingdom",color:"#2e3238",spawn:[1000,1000]},
    ashen:{name:"Ashen Veil",sub:"Ruined Heart",color:"#312625",spawn:[930,720]},
    below:{name:"Below",sub:"Unknown",color:"#121019",spawn:[1040,740]}
  },
  items:[
    {id:"sword",name:"Rusty Sword",type:"Weapon",rarity:"common",slot:"main",power:5,price:18,desc:"A battered blade. Honest, if ugly."},
    {id:"buckler",name:"Oak Buckler",type:"Shield",rarity:"common",slot:"off",armor:4,price:16,desc:"Cheap wood with a surprisingly solid rim."},
    {id:"cloak",name:"Wanderer's Cloak",type:"Armor",rarity:"common",slot:"chest",armor:3,price:14,desc:"Smells of rain and old roads."},
    {id:"iron_sabre",name:"Iron Sabre",type:"Weapon",rarity:"uncommon",slot:"main",power:9,price:55,desc:"A practical road weapon with a balanced grip."},
    {id:"hunter_bow",name:"Hunter's Bow",type:"Weapon",rarity:"uncommon",slot:"main",power:8,crit:4,price:62,desc:"Made for distance and patience."},
    {id:"herald_shield",name:"Herald Shield",type:"Shield",rarity:"rare",slot:"off",armor:9,price:110,desc:"A dented shield bearing a crest nobody remembers."},
    {id:"bone",name:"Bone Knife",type:"Weapon",rarity:"rare",slot:"main",power:10,crit:5,price:95,desc:"Carved from something that wanted to stay alive."},
    {id:"emberring",name:"Ember Ring",type:"Relic",rarity:"rare",slot:"ring",mp:8,magic:4,price:140,desc:"Warm even when it should be cold."},
    {id:"coin",name:"Beggar's Coin",type:"Relic",rarity:"epic",slot:"ring",luck:12,price:1,desc:"It always lands on the side you did not choose."},
    {id:"halberd",name:"Ashen Halberd",type:"Weapon",rarity:"epic",slot:"main",power:17,price:320,desc:"Its edge smolders when blood is near."},
    {id:"needle",name:"Black Needle",type:"Weapon",rarity:"legendary",slot:"main",power:28,crit:18,price:1200,desc:"A weapon found in a dead thief's hand."},
    {id:"field_rations",name:"Field Rations",type:"Consumable",rarity:"common",price:8,heal:22,desc:"Dry bread, salted meat and a small apple."},
    {id:"ember_tonic",name:"Ember Tonic",type:"Consumable",rarity:"uncommon",price:24,mpheal:14,desc:"A medicinal tonic that tastes faintly of smoke."}
  ],
  skills:[
    {id:"strike",name:"Rending Strike",kind:"Combat",lvl:1,cost:0,desc:"A brutal weapon strike."},
    {id:"guard",name:"Iron Guard",kind:"Defense",lvl:1,cost:6,desc:"Brace and reduce the next incoming hit."},
    {id:"focus",name:"Deep Focus",kind:"Arcane",lvl:2,cost:8,desc:"Recover MP and sharpen your next attacks."},
    {id:"ember",name:"Embercraft",kind:"Elemental",lvl:3,cost:10,desc:"Hurl a burning fragment of your will."},
    {id:"bloodstep",name:"Bloodstep",kind:"Forbidden",lvl:4,cost:12,desc:"Trade 10 HP for a guaranteed critical."},
    {id:"veil",name:"Veilwalking",kind:"Shadow",lvl:6,cost:18,desc:"Step half a second outside the world."}
  ],
  classes:[
    {id:"unbound",name:"Unbound",rarity:"common",desc:"No oath. No class. No expectations.",req:"Your story begins without a class."},
    {id:"sellsword",name:"Sellsword",rarity:"common",desc:"A practical fighter who learned to survive.",req:"Reach level 3 after taking the Red Coin contract."},
    {id:"warden",name:"Warden",rarity:"rare",desc:"A protector without a kingdom.",req:"Refuse the Road Warden's offer and learn Guard."},
    {id:"hex",name:"Hexblade",rarity:"epic",desc:"Steel has learned the language of curses.",req:"Learn Embercraft while carrying the Ember Ring."},
    {id:"blood",name:"Blood Knight",rarity:"legendary",desc:"Pain is a resource. Fear is a lie.",req:"A hidden trial involving the Road Warden."},
    {id:"fool",name:"Fool",rarity:"rare",desc:"Everyone thinks you are joking. That is useful.",req:"Fail three class trials while carrying the Beggar's Coin."},
    {id:"void",name:"Void-Touched",rarity:"mythic",desc:"The world noticed you looking beneath it.",req:"Discover the path Below."}
  ],
  enemies:{
    wolf:{id:"wolf",name:"Grey Wolf",level:1,hp:42,power:9,armor:2,xp:35,gold:12,loot:"bone"},
    bandit:{id:"bandit",name:"Cinder Bandit",level:2,hp:66,power:12,armor:4,xp:52,gold:26,loot:"halberd"},
    bog:{id:"bog",name:"Bogling",level:3,hp:86,power:14,armor:5,xp:70,gold:34,loot:"emberring"},
    warden:{id:"warden",name:"The Road Warden",level:5,hp:190,power:23,armor:8,xp:180,gold:120,loot:"needle"}
  }
};

const BASE=()=>({
  player:{
    name:"Ashborn",level:1,xp:0,gold:40,hp:100,maxHp:100,mp:24,maxMp:24,
    str:7,dex:6,int:5,vit:6,luck:1,armor:0,crit:4,magic:0,classId:"unbound",
    skills:["strike"],inv:["sword","buckler","cloak"],eq:{main:"sword",off:"buckler",chest:"cloak",ring:null},
    flags:{red:false,bribe:false,firstBoss:false,blood:false,fool:0,secret:false,mayorTrust:0,farmerQuest:0,bridge:0},
    area:"greywood",x:1010,y:1005
  },
  quest:{stage:0,title:"A Door in the Fog",text:"Find the old waystone beyond Greywood. Someone has left a mark there that looks almost like your name."},
  known:["greywood","cinder","salt"],dead:[],log:["The road gives way to trees.","Greywood is quieter than a village this close to a trade road should be."],
  relations:{mara:0,bram:0,pella:0,elian:0,tomas:0,mae:0,kael:0},
  world:{minutes:8*60+17,weather:"clear",day:1}
});

let S=loadSave(),keys={},nearEntity=null,combat=null,dialogue=false,cam={x:0,y:0},last=performance.now(),uiTick=0;
if(S.player.area==="greywood" && S.player.x>900 && S.player.x<1170 && S.player.y>745 && S.player.y<925){
  S.player.x=1010;S.player.y=1005;save();
}

const item=id=>DATA.items.find(x=>x.id===id);
const skill=id=>DATA.skills.find(x=>x.id===id);
const cls=id=>DATA.classes.find(x=>x.id===id);
const enemy=id=>DATA.enemies[id];
const area=id=>DATA.areas[id];

function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){
      const saved=JSON.parse(raw), fresh=BASE();
      return {
        ...fresh,...saved,
        player:{...fresh.player,...saved.player,flags:{...fresh.player.flags,...(saved.player?.flags||{}),relations:{...fresh.player.relations,...(saved.player?.relations||{})}}},
        quest:{...fresh.quest,...(saved.quest||{})},
        world:{...fresh.world,...(saved.world||{})},
        relations:{...fresh.relations,...(saved.relations||{})}
      };
    }
  }catch(err){console.warn(err)}
  return BASE();
}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(S))}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function xpNeed(){return 100+(S.player.level-1)*65}
function attackPower(){const w=item(S.player.eq.main);return(w?.power||1)+S.player.str*1.45+S.player.dex*.35}
function armor(){let n=S.player.armor;for(const id of Object.values(S.player.eq)){const i=item(id);if(i?.armor)n+=i.armor}return n}
function crit(){let n=S.player.crit;for(const id of Object.values(S.player.eq)){const i=item(id);if(i?.crit)n+=i.crit}return n}
function magic(){let n=S.player.magic;for(const id of Object.values(S.player.eq)){const i=item(id);if(i?.magic)n+=i.magic}
return n}
function addLog(t){S.log.unshift(t);S.log=S.log.slice(0,45);document.getElementById("worldLog").innerHTML=S.log.slice(0,10).map(x=>"<div class='log-entry'>"+x+"</div>").join("");save()}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove("show"),2300)}
function pop(t,type=""){const e=document.getElementById("floatingText");e.textContent=t;e.className="floating-text show "+type;setTimeout(()=>e.className="floating-text",1050)}
function timeString(){let m=Math.floor(S.world.minutes%(24*60));let h=Math.floor(m/60),min=m%60;const ap=h>=12?"PM":"AM";h=h%12||12;return String(h).padStart(2,"0")+":"+String(min).padStart(2,"0")+" "+ap}
function isNight(){const m=S.world.minutes%(24*60);return m<5*60||m>20*60}
function advanceTime(minutes){S.world.minutes+=minutes;while(S.world.minutes>=24*60){S.world.minutes-=24*60;S.world.day++}if(Math.random()<.08)S.world.weather=["clear","mist","rain"][Math.floor(Math.random()*3)]}

function addXP(n){
  S.player.xp+=n;
  while(S.player.xp>=xpNeed()){
    S.player.xp-=xpNeed();S.player.level++;S.player.maxHp+=14;S.player.maxMp+=4;S.player.hp=S.player.maxHp;S.player.mp=S.player.maxMp;
    S.player.str++;S.player.vit++;if(S.player.level%2===0)S.player.dex++;if(S.player.level%3===0)S.player.int++;
    addLog("<b>LEVEL UP</b> You are now level "+S.player.level+".");
    toast("LEVEL "+S.player.level);
    discoverSkill();
  }
  evaluateClasses();renderCore()
}
function discoverSkill(){
  const candidates=DATA.skills.filter(s=>s.lvl<=S.player.level&&!S.player.skills.includes(s.id));
  if(candidates.length&&Math.random()<.78){const s=candidates[Math.floor(Math.random()*candidates.length)];S.player.skills.push(s.id);addLog("<b>SKILL DISCOVERED</b> "+s.name+" — "+s.desc);toast("Skill discovered: "+s.name)}
}
function evaluateClasses(){
  const p=S.player;
  if(p.level>=3&&p.flags.red&&p.classId==="unbound")unlockClass("sellsword");
  if(p.flags.bribe&&p.skills.includes("guard")&&p.classId==="unbound")unlockClass("warden");
  if(p.skills.includes("ember")&&p.inv.includes("emberring")&&p.classId==="unbound")unlockClass("hex");
  if(p.flags.secret&&p.classId!=="void")unlockClass("void");
  if(p.flags.fool>=3&&p.inv.includes("coin")&&p.classId==="unbound")unlockClass("fool");
}
function unlockClass(id){const c=cls(id);S.player.classId=id;addLog("<b>CLASS DISCOVERED</b> "+c.name+" ["+c.rarity.toUpperCase()+"] — "+c.desc);toast("CLASS DISCOVERED — "+c.name);renderCore()}

const village={buildings:[
  {id:"inn",x:1040,y:830,w:250,h:170,name:"The Lantern & Loaf",color:"#76533b"},
  {id:"smithy",x:1370,y:760,w:220,h:150,name:"Bram's Smithy",color:"#5d4d45"},
  {id:"clinic",x:760,y:790,w:170,h:140,name:"Elian's Clinic",color:"#6f806f"},
  {id:"chapel",x:620,y:1010,w:190,h:145,name:"Chapel of the Quiet Star",color:"#6d6a63"},
  {id:"manor",x:1480,y:1050,w:190,h:180,name:"Village Hall",color:"#73563e"},
  {id:"house1",x:390,y:930,w:150,h:120,name:"Bram's House",color:"#725136"},
  {id:"house2",x:450,y:1190,w:180,h:125,name:"Tomas's Farmhouse",color:"#6f5135"},
  {id:"house3",x:1090,y:1180,w:150,h:115,name:"Mae's Cottage",color:"#65523d"},
  {id:"warehouse",x:1700,y:790,w:170,h:125,name:"Old Granary",color:"#5e4734"}
]};
const roads=[
  [[80,1040],[390,1020],[690,980],[1040,940],[1390,960],[2100,920]],
  [[1030,360],[1040,640],[1040,940],[1030,1410]],
  [[670,980],[590,1180],[560,1430]]
];
const ponds=[{x:1690,y:270,rx:270,ry:150},{x:260,y:560,rx:145,ry:92}];
const trees=[],rocks=[];
function reseedDecor(){
  trees.length=0;rocks.length=0;
  let rng=mulberry(90210);
  for(let i=0;i<150;i++){const x=60+rng()*2080,y=70+rng()*1360;if(x>330&&x<1750&&y>650&&y<1280)continue;trees.push({x,y,s:.65+rng()*1.2,t:Math.floor(rng()*4)})}
  for(let i=0;i<65;i++)rocks.push({x:50+rng()*2100,y:80+rng()*1320,s:.6+rng()*1.2})
}
function mulberry(a){return()=>{let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
reseedDecor();

function buildingAt(x,y){
  if(S.player.area!=="greywood")return null;
  return village.buildings.find(b=>x>b.x-b.w/2-22&&x<b.x+b.w/2+22&&y>b.y-b.h/2-22&&y<b.y+b.h/2+22)||null
}
function solidTreeAt(x,y){
  if(S.player.area!=="greywood")return false;
  return trees.some(t=>Math.hypot(x-t.x,y-t.y)<24*t.s);
}
function canMove(x,y){
  if(x<30||y<50||x>DATA.WORLD.w-30||y>DATA.WORLD.h-35)return false;
  if(buildingAt(x,y))return false;
  if(solidTreeAt(x,y))return false;
  for(const p of ponds)if(Math.pow((x-p.x)/p.rx,2)+Math.pow((y-p.y)/p.ry,2)<1)return false;
  return true
}
function movement(dt){
  if(combat||dialogue)return;
  let dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);
  if(!dx&&!dy)return;
  const len=Math.hypot(dx,dy);dx/=len;dy/=len;
  const speed=235;
  const nx=S.player.x+dx*speed*dt,ny=S.player.y+dy*speed*dt;
  if(canMove(nx,S.player.y))S.player.x=nx;
  if(canMove(S.player.x,ny))S.player.y=ny;
  S.world.minutes+=dt*0.65;
}

function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight,dpr=devicePixelRatio||1;
  if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  cam.x=clamp(S.player.x-w/2,0,DATA.WORLD.w-w);cam.y=clamp(S.player.y-h/2,0,DATA.WORLD.h-h);
  ctx.clearRect(0,0,w,h);
  drawScene(w,h);findNear();
}
function drawScene(w,h){
  drawBase(w,h);
  ctx.save();ctx.translate(-cam.x,-cam.y);
  if(S.player.area==="greywood")drawGreywood();
  if(S.player.area==="cinder")drawCinder();
  if(S.player.area==="salt")drawSalt();
  if(S.player.area==="high")drawHigh();
  if(S.player.area==="ashen")drawAshen();
  if(S.player.area==="below")drawBelow();
  drawEntities();
  drawPlayer();
  ctx.restore();
  drawLighting(w,h);
}
function drawBase(w,h){ctx.fillStyle=area(S.player.area)?.color||"#26332b";ctx.fillRect(0,0,w,h)}
function pathStroke(points,width,color,inner){ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();if(inner){ctx.strokeStyle=inner;ctx.lineWidth=width-12;ctx.stroke()}ctx.lineWidth=1}
function drawGreywood(){
  ctx.fillStyle="#303a31";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);
  for(const p of ponds)drawPond(p);
  roads.forEach(r=>pathStroke(r,82,"#4d4338","#705944"));
  pathStroke([[1040,760],[1040,550],[1060,380]],40,"#55463b","#77604a");
  drawMarket();
  village.buildings.forEach(drawBuilding);
  drawFences();drawGarden();drawBridge();
  for(const r of rocks)drawRock(r.x,r.y,r.s);
  for(const t of trees)drawTree(t);
  drawLanterns();
  drawVillageSigns();
}
function drawCinder(){
  ctx.fillStyle="#3a3029";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);
  pathStroke([[0,760],[450,720],[900,690],[1320,720],[2200,700]],105,"#5b493a","#7a5d42");
  for(let i=0;i<65;i++){let x=50+(i*137)%2100,y=120+(i*83)%1050;ctx.fillStyle="#241d19";ctx.fillRect(x,y,10,82);ctx.fillStyle="#38261e";ctx.beginPath();ctx.arc(x+5,y,28,0,7);ctx.fill()}
  drawCamp(1090,610);drawWagon(670,690);drawSign(760,630)
}
function drawSalt(){ctx.fillStyle="#20322d";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);for(let i=0;i<18;i++){let x=100+i*120,y=150+(i*157)%1000;ctx.fillStyle="#27473d";ctx.beginPath();ctx.ellipse(x,y,90,48,0,0,7);ctx.fill()}pathStroke([[0,900],[470,830],[850,860],[1250,810],[2200,850]],74,"#4c4034","#695844");drawShrine(1180,560);drawWaterPatch(500,420);drawWaterPatch(1500,600)}
function drawHigh(){ctx.fillStyle="#30343a";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);for(let i=0;i<10;i++){let x=i*250;ctx.fillStyle=i%2?"#41474d":"#363c42";ctx.beginPath();ctx.moveTo(x,1100);ctx.lineTo(x+125,140+(i%3)*55);ctx.lineTo(x+245,1100);ctx.closePath();ctx.fill()}pathStroke([[80,1280],[400,1120],[640,900],[910,720],[1200,570]],80,"#5f513f","#7c664b");drawFortress(1280,470)}
function drawAshen(){ctx.fillStyle="#302724";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);for(let i=0;i<28;i++){let x=80+i*77,y=160+(i*91)%900;ctx.fillStyle="#4b403b";ctx.fillRect(x,y,28,135);ctx.fillStyle="#68584d";ctx.fillRect(x-10,y-12,49,14)}drawObelisk(1040,530);drawAshGate(1540,780)}
function drawBelow(){ctx.fillStyle="#111019";ctx.fillRect(0,0,DATA.WORLD.w,DATA.WORLD.h);for(let i=0;i<150;i++){ctx.fillStyle=i%5===0?"#6d4e8a":"#2d2a40";ctx.fillRect((i*137)%2150,(i*83)%1400,2,2)}pathStroke([[0,1050],[380,930],[760,970],[1100,800],[1540,830],[2200,700]],60,"#272238","#403652");drawObelisk(1160,730);drawVoidGate(1620,560)}
function drawPond(p){ctx.fillStyle="#1f4148";ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,0,0,7);ctx.fill();ctx.strokeStyle="#5b8184";ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.strokeStyle="#38636a";ctx.beginPath();ctx.ellipse(p.x-p.rx*.45+i*70,p.y-8+i*16,45,7,0,0,7);ctx.stroke()}}
function drawBuilding(b){ctx.save();ctx.translate(b.x,b.y);const w=b.w,h=b.h;ctx.fillStyle="#171411";ctx.shadowColor="#0008";ctx.shadowBlur=18;ctx.fillRect(-w/2+8,-h/2+12,w,h);ctx.shadowBlur=0;ctx.fillStyle=b.color;ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle="#9a7048";ctx.beginPath();ctx.moveTo(-w/2-15,-h/2);ctx.lineTo(0,-h/2-65);ctx.lineTo(w/2+15,-h/2);ctx.closePath();ctx.fill();ctx.fillStyle="#24201b";ctx.fillRect(-18,15,36,h/2-15);ctx.fillStyle="#d2aa69";ctx.fillRect(w*.22,-4,12,18);ctx.fillRect(-w*.3,-4,12,18);ctx.strokeStyle="#3c3028";ctx.strokeRect(-w/2,-h/2,w,h);ctx.restore();drawWorldLabel(b.x,b.y+h/2+18,b.name,"#d6bd8e")}
function drawMarket(){ctx.fillStyle="#6a533e";for(let i=0;i<5;i++){let x=450+i*120;ctx.fillRect(x,760,72,48);ctx.fillStyle=["#8c5246","#6a7e73","#a17a4d"][i%3];ctx.beginPath();ctx.moveTo(x-8,760);ctx.lineTo(x+36,730);ctx.lineTo(x+80,760);ctx.closePath();ctx.fill();ctx.fillStyle="#6a533e"}}
function drawFences(){ctx.strokeStyle="#59412f";ctx.lineWidth=7;[[300,1080,700,1080],[1320,1120,1700,1120],[340,720,480,720]].forEach(r=>{ctx.beginPath();ctx.moveTo(r[0],r[1]);ctx.lineTo(r[2],r[3]);ctx.stroke();for(let x=r[0];x<=r[2];x+=42)ctx.fillRect(x-2,r[1]-25,5,50)});ctx.lineWidth=1}
function drawGarden(){for(let i=0;i<28;i++){let x=360+(i%7)*35,y=1120+Math.floor(i/7)*24;ctx.fillStyle=i%2?"#3d633d":"#536b3e";ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill()}}
function drawBridge(){ctx.fillStyle="#60462f";ctx.fillRect(1600,330,190,62);for(let x=1600;x<1790;x+=22){ctx.fillStyle="#8b6848";ctx.fillRect(x,328,14,6);}}
function drawLanterns(){for(let i=0;i<10;i++){let x=480+i*125,y=945+(i%2)*35;ctx.strokeStyle="#4d392a";ctx.fillStyle="#d6a64f";ctx.fillRect(x,y-30,6,30);ctx.fillRect(x-5,y-37,16,11);}}
function drawVillageSigns(){drawSign(940,650);drawSign(1810,860)}
function drawTree(t){ctx.save();ctx.translate(t.x,t.y);const s=t.s;const tops=[["#16291b","#25432a"],["#1b2c20","#2e4d31"],["#18271d","#36583a"],["#1d3020","#3a5938"]][t.t];ctx.fillStyle="#31241d";ctx.fillRect(-8*s,4*s,16*s,48*s);ctx.fillStyle=tops[0];ctx.beginPath();ctx.arc(-16*s,-3*s,27*s,0,7);ctx.arc(12*s,-8*s,31*s,0,7);ctx.arc(0,-27*s,33*s,0,7);ctx.fill();ctx.fillStyle=tops[1];ctx.beginPath();ctx.arc(7*s,-30*s,21*s,0,7);ctx.fill();ctx.restore()}
function drawRock(x,y,s){ctx.save();ctx.translate(x,y);ctx.fillStyle="#46504a";ctx.beginPath();ctx.moveTo(-18*s,11*s);ctx.lineTo(-9*s,-15*s);ctx.lineTo(8*s,-19*s);ctx.lineTo(20*s,5*s);ctx.lineTo(8*s,17*s);ctx.closePath();ctx.fill();ctx.strokeStyle="#748076";ctx.stroke();ctx.restore()}
function drawCamp(x,y){ctx.fillStyle="#513a28";ctx.beginPath();ctx.arc(x,y,56,0,7);ctx.fill();ctx.fillStyle="#e19a4f";ctx.beginPath();ctx.arc(x,y,13,0,7);ctx.fill();ctx.fillStyle="#5d442d";ctx.fillRect(x-85,y-50,35,25);ctx.fillRect(x+52,y-42,37,27)}
function drawWagon(x,y){ctx.fillStyle="#68472e";ctx.fillRect(x-45,y-30,90,43);ctx.strokeStyle="#2d2119";ctx.lineWidth=9;ctx.beginPath();ctx.arc(x-31,y+16,18,0,7);ctx.arc(x+31,y+16,18,0,7);ctx.stroke();ctx.lineWidth=1}
function drawSign(x,y){ctx.fillStyle="#553a27";ctx.fillRect(x-4,y-58,8,72);ctx.fillStyle="#9b7345";ctx.fillRect(x-58,y-76,116,33);ctx.fillStyle="#221b16";ctx.font="11px serif";ctx.textAlign="center";ctx.fillText("GREYWOOD",x,y-53)}
function drawShrine(x,y){ctx.fillStyle="#6a635a";ctx.fillRect(x-10,y-80,20,140);ctx.fillStyle="#a28c69";ctx.beginPath();ctx.moveTo(x-30,y-80);ctx.lineTo(x,y-122);ctx.lineTo(x+30,y-80);ctx.closePath();ctx.fill();ctx.strokeStyle="#c3a66e";ctx.stroke()}
function drawWaterPatch(x,y){ctx.fillStyle="#1b454b";ctx.beginPath();ctx.ellipse(x,y,90,40,0,0,7);ctx.fill()}
function drawFortress(x,y){ctx.fillStyle="#62676a";ctx.fillRect(x-180,y-110,360,230);ctx.fillRect(x-205,y-160,65,280);ctx.fillRect(x+140,y-160,65,280);ctx.fillStyle="#25282a";ctx.fillRect(x-28,y+30,56,90);ctx.fillStyle="#a29379";ctx.fillRect(x-13,y-155,26,45)}
function drawObelisk(x,y){ctx.fillStyle="#685e56";ctx.beginPath();ctx.moveTo(x-32,y+55);ctx.lineTo(x-15,y-105);ctx.lineTo(x+12,y-135);ctx.lineTo(x+34,y+55);ctx.closePath();ctx.fill();ctx.strokeStyle="#b69361";ctx.stroke()}
function drawAshGate(x,y){ctx.strokeStyle="#8d6660";ctx.lineWidth=12;ctx.strokeRect(x-70,y-100,140,190);ctx.lineWidth=1}
function drawVoidGate(x,y){ctx.strokeStyle="#8f72b5";ctx.lineWidth=7;ctx.beginPath();ctx.arc(x,y,58,0,7);ctx.stroke();ctx.lineWidth=1}
function drawEntities(){
  const list=getEntities();
  for(const o of list){
    if(o.type==="npc")drawNpc(o);
    else if(o.type==="enemy")drawEnemy(o);
    else if(o.type==="exit")drawExit(o);
    else if(o.type==="portal")drawPortal(o);
    else if(o.type==="landmark")drawLandmark(o);
    else if(o.type==="board")drawBoard(o);
  }
}
function npcPosition(id){const m=Math.floor(S.world.minutes%(24*60));const day=m>=6*60&&m<20*60;
  const schedules={
    mara: day?(m<10*60?[870,945]:m<14*60?[1180,945]:[860,655]):[1050,875],
    bram: day?(m<9*60?[1370,690]:[1415,825]):[1510,835],
    pella: day?(m<11*60?[1090,790]:m<18*60?[1130,900]:[1080,840]):[1080,840],
    elian: day?(m<13*60?[800,760]:[840,840]):[810,820],
    tomas: day?(m<12*60?[560,1070]:[690,1100]):[560,1190],
    mae: day?(m<17*60?[560,980]:[690,1090]):[675,1040],
    kael: day?(m<15*60?[1860,520]:[1760,690]):[1880,610]
  };return schedules[id]||[1000,900]}
function getEntities(){
  const a=[];
  if(S.player.area==="greywood"){
    const ids=[["mara","npc","Mara"],["bram","npc","Bram"],["pella","npc","Pella"],["elian","npc","Elian"],["tomas","npc","Tomas"],["mae","npc","Sister Mae"],["kael","npc","Kael"]];
    for(const [id,type,name] of ids){const [x,y]=npcPosition(id);a.push({id,type,name,x,y})}
    a.push({id:"way",type:"landmark",x:850,y:520,name:"The Old Waystone"});
    a.push({id:"wolf",type:"enemy",x:1240,y:570,name:"Grey Wolf"});
    a.push({id:"board",type:"board",x:930,y:790,name:"Notice Board"});
    a.push({id:"cinder",type:"exit",x:150,y:920,name:"Cinder Road"});
    a.push({id:"salt",type:"exit",x:1990,y:920,name:"Saltmarsh"});
    if(S.player.level>=4&&S.quest.stage>=1)a.push({id:"below",type:"portal",x:1870,y:410,name:"Sealed Hollow"});
  }else if(S.player.area==="cinder"){
    a.push({id:"mara",type:"npc",name:"Mara",x:860,y:650});a.push({id:"warden",type:"enemy",name:"The Road Warden",x:1250,y:690,boss:true});a.push({id:"bandit",type:"enemy",name:"Cinder Bandit",x:800,y:760});a.push({id:"greywood",type:"exit",name:"Greywood",x:130,y:820});a.push({id:"salt",type:"exit",name:"Saltmarsh",x:1990,y:780})
  }else if(S.player.area==="salt"){
    a.push({id:"shrine",type:"landmark",name:"Drowned Shrine",x:1180,y:560});a.push({id:"bog",type:"enemy",name:"Bogling",x:980,y:720});a.push({id:"greywood",type:"exit",name:"Greywood",x:1970,y:920});if(S.player.level>=5)a.push({id:"high",type:"portal",name:"Mountain Gate",x:1850,y:310})
  }else if(S.player.area==="high"){a.push({id:"ashen",type:"exit",name:"Ashen Veil",x:310,y:1250});a.push({id:"greywood",type:"exit",name:"Greywood",x:1940,y:1280})}
  else if(S.player.area==="ashen"){a.push({id:"below",type:"portal",name:"The Door Below",x:1040,y:520});a.push({id:"high",type:"exit",name:"Highreach",x:1900,y:1100})}
  else if(S.player.area==="below"){a.push({id:"void",type:"landmark",name:"Hollow Gate",x:1160,y:730});a.push({id:"high",type:"exit",name:"A Stair Up",x:1450,y:1200});a.push({id:"warden",type:"enemy",name:"Something Wearing a Crown",x:1420,y:670,boss:true})}
  return a.filter(o=>!o.hidden)
}
function drawWorldLabel(x,y,name,color="#e5e9ef"){ctx.font="10px Inter, sans-serif";ctx.textAlign="center";const tw=ctx.measureText(name).width+16;ctx.fillStyle="rgba(5,7,10,.84)";ctx.fillRect(x-tw/2,y,tw,21);ctx.strokeStyle="rgba(215,168,92,.30)";ctx.strokeRect(x-tw/2,y,tw,21);ctx.fillStyle=color;ctx.fillText(name,x,y+14)}
function drawNpc(o){ctx.save();ctx.translate(o.x,o.y);ctx.fillStyle="#27313a";ctx.beginPath();ctx.arc(0,2,27,0,7);ctx.fill();ctx.fillStyle=o.id==="mae"?"#d0c2a8":"#c18b61";ctx.beginPath();ctx.arc(0,-15,11,0,7);ctx.fill();ctx.fillStyle=o.id==="bram"?"#4f3b2f":o.id==="elian"?"#6f816b":o.id==="mara"?"#7c4f42":"#4e5660";ctx.fillRect(-16,-4,32,38);ctx.fillStyle="#b5a076";ctx.fillRect(-5,34,4,10);ctx.fillRect(2,34,4,10);ctx.restore();drawWorldLabel(o.x,o.y+58,o.name,o.id==="kael"?"#b6a8df":"#d8c49b")}
function drawEnemy(o){ctx.save();ctx.translate(o.x,o.y);ctx.fillStyle=o.boss?"#5c2633":"#32171e";ctx.beginPath();ctx.arc(0,0,o.boss?38:31,0,7);ctx.fill();ctx.strokeStyle=o.boss?"#e06b6d":"#86404d";ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;ctx.fillStyle="#e47779";ctx.beginPath();ctx.arc(-9,-4,4,0,7);ctx.arc(9,-4,4,0,7);ctx.fill();ctx.restore();drawWorldLabel(o.x,o.y+45,o.name,o.boss?"#ef9a86":"#d47c80")}
function drawExit(o){ctx.fillStyle="#765536";ctx.fillRect(o.x-54,o.y-68,108,108);ctx.fillStyle="#a57a49";ctx.beginPath();ctx.moveTo(o.x-68,o.y-68);ctx.lineTo(o.x,o.y-120);ctx.lineTo(o.x+68,o.y-68);ctx.closePath();ctx.fill();ctx.fillStyle="#1a1410";ctx.fillRect(o.x-18,o.y-20,36,52);drawWorldLabel(o.x,o.y+45,o.name,"#d5bc8a")}
function drawPortal(o){ctx.strokeStyle="#947cb8";ctx.lineWidth=5;ctx.beginPath();ctx.arc(o.x,o.y,39,0,7);ctx.stroke();ctx.fillStyle="#211a30";ctx.beginPath();ctx.arc(o.x,o.y,31,0,7);ctx.fill();ctx.lineWidth=1;drawWorldLabel(o.x,o.y+51,o.name,"#b7a2ff")}
function drawLandmark(o){ctx.fillStyle="#6f604f";ctx.beginPath();ctx.moveTo(o.x-25,o.y+28);ctx.lineTo(o.x-18,o.y-25);ctx.lineTo(o.x,o.y-52);ctx.lineTo(o.x+18,o.y-25);ctx.lineTo(o.x+25,o.y+28);ctx.closePath();ctx.fill();ctx.strokeStyle="#c2a66e";ctx.stroke();drawWorldLabel(o.x,o.y+39,o.name,"#d8bd7f")}
function drawBoard(o){ctx.fillStyle="#553b27";ctx.fillRect(o.x-44,o.y-54,88,62);ctx.fillStyle="#a38153";ctx.fillRect(o.x-36,o.y-45,72,41);ctx.fillStyle="#dfc68f";for(let i=0;i<4;i++)ctx.fillRect(o.x-25,o.y-38+i*9,50,3);drawWorldLabel(o.x,o.y+24,o.name,"#d8bd80")}
function drawPlayer(){
  const x=S.player.x-cam.x,y=S.player.y-cam.y;
  ctx.save();
  ctx.translate(x,y);

  // Ground shadow + player marker: make the protagonist unmistakable.
  ctx.fillStyle="rgba(0,0,0,.38)";
  ctx.beginPath();ctx.ellipse(0,26,30,10,0,0,Math.PI*2);ctx.fill();

  const pulse=3+Math.sin(performance.now()/260)*2;
  ctx.strokeStyle="rgba(240,199,108,.55)";
  ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,28,38+pulse,12,0,0,Math.PI*2);ctx.stroke();
  ctx.lineWidth=1;

  // Cloak silhouette.
  ctx.fillStyle="#6e4c35";
  ctx.beginPath();
  ctx.moveTo(-18,-2);ctx.quadraticCurveTo(-28,10,-24,30);
  ctx.lineTo(24,30);ctx.quadraticCurveTo(28,10,18,-2);ctx.closePath();ctx.fill();

  // Torso / belt.
  ctx.fillStyle="#3b2930";ctx.fillRect(-15,-7,30,30);
  ctx.fillStyle="#a47b49";ctx.fillRect(-18,8,36,7);
  ctx.fillStyle="#dfc078";ctx.fillRect(-3,7,7,8);

  // Boots.
  ctx.fillStyle="#211c1c";ctx.fillRect(-11,22,8,13);ctx.fillRect(3,22,8,13);

  // Head + hair.
  ctx.fillStyle="#d6a171";ctx.beginPath();ctx.arc(0,-18,11,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#33231f";ctx.beginPath();ctx.arc(0,-21,12,Math.PI,Math.PI*2);ctx.fill();

  // Shoulder guard.
  ctx.fillStyle="#8d744d";ctx.beginPath();ctx.arc(-17,0,7,0,Math.PI*2);ctx.fill();

  // Equipped weapon — visible at a readable scale.
  const weapon=item(S.player.eq.main);
  if(weapon&&weapon.type==="Weapon"){
    ctx.strokeStyle=weapon.rarity==="legendary"?"#f0c66f":"#d9d5c8";
    ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(17,10);ctx.lineTo(34,-14);ctx.stroke();
    ctx.strokeStyle="#5f3d29";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(14,12);ctx.lineTo(20,18);ctx.stroke();
    ctx.lineWidth=1;
  }

  // Tiny protagonist crown/chevron above the head.
  ctx.fillStyle="#f0ca78";
  ctx.beginPath();ctx.moveTo(0,-42);ctx.lineTo(-7,-33);ctx.lineTo(7,-33);ctx.closePath();ctx.fill();

  // Nameplate follows the character.
  ctx.font="bold 10px Inter, sans-serif";
  ctx.textAlign="center";
  const label=S.player.name||"Ashborn";
  const tw=ctx.measureText(label).width+18;
  ctx.fillStyle="rgba(5,7,10,.90)";
  ctx.fillRect(-tw/2,-66,tw,20);
  ctx.strokeStyle="rgba(240,199,108,.58)";
  ctx.strokeRect(-tw/2,-66,tw,20);
  ctx.fillStyle="#f0d39a";
  ctx.fillText(label,0,-52);

  ctx.restore();
}
function drawLighting(w,h){
  let alpha=0;
  const m=S.world.minutes%(24*60);
  if(m<6*60)alpha=.42*(1-m/(6*60)); else if(m>18*60)alpha=.16+(m-18*60)/(6*60)*.26;
  if(S.world.weather==="mist")alpha+=.08;
  if(S.world.weather==="rain")alpha+=.04;
  if(alpha>0){ctx.fillStyle="rgba(7,10,18,"+Math.min(.6,alpha)+")";ctx.fillRect(0,0,w,h)}
  if(S.world.weather==="rain"){ctx.strokeStyle="rgba(160,190,210,.22)";ctx.lineWidth=1;for(let i=0;i<90;i++){let x=(i*83+S.world.minutes*18)%w,y=(i*47)%h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+15);ctx.stroke()}}
  if(S.world.weather==="mist"){ctx.fillStyle="rgba(200,210,200,.045)";for(let i=0;i<6;i++)ctx.fillRect(0,70+i*h/6,w,45)}
}
function findNear(){
  nearEntity=null;if(combat||dialogue){document.getElementById("interactionPrompt").classList.add("hidden");return}
  let best=88;for(const o of getEntities()){const d=Math.hypot(o.x-S.player.x,o.y-S.player.y);if(d<best){best=d;nearEntity=o}}
  const p=document.getElementById("interactionPrompt");if(nearEntity){p.classList.remove("hidden");const label=nearEntity.type==="enemy"?"Engage ":nearEntity.type==="exit"?"Travel to ":nearEntity.type==="portal"?"Investigate ":nearEntity.type==="board"?"Read ":"Talk to ";p.innerHTML="<b>E</b>  "+label+nearEntity.name}else p.classList.add("hidden")
}

function startCombat(id){const base=enemy(id)||enemy("wolf");combat={e:{...base},guard:false,veil:false,focus:false};document.getElementById("combatHud").classList.remove("hidden");renderCombat();addLog("A "+base.name+" blocks your path.")}
function renderCombat(){if(!combat)return;const e=combat.e;document.getElementById("combatHud").innerHTML="<div class='combat-box'><div class='combat-sub'>ENCOUNTER</div><div class='combat-name'>"+e.name+"</div><div class='combat-sub'>LEVEL "+e.level+"</div><div class='bar' style='margin-top:13px'><i class='hp' style='width:"+(e.hp/(enemy(e.id)?.hp||e.hp)*100)+"%'></i></div><div class='combat-grid'><div class='combat-stat'><div class='combat-sub'>YOU</div><b>"+Math.round(S.player.hp)+" / "+S.player.maxHp+" HP</b><br><span class='muted'>"+Math.round(S.player.mp)+" / "+S.player.maxMp+" MP</span></div><div class='combat-stat'><div class='combat-sub'>ENEMY</div><b>"+e.hp+" / "+(enemy(e.id)?.hp||e.hp)+" HP</b><br><span class='muted'>ARMOR "+e.armor+"</span></div></div><div class='combat-actions'><button class='primary' data-combat='strike'>STRIKE</button>"+S.player.skills.map(id=>skill(id)).filter(Boolean).map(s=>"<button data-combat='"+s.id+"'>"+s.name+" <small>"+s.cost+" MP</small></button>").join("")+"<button data-combat='flee'>FLEE</button></div></div>"}
function enemyTurn(){if(!combat)return;let e=combat.e;let dmg=Math.max(1,Math.round(e.power-armor()*.42+Math.random()*5));if(combat.guard){dmg=Math.max(1,Math.round(dmg*.4));combat.guard=false}if(combat.veil){dmg=0;combat.veil=false}S.player.hp=Math.max(0,S.player.hp-dmg);if(dmg)pop("-"+dmg,"bad");else pop("DODGE","good");if(S.player.hp<=0){fall();return}renderCore();renderCombat()}
function strike(){if(!combat)return;const isCrit=Math.random()*100<crit();let d=Math.max(1,Math.round(attackPower()*(isCrit?1.9:1)-combat.e.armor*.6));if(combat.focus)d=Math.round(d*1.2);combat.e.hp=Math.max(0,combat.e.hp-d);pop((isCrit?"CRIT ":"")+d,isCrit?"crit":"");if(combat.e.hp<=0){victory();return}enemyTurn()}
function combatSkill(id){if(!combat)return;const s=skill(id);if(!s)return;if(s.cost>S.player.mp){toast("Not enough MP");return}if(id==="strike"){strike();return}S.player.mp-=s.cost;if(id==="guard"){combat.guard=true;pop("GUARD","good")}if(id==="focus"){combat.focus=true;S.player.mp=Math.min(S.player.maxMp,S.player.mp+Math.round(S.player.maxMp*.25));pop("FOCUS","good")}if(id==="ember"){let d=Math.max(2,Math.round(S.player.int*2.2+magic()*2.4+8));combat.e.hp=Math.max(0,combat.e.hp-d);pop("EMBER "+d,"crit")}if(id==="bloodstep"){S.player.hp=Math.max(1,S.player.hp-10);let d=Math.round(attackPower()*2.3);combat.e.hp=Math.max(0,combat.e.hp-d);pop("BLOOD "+d,"crit")}if(id==="veil"){combat.veil=true;pop("VEIL","good")}if(combat.e.hp<=0){victory();return}enemyTurn()}
function victory(){const e=combat.e;S.player.gold+=e.gold;addXP(e.xp);S.dead.push(e.id);if(e.id==="warden"){S.player.flags.firstBoss=true;S.quest.stage=2;S.quest.title="A Name in the Dark";S.quest.text="Return to Greywood. The mark on the waystone was yours — but not from this life."}if(e.loot&&!S.player.inv.includes(e.loot)&&Math.random()>.35){S.player.inv.push(e.loot);const i=item(e.loot);addLog("<b>LOOT FOUND</b> "+i.name+" ["+i.rarity.toUpperCase()+"]");toast("Loot: "+i.name)}advanceTime(20);combat=null;document.getElementById("combatHud").classList.add("hidden");renderUI();save()}
function fall(){S.player.hp=Math.max(1,Math.floor(S.player.maxHp*.2));S.player.area="greywood";S.player.x=1010;S.player.y=1005;combat=null;document.getElementById("combatHud").classList.add("hidden");advanceTime(45);addLog("<b>YOU FELL</b> The road remembers. You wake beneath Greywood rain.");renderUI()}

function dialogueBox(speaker,text,choices){dialogue=true;document.getElementById("dialogueSpeaker").textContent=speaker;document.getElementById("dialogueText").textContent=text;document.getElementById("dialogueChoices").innerHTML=choices.map((x,i)=>"<button class='choice' data-choice='"+i+"'>"+x[0]+"</button>").join("");window.__choices=choices;document.getElementById("dialogue").classList.remove("hidden")}
function closeDialogue(){dialogue=false;document.getElementById("dialogue").classList.add("hidden")}
function talk(id){
  const r=S.relations[id]||0;
  const names={bram:"Bram, Blacksmith",pella:"Pella, Innkeeper",elian:"Elian, Village Healer",tomas:"Tomas, Farmer",mae:"Sister Mae",kael:"Kael, Stranger"};
  if(id==="mara"){dialogueBox("Mara, Contract Keeper",S.player.flags.red?"You already took the coin. The Road Warden is waiting beyond the burned stones.":"You look like someone who has not yet learned how expensive a road can be.",[[S.player.flags.red?"Ask about the Warden":"Take the Red Coin",()=>{if(!S.player.flags.red){S.player.flags.red=true;S.relations.mara++;addLog("Mara gave you the Red Coin.");toast("Quest item acquired")}closeDialogue()}],["Ask about the waystone",()=>{S.quest.stage=Math.max(S.quest.stage,1);S.relations.mara++;dialogueBox("Mara","The stone should not know you. That's the problem.",[["Back",closeDialogue]])}],["Leave",closeDialogue]]);return}
  if(id==="bram"){dialogueBox(names[id],"Steel has a memory. Most people don't. You buying, or asking?",[["Open shop",()=>{closeDialogue();shopPanel()}],["Ask about the old sword",()=>{S.relations.bram++;dialogueBox("Bram","That sword? It came from the northern road. Same road the king's scouts used before they disappeared.",[["Back",closeDialogue]])}],["Leave",closeDialogue]]);return}
  if(id==="pella"){dialogueBox(names[id],r<2?"Room is 5 gold. Breakfast comes with it.":"You know where the good rooms are now.",[["Rent a room — 5g",()=>{if(S.player.gold<5){toast("Not enough gold.");return}S.player.gold-=5;S.player.hp=S.player.maxHp;S.player.mp=S.player.maxMp;advanceTime(120);S.relations.pella=Math.min(5,r+1);addLog("<b>REST</b> The Lantern & Loaf gives you a room and a full night's sleep.");closeDialogue();renderUI()}],["Listen for rumors",()=>{S.relations.pella++;dialogueBox("Pella","People are whispering about lights under the old bridge. They only appear after midnight.",[["Remember that",()=>{S.quest.text="Pella mentioned lights under the old bridge after midnight. Find the bridge at night.";S.quest.title="Lights Under Greywood";S.quest.stage=Math.max(S.quest.stage,1);addLog("<b>RUMOR</b> Lights under the old bridge, after midnight.");closeDialogue()}]])}],["Leave",closeDialogue]]);return}
  if(id==="elian"){dialogueBox(names[id],"Sit down. You look like the road has been chewing on you.",[["Heal — 8g",()=>{if(S.player.gold<8){toast("Not enough gold.");return}S.player.gold-=8;S.player.hp=S.player.maxHp;S.relations.elian++;addLog("<b>HEALED</b> Elian patches you up.");closeDialogue();renderUI()}],["Ask about the strange mark",()=>{S.relations.elian++;dialogueBox("Elian","I've seen that shape once. On a grave marker older than the chapel.",[["Back",closeDialogue]])}],["Leave",closeDialogue]]);return}
  if(id==="tomas"){dialogueBox(names[id],S.player.flags.farmerQuest?"You found the millstone, didn't you?":"My daughter found something under the east fence. I haven't had the courage to dig it up.",[["Help Tomas",()=>{S.player.flags.farmerQuest=1;S.relations.tomas++;S.quest.title="Under the East Fence";S.quest.text="Search Tomas's east fence after sunset. Something is buried there.";addLog("<b>QUEST</b> Tomas needs help with something buried by his field.");closeDialogue()}],["Leave",closeDialogue]]);return}
  if(id==="mae"){dialogueBox(names[id],"The Quiet Star does not answer questions. It answers persistence.",[["Ask about the road",()=>{S.relations.mae++;dialogueBox("Sister Mae","Do not trust a door just because it opens. Some doors are hungry.",[["Back",closeDialogue]])}],["Pray",()=>{S.relations.mae++;S.player.mp=Math.min(S.player.maxMp,S.player.mp+8);advanceTime(15);addLog("<b>PRAYER</b> Something in the chapel answers with a single bell.");toast("MP restored");closeDialogue()}],["Leave",closeDialogue]]);return}
  if(id==="kael"){dialogueBox(names[id],r<1?"You should not be here yet.":"You keep looking at the wrong things.",[["Who are you?",()=>{S.relations.kael++;dialogueBox("Kael","Nobody important. Yet.",[["Back",closeDialogue]])}],["Ask about the mountain",()=>{S.relations.kael++;dialogueBox("Kael","Highreach does not open because you are strong. It opens because you are expected.",[["Back",closeDialogue]])}],["Leave",closeDialogue]]);return}
}
function interact(){
  if(!nearEntity)return;const o=nearEntity;
  if(o.type==="enemy"){startCombat(o.id);return}
  if(o.type==="exit"){travel(o.id);return}
  if(o.type==="npc"){talk(o.id);return}
  if(o.type==="board"){boardPanel();return}
  if(o.id==="way"){
    if(S.quest.stage===0)dialogueBox("The Old Waystone","The stone is warm. Your name is carved beneath a date that has not happened yet.",[["Touch it",()=>{S.quest.stage=1;S.quest.title="The Road Warden";S.quest.text="Mara on Cinder Road mentioned someone who knows why the waystone remembers you.";addLog("<b>STORY</b> The waystone knows your name.");closeDialogue()}],["Leave",closeDialogue]]);
    else toast("The stone has nothing new to say. Not yet.")
  }
  if(o.id==="shrine")dialogueBox("Drowned Shrine","Something beneath the water knocks once against stone. Then twice.",[["Reach into the water",()=>{if(!S.player.inv.includes("coin"))S.player.inv.push("coin");addLog("<b>FOUND</b> Beggar's Coin. Your hand comes back dry.");toast("Found: Beggar's Coin");closeDialogue();renderUI()}],["Walk away",closeDialogue]]);
  if(o.type==="portal"){if(o.id==="below"){if(S.player.level>=4&&S.quest.stage>=1){S.player.flags.secret=true;travel("below");addLog("<b>SECRET DISCOVERY</b> You found a stair beneath the map.");evaluateClasses()}else toast("Something about this place is not ready for you")}if(o.id==="high"){travel("high")}}
}
function travel(id){if(id==="high"&&S.player.level<5){toast("The mountain gate does not open for you.");return}if(!S.known.includes(id))S.known.push(id);S.player.area=id;S.player.x=area(id)?.spawn?.[0]||900;S.player.y=area(id)?.spawn?.[1]||800;advanceTime(12);addLog("<b>ARRIVED</b> "+DATA.areas[id].name+" — "+DATA.areas[id].sub);renderUI();save()}

function boardPanel(){document.getElementById("panelShade").classList.remove("hidden");document.getElementById("panel").classList.remove("hidden");document.getElementById("panelKicker").textContent="VILLAGE";document.getElementById("panelTitle").textContent="Notice Board";document.getElementById("panelBody").innerHTML="<div class='section-title'>POSTED TODAY</div><div class='lore-card'><b>Roadside Wolves</b><p>Wolves have been seen near the eastern path. A small bounty is offered for proof.</p><button class='equip' data-board='wolf'>ACCEPT</button></div><div class='lore-card'><b>The Bridge Lights</b><p>Travelers report pale lights under the old bridge after midnight.</p><button class='equip' data-board='bridge'>PIN TO THREAD</button></div><div class='lore-card'><b>Missing Scout</b><p>A scout from Highreach never returned from the Ashen road.</p><button class='equip' data-board='scout'>TAKE NOTE</button></div>"}
function shopPanel(){document.getElementById("panelShade").classList.remove("hidden");document.getElementById("panel").classList.remove("hidden");document.getElementById("panelKicker").textContent="SHOP";document.getElementById("panelTitle").textContent="Bram's Smithy";document.getElementById("panelBody").innerHTML="<div class='section-title'>FOR SALE</div>"+DATA.items.filter(i=>["iron_sabre","hunter_bow","herald_shield","field_rations","ember_tonic"].includes(i.id)).map(i=>"<div class='item-card'><div><strong>"+i.name+"</strong><small>"+i.rarity.toUpperCase()+" • "+(i.power?"ATK "+i.power+" • ":"")+(i.armor?"ARM "+i.armor+" • ":"")+i.desc+"</small></div><button class='equip' data-buy='"+i.id+"'>BUY "+i.price+"G</button></div>").join("")}
function buy(id){const i=item(id);if(!i)return;if(S.player.gold<i.price){toast("Not enough gold.");return}S.player.gold-=i.price;if(i.type==="Consumable"){S.player.inv.push(i.id);toast("Bought "+i.name)}else{S.player.inv.push(i.id);toast("Bought "+i.name)}addLog("<b>PURCHASE</b> "+i.name+" from Bram.");shopPanel();renderCore();save()}

function renderCore(){const p=S.player,c=cls(p.classId);document.getElementById("playerName").textContent=p.name;document.getElementById("levelText").textContent=p.level;document.getElementById("className").textContent=c.name;document.getElementById("classRarity").textContent=c.rarity.toUpperCase();document.getElementById("classRarity").className="rarity "+c.rarity;document.getElementById("hpText").textContent=Math.round(p.hp)+" / "+p.maxHp;document.getElementById("mpText").textContent=Math.round(p.mp)+" / "+p.maxMp;document.getElementById("xpText").textContent=Math.round(p.xp)+" / "+xpNeed()+" XP";document.getElementById("hpBar").style.width=p.hp/p.maxHp*100+"%";document.getElementById("mpBar").style.width=p.mp/p.maxMp*100+"%";document.getElementById("xpBar").style.width=p.xp/xpNeed()*100+"%";document.getElementById("questTitle").textContent=S.quest.title;document.getElementById("questText").textContent=S.quest.text;document.getElementById("locationName").textContent=DATA.areas[p.area].name.toUpperCase();document.getElementById("zoneBadge").textContent=DATA.areas[p.area].name.toUpperCase()+"  •  DAY "+S.world.day+"  •  "+timeString();document.getElementById("nearby").innerHTML=getEntities().slice(0,8).map(o=>"<div class='near-row'><span>"+o.name+"</span><span class='near-type'>"+o.type.toUpperCase()+"</span></div>").join("");document.getElementById("worldLog").innerHTML=S.log.slice(0,10).map(x=>"<div class='log-entry'>"+x+"</div>").join("")}

function openPanel(which){document.getElementById("panelShade").classList.remove("hidden");document.getElementById("panel").classList.remove("hidden");if(which==="character")characterPanel();if(which==="inventory")inventoryPanel();if(which==="map")mapPanel();if(which==="skills")skillsPanel();if(which==="codex")codexPanel()}
function closePanel(){document.getElementById("panelShade").classList.add("hidden");document.getElementById("panel").classList.add("hidden")}
function characterPanel(){const p=S.player,c=cls(p.classId);document.getElementById("panelKicker").textContent="CHARACTER";document.getElementById("panelTitle").textContent=p.name;document.getElementById("panelBody").innerHTML="<div class='info-box'><div class='section-title'>CORE</div>"+[["Level",p.level],["Class",c.name+" • "+c.rarity],["HP",Math.round(p.hp)+" / "+p.maxHp],["MP",Math.round(p.mp)+" / "+p.maxMp],["Gold",p.gold],["Attack",Math.round(attackPower())],["Armor",Math.round(armor())],["Crit",crit()+"%"],["Magic",Math.round(magic())],["Day",S.world.day+" • "+timeString()]].map(r=>"<div class='info-row'><span>"+r[0]+"</span><span class='value'>"+r[1]+"</span></div>").join("")+"</div><div class='section-title'>ATTRIBUTES</div><div class='grid-2'>"+[["STR",p.str],["DEX",p.dex],["INT",p.int],["VIT",p.vit],["LUCK",p.luck]].map(r=>"<div class='info-box info-row'><span>"+r[0]+"</span><span class='value'>"+r[1]+"</span></div>").join("")+"</div><div class='section-title'>RELATIONSHIPS</div><div class='lore-card'>Mara "+S.relations.mara+" • Bram "+S.relations.bram+" • Pella "+S.relations.pella+" • Elian "+S.relations.elian+" • Tomas "+S.relations.tomas+" • Mae "+S.relations.mae+" • Kael "+S.relations.kael+"</div><div class='section-title'>CURRENT CLASS</div><div class='lore-card'><b>"+c.name+"</b><p>"+c.desc+"</p><div class='lock'>"+c.req+"</div></div>"}
function inventoryPanel(){document.getElementById("panelKicker").textContent="INVENTORY";document.getElementById("panelTitle").textContent="Pack & Equipment";document.getElementById("panelBody").innerHTML="<div class='section-title'>ITEMS • "+S.player.inv.length+"</div>"+S.player.inv.map(id=>{const i=item(id),eq=Object.values(S.player.eq).includes(id);return"<div class='item-card'><div><strong>"+i.name+"</strong><small>"+i.rarity.toUpperCase()+" • "+i.type+"<br>"+i.desc+"</small></div><button class='equip' data-equip='"+id+"'>"+(eq?"EQUIPPED":"EQUIP")+"</button></div>"}).join("")+"<div class='section-title'>EQUIPPED</div>"+Object.entries(S.player.eq).map(r=>"<div class='info-row'><span>"+r[0].toUpperCase()+"</span><span class='value'>"+(r[1]?item(r[1]).name:"Empty")+"</span></div>").join("")}
function skillsPanel(){document.getElementById("panelKicker").textContent="SKILLS";document.getElementById("panelTitle").textContent="Known Skills";document.getElementById("panelBody").innerHTML="<div class='section-title'>DISCOVERED</div>"+S.player.skills.map(id=>{const s=skill(id);return"<div class='skill-card'><b>"+s.name+"</b><span>"+s.kind+" • "+s.cost+" MP</span><p>"+s.desc+"</p></div>"}).join("")+"<div class='section-title'>LOCKED KNOWLEDGE</div>"+DATA.skills.filter(s=>!S.player.skills.includes(s.id)).map(s=>"<div class='skill-card'><b>???</b><span>LEVEL "+s.lvl+"</span><p>Something has not taught you this yet.</p><div class='lock'>DISCOVERY CONDITION UNKNOWN</div></div>").join("")}
function mapPanel(){document.getElementById("panelKicker").textContent="WORLD";document.getElementById("panelTitle").textContent="The Known World";document.getElementById("panelBody").innerHTML="<div class='map-frame'><div class='map-river'></div>"+Object.entries(DATA.areas).map(([id,a])=>{const coords={greywood:[49,54],cinder:[21,37],salt:[76,69],high:[82,23],ashen:[46,16],below:[66,45]}[id],known=S.known.includes(id);return"<button class='map-point "+(!known?"locked ":"")+(id==="below"?"secret":"")+"' style='left:"+coords[0]+"%;top:"+coords[1]+"%' data-map='"+id+"'><span>"+(known?a.name:"???")+"</span></button>"}).join("")+"</div><p class='muted'>The map records places before it explains them. Some blank regions are waiting for a reason.</p>"}
function codexPanel(){document.getElementById("panelKicker").textContent="CODEX";document.getElementById("panelTitle").textContent="Things You Know";document.getElementById("panelBody").innerHTML="<div class='section-title'>CLASSES</div>"+DATA.classes.map(c=>"<div class='lore-card'><b>"+(c.id===S.player.classId?c.name:"???")+"</b><p>"+(c.id===S.player.classId?c.desc:"An undiscovered class exists here.")+"</p></div>").join("")+"<div class='section-title'>WORLD NOTES</div><div class='lore-card'><b>The Waystone</b><p>Your handwriting is carved beneath a date you do not remember living through.</p></div><div class='lore-card'><b>Greywood Rumors</b><p>Lights under the old bridge. A missing scout. A stranger who says the mountain city is expecting someone.</p></div>"}

document.addEventListener("click",e=>{
  let b=e.target.closest("[data-panel]");if(b){openPanel(b.dataset.panel);return}
  if(e.target.closest("#closePanel")||e.target.closest("#panelShade")){closePanel();return}
  b=e.target.closest("[data-choice]");if(b){window.__choices[+b.dataset.choice][1]();return}
  b=e.target.closest("[data-combat]");if(b){const id=b.dataset.combat;if(id==="flee")fall();else combatSkill(id);renderCombat();return}
  b=e.target.closest("[data-equip]");if(b){const i=item(b.dataset.equip);if(i.type==="Consumable"){if(i.heal)S.player.hp=Math.min(S.player.maxHp,S.player.hp+i.heal);if(i.mpheal)S.player.mp=Math.min(S.player.maxMp,S.player.mp+i.mpheal);const idx=S.player.inv.indexOf(i.id);if(idx>=0)S.player.inv.splice(idx,1);toast("Used "+i.name);inventoryPanel();renderCore();save();return}S.player.eq[i.slot]=i.id;addLog("<b>EQUIPPED</b> "+i.name);inventoryPanel();renderCore();save();return}
  b=e.target.closest("[data-buy]");if(b){buy(b.dataset.buy);return}
  b=e.target.closest("[data-board]");if(b){const id=b.dataset.board;if(id==="wolf"){S.quest.title="Roadside Wolves";S.quest.text="Drive away wolves from the eastern road.";addLog("<b>QUEST ACCEPTED</b> Roadside Wolves.")}if(id==="bridge"){S.quest.title="Lights Under Greywood";S.quest.text="Find the old bridge after midnight and investigate the lights.";addLog("<b>THREAD PINNED</b> Lights under the old bridge.")}if(id==="scout"){addLog("<b>NOTE</b> A Highreach scout vanished on the Ashen road.");S.relations.kael++;}return}
  b=e.target.closest("[data-map]");if(b){const id=b.dataset.map;if(S.known.includes(id)||DATA.areas[id].open)travel(id);else toast("You have not discovered a way there yet.");return}
});
document.getElementById("closePanel").onclick=closePanel;
document.getElementById("panelShade").onclick=closePanel;
document.getElementById("attackBtn").onclick=()=>combat?strike():toast("Nothing is attacking you. Yet.");
document.getElementById("dodgeBtn").onclick=()=>{if(combat){combat.veil=true;S.player.mp=Math.min(S.player.maxMp,S.player.mp+3);enemyTurn()}else toast("You slip into the brush.")};
document.getElementById("healBtn").onclick=()=>{if(S.player.gold<5){toast("You need 5 gold.");return}S.player.gold-=5;S.player.hp=Math.min(S.player.maxHp,S.player.hp+35);pop("+35 HP","good");renderCore();save()};
document.getElementById("trackQuest").onclick=()=>toast("Thread tracked: "+S.quest.title);
document.addEventListener("keydown",e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.code==="Space"){e.preventDefault();if(combat)strike()}
  if(e.key.toLowerCase()==="e")interact();
  if(e.key==="Escape"){closePanel();if(dialogue)closeDialogue()}
  if(e.key.toLowerCase()==="c")openPanel("character");
  if(e.key.toLowerCase()==="i")openPanel("inventory");
  if(e.key.toLowerCase()==="m")openPanel("map");
  if(e.key.toLowerCase()==="k")openPanel("skills");
  if(e.key.toLowerCase()==="j")openPanel("codex");
  if(e.key.toLowerCase()==="q"&&!combat)document.getElementById("healBtn").click();
  if(e.key==="Shift"&&combat){combat.veil=true;S.player.mp=Math.min(S.player.maxMp,S.player.mp+3);enemyTurn()}
});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function renderUI(){renderCore()}
let uiClock=0;
function tick(t){const dt=Math.min(.04,(t-last)/1000);last=t;movement(dt);uiClock+=dt;if(uiClock>.35){uiClock=0;renderCore()}draw();requestAnimationFrame(tick)}
window.addEventListener("load",()=>{setTimeout(()=>document.getElementById("boot").classList.add("hide"),850);renderCore();draw();requestAnimationFrame(tick)});