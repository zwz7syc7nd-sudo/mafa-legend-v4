(function(root){
 'use strict';
 const edge=107;
 // Layout and blend widths are project design, not an exact official map.
 // All 11 received geographic groups have a place; unresolved monster tables
 // are deliberately left to the catalogue adapter rather than invented here.
 const rows=[
  ['gludio_wilderness','古魯丁外圍／死亡廢墟',-69,61,'grass'],
  ['kent_vineyard','肯特／葡萄園',-31,28,'grass'],
  ['silver_knight_forest','銀騎士村外圍',2,72,'grass'],
  ['windawood_desert','風木／沙漠',-61,-62,'sand'],
  ['orc_forest','妖魔部落',-76,-5,'grass'],
  ['elven_forest','妖精森林',0,9,'grass'],
  ['giran_bandits','奇岩外圍',45,35,'grass'],
  ['heine_swamp','海音沼澤周邊',79,79,'grass'],
  ['heine_mirror','海音東方／鏡子森林',83,-7,'grass'],
  ['dragon_valley','龍之谷',34,-35,'rock'],
  ['fire_valley','火龍窟／威頓北方',35,-87,'rock']
 ];
 const colors={grass:'#719653',sand:'#cdb078',rock:'#858779'};
 const regions=Object.freeze(rows.map(([id,name,x,z,ground],i)=>Object.freeze({id,name,x,z,ground,color:colors[ground],level:i,
  sub:'連續地面 · '+({grass:'草原',sand:'沙地',rock:'岩土地面'}[ground]),layoutProvenance:'project-design'})));
 function regionAt(x,z){
  if(!Number.isFinite(x)||!Number.isFinite(z))throw TypeError('Invalid position');
  let best=regions[0],distance=Infinity;
  for(const r of regions){const d=(x-r.x)**2+(z-r.z)**2;if(d<distance){distance=d;best=r;}}
  return best;
 }
 function groundWeights(x,z){
  const dist={grass:Infinity,sand:Infinity,rock:Infinity};
  for(const r of regions)dist[r.ground]=Math.min(dist[r.ground],Math.hypot(x-r.x,z-r.z));
  const min=Math.min(...Object.values(dist)),weights={};let sum=0;
  for(const kind of ['grass','sand','rock']){weights[kind]=Math.exp(-(dist[kind]-min)/3.0);sum+=weights[kind];}
  for(const kind of Object.keys(weights))weights[kind]/=sum;
  return weights;
 }
 function sample(regionId,{rng=Math.random,blocked=()=>false,hero=null,minDistance=6,radius=.8}={}){
  if(!regions.some(r=>r.id===regionId))throw TypeError('Unknown region');
  for(let n=0;n<1024;n++){
   const a=rng(),b=rng();if(!(a>=0&&a<1&&b>=0&&b<1))throw TypeError('Invalid RNG output');
   const x=-edge+radius+a*(2*edge-2*radius),z=-edge+radius+b*(2*edge-2*radius);
   if(regionAt(x,z).id!==regionId||blocked(x,z,radius)||hero&&Math.hypot(x-hero.x,z-hero.z)<minDistance)continue;
   return {x,z,regionId};
  }
  return null; // Never move a failed spawn to another region or the player.
 }
 function createSpawner({catalogue,populations,spawn,isAlive,rng=Math.random,blocked=()=>false,respawnSeconds=12}){
  if(!Array.isArray(catalogue)||!Array.isArray(populations)||typeof spawn!=='function'||typeof isAlive!=='function')throw TypeError('Explicit catalogue and adapters required');
  if(!Number.isFinite(respawnSeconds)||respawnSeconds<0)throw TypeError('Invalid project respawn delay');
  const entries=new Map();for(const e of catalogue){if(!e?.id||entries.has(e.id))throw TypeError('Missing or duplicate catalogue id');entries.set(e.id,e);}
  const slots=[],warnings=[];let serial=0;
  for(const population of populations){
   if(!regions.some(r=>r.id===population.regionId)||!Number.isInteger(population.count)||population.count<0||population.count>100)throw TypeError('Invalid population');
   const pool=population.pool.map(id=>{if(!entries.has(id))throw TypeError('Missing catalogue member: '+id);return entries.get(id);}).filter(e=>{
    if(e.role?.value==='interaction_npc'){warnings.push('Excluded interaction NPC '+e.id);return false;}return true;
   });
   if(!pool.length){warnings.push('No combat candidates for '+population.regionId);continue;}
   for(let i=0;i<population.count;i++)slots.push({regionId:population.regionId,pool,handle:null,due:0,waiting:true,projectBehavior:population.projectBehavior??null});
  }
  return {warnings,step(now,hero=null){
   if(!Number.isFinite(now)||now<0)throw TypeError('Invalid simulation time');const emitted=[];
   for(const slot of slots){
    if(!slot.waiting){if(isAlive(slot.handle))continue;slot.waiting=true;slot.due=now+respawnSeconds;slot.handle=null;}
    if(now+1e-9<slot.due)continue;
    const position=sample(slot.regionId,{rng,blocked,hero});if(!position)continue;
    const choice=rng();if(!(choice>=0&&choice<1))throw TypeError('Invalid RNG output');
    const entry=slot.pool[Math.floor(choice*slot.pool.length)];
    const request={...position,serial:++serial,catalogueId:entry.id,name:entry.name_zh,
     sourceRole:entry.role?.value??'unknown',projectBehavior:slot.projectBehavior,
     representativeDrops:entry.representative_drops??[],respawnProvenance:'project-design'};
    const handle=spawn(request);if(handle==null)continue;slot.handle=handle;slot.waiting=false;emitted.push(request);
   }
   return emitted;
  },inspect(){return slots.map(({regionId,handle,due,waiting})=>({regionId,handle,due,waiting}));}};
 }
 let catalogue=[];
 function loadCatalogue(groups){
  if(!Array.isArray(groups)||groups.length!==regions.length)throw TypeError('Expected all eleven research groups');
  const next=[];const seen=new Set();
  for(const group of groups){
   if(!regions.some(r=>r.id===group.id)||seen.has(group.id)||!Array.isArray(group.monsters))throw TypeError('Invalid research region');seen.add(group.id);
   group.monsters.forEach((m,i)=>{if(typeof m.name!=='string'||!['unknown','melee','ranged','boss','interaction_npc'].includes(m.role)||!Array.isArray(m.drops))throw TypeError('Invalid candidate');next.push({id:group.id+'_'+String(i+1).padStart(2,'0'),regionId:group.id,name_zh:m.name,role:{value:m.role},representative_drops:m.drops.map(name_zh=>({name_zh,drop_rate:null})),provenance:'parent-cross-version-research',assetStatus:'unverified'});});
  }
  catalogue=next;return catalogue;
 }
 function populations(count=6){return regions.map(r=>({regionId:r.id,count,pool:catalogue.filter(e=>e.regionId===r.id).map(e=>e.id),projectBehavior:null}));}
 const api={edge,regions,regionAt,groundWeights,sample,createSpawner,loadCatalogue,populations,get catalogue(){return catalogue;}};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.R11Regions=api;
})(globalThis);
