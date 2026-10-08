(function(root){
// Four verified original GIF identities only. Placements are project design.
const selections=[['gludio_wilderness',['skeleton',6]],['kent_vineyard'],['silver_knight_forest',['orc',4],['wolf',4],['spider',4]],['windawood_desert'],['orc_forest',['orc',6]],['elven_forest'],['giran_bandits'],['heine_swamp'],['heine_mirror'],['dragon_valley',['skeleton',6]],['fire_valley']];
const species={skeleton:{name:'骷髏',file:30,hp:260,height:4.2},orc:{name:'獸人',file:56,hp:240,height:3.8},wolf:{name:'狼',file:96,hp:180,height:3},spider:{name:'巨蛛',file:1082,hp:220,height:2.5}};let groups=[];
function load(data){groups=data;}
function create({spawn,blocked,rng,hero}){const catalogue=[],populations=[],configuration=[];
 for(const [regionId,...entries] of selections){const group=groups.find(x=>x.id===regionId);configuration.push({regionId,names:entries.map(([kind])=>species[kind].name),visuals:entries.map(([kind])=>kind),count:entries.reduce((n,e)=>n+e[1],0),placement:'project-design',assets:'original GIFs 30/56/96/1082',unimplemented:group?.recommended?.names||[],boss:regionId==='fire_valley'?'existing black-red dragon':null});
  for(const [kind,count] of entries){const s=species[kind],id=regionId+'-'+kind;catalogue.push({id,name_zh:s.name,role:{value:'melee'},kind});populations.push({regionId,count,pool:[id]});}
 }
 const byId=new Map(catalogue.map(x=>[x.id,x]));const spawner=R11Regions.createSpawner({catalogue,populations,rng,blocked:(x,z,r)=>blocked(x,z,r)||(Math.abs(x)<24&&z>46&&z<91),respawnSeconds:20,isAlive:m=>m.state!=='dead',spawn:request=>{const entry=byId.get(request.catalogueId),kind=entry.kind,s=species[kind],level=R11Regions.regions.find(r=>r.id===request.regionId).level,hp=s.hp+level*8;return spawn(kind==='orc'?'skeleton':kind,request.x,request.z,{name:s.name,regionId:request.regionId,catalogueId:entry.id,visualKind:kind,originalGif:s.file,hp,maxHp:hp,dmg:kind==='wolf'?9:12,speed:kind==='wolf'?2.8:2.3,reach:kind==='spider'?1.8:2.05,ranged:false,labelHeight:s.height+.3,xp:28+level*5});}});spawner.step(0,hero);return {spawner,configuration};
}root.R12World={load,create,selections,species};})(globalThis);
