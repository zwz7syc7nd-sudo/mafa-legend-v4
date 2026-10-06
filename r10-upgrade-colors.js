import * as T from 'three';

// Enhancement color is independent of rarity and gameplay attributes. No outline
// tubes: sources have a changing flame core, soft skirt and separated 3D depths.
export const UPGRADE_LAYERS=Object.freeze([
 {rank:0,name:'品質基光',color:'#ff701e',detail:'保留裝備品質金紅基光'},
 {rank:1,name:'藍色焰光',color:'#198cff',detail:'劍身、肩外側與護腿的柔邊藍焰'},
 {rank:2,name:'翠綠流焰',color:'#36ef76',detail:'保留藍焰，劍根、胸甲與內翼增加綠焰'},
 {rank:3,name:'紫色浮光',color:'#ae55ff',detail:'劍尖與肩甲的局部紫色浮光'},
 {rank:4,name:'青色羽焰',color:'#24e5e4',detail:'翼尖與劍上段的青色短焰'},
 {rank:5,name:'緋紅脈焰',color:'#ff3655',detail:'護手與肩根的緋紅脈焰'},
 {rank:6,name:'紫紅逸焰',color:'#ef43ca',detail:'外翼與劍側較長的紫紅逸焰'},
 {rank:7,name:'金色閃光',color:'#ffcc43',detail:'胸甲與劍根的間歇金光'},
 {rank:8,name:'翠綠浮焰',color:'#38e97c',detail:'肩後與劍側離面浮焰'},
 {rank:9,name:'藍色流火',color:'#258aff',detail:'外翼後方與劍尖的藍色流火'},
 {rank:10,name:'琥珀餘燼',color:'#ffa42a',detail:'腰甲與護手的局部琥珀火光'},
 {rank:11,name:'紫白星火',color:'#cf91ff',detail:'至多八枚疏散紫白星火'},
 {rank:12,name:'三色光焰',color:'#57dcff',detail:'分散於翼外和劍端的藍綠紫短焰'}
]);
const clamp=x=>Math.max(0,Math.min(12,Math.floor(Number(x)||0)));
const vertex=`
 attribute vec3 flowAcross; attribute vec3 flowAlong;
 attribute float flowSeed; attribute float flowGain;
 uniform float time;
 varying vec2 vUv; varying float vSeed; varying float vGain;
 void main(){
  vUv=uv;vSeed=flowSeed;vGain=flowGain;
  float bend=(sin(time*2.6+flowSeed-uv.y*9.0)*.29+sin(time*1.3+flowSeed*.7-uv.y*4.0)*.22)*pow(uv.y,1.25);
  float stretch=sin(time*2.2+flowSeed-uv.y*5.0)*.095*uv.y;
  vec3 p=position+flowAcross*bend+flowAlong*stretch;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }`;
const fragment=`
 precision highp float;
 uniform float time; uniform vec3 tint; uniform float strength;
 varying vec2 vUv; varying float vSeed; varying float vGain;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){
  float y=vUv.y,x=vUv.x-.5;
  float n=noise(vec2(x*8.0+vSeed,y*7.0-time*1.9));
  float fine=noise(vec2(x*18.0-vSeed,y*13.0-time*3.5));
  float sway=sin(y*8.0-time*2.5+vSeed)*(.025+y*.065)+(n-.5)*.11*y;
  float width=(.25+.08*sin(y*8.0+vSeed))*(.7+.3*sin(y*3.14))*pow(max(0.0,1.0-y),.38);
  width*=.65+.48*n;
  float d=abs(x-sway)/max(.015,width);
  float body=1.0-smoothstep(.40,1.12,d+(fine-.5)*.28);
  float travel=.60+.40*sin(y*13.0-time*4.0+vSeed);
  float life=(.77+.15*sin(time*2.8+vSeed)+.08*sin(time*6.7+vSeed*2.0))*travel;
  float ends=smoothstep(0.0,.07,y)*(1.0-smoothstep(.87,1.0,y));
  body*=ends*life;
  float core=pow(max(0.0,1.0-d),5.0)*ends*(.32+.45*n);
  float halo=exp(-pow((x-sway)/.34,2.0)*2.4-pow((y-.38)/.53,2.0)*2.2);
  halo*=smoothstep(0.0,.07,y)*(1.0-smoothstep(.80,1.0,y));
  float alpha=(body*.57+halo*.14)*strength*vGain;
  if(alpha<.006)discard;
  vec3 light=mix(tint,vec3(.90,.97,1.0),core*.52);
  gl_FragColor=vec4(light,alpha);
  #include <colorspace_fragment>
 }`;

function flameGeometry(specs){
 const positions=[],uv=[],across=[],along=[],seeds=[],gains=[],indices=[];
 const ribbon=(points,width,seed,gain)=>{
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'catmullrom',.35),segments=24;
  for(let face=0;face<2;face++){
   const start=positions.length/3;
   for(let row=0;row<=segments;row++){
    const v=row/segments,center=curve.getPoint(v),tangent=curve.getTangent(v),side=new T.Vector3(tangent.y,-tangent.x,0).normalize();
    if(face)side.applyAxisAngle(tangent,.93);
    side.multiplyScalar(width*(.82+.18*Math.sin(v*8+seed)));
    for(let col=0;col<=1;col++){
     const p=center.clone().addScaledVector(side,col-.5);
     positions.push(p.x,p.y,p.z);uv.push(col,v);across.push(side.x,side.y,side.z);along.push(tangent.x*width,tangent.y*width,tangent.z*width);seeds.push(seed);gains.push(gain*(face?.35:1));
    }
   }
   for(let row=0;row<segments;row++){const a=start+row*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
 };
 for(const s of specs){
  const [x,y,z,w,h,angle=0,seed=0,gain=1,branch=1]=s,sign=Math.sin(seed*2.3)>0?1:-1;
  const transform=(a,b,d=0)=>[x+Math.cos(angle)*a-Math.sin(angle)*b,y+Math.sin(angle)*a+Math.cos(angle)*b,z+d];
  const bend=h*(.22+.13*Math.abs(Math.sin(seed))),reach=h*(.82+.36*Math.abs(Math.cos(seed*1.7)));
  const p=[[0,0,0],[sign*bend*.28,reach*.22,.015],[sign*bend,reach*.47,.027],[-sign*bend*.14,reach*.75,.007],[sign*bend*.33,reach,.01]];
  ribbon(p.map(q=>transform(...q)),w,seed,gain);
  if(branch&&h>.16){
   const b=p[2];ribbon([transform(...p[1]),transform(...b),transform(b[0]+sign*h*.21,reach*.66,-.018),transform(b[0]+sign*h*.13,reach*.88,-.027)],w*.57,seed+.4,gain*.70);
   if(h>.25)ribbon([transform(...p[1]),transform(-sign*h*.18,reach*.38,.038),transform(-sign*h*.27,reach*.61,.024),transform(-sign*h*.13,reach*.66,.008)],w*.43,seed+.9,gain*.58);
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('flowAcross',new T.Float32BufferAttribute(across,3));g.setAttribute('flowAlong',new T.Float32BufferAttribute(along,3));g.setAttribute('flowSeed',new T.Float32BufferAttribute(seeds,1));g.setAttribute('flowGain',new T.Float32BufferAttribute(gains,1));g.setIndex(indices);g.computeBoundingSphere();g.boundingSphere.radius*=1.25;return g;
}
 let starTexture;
function starMap(){
 if(starTexture)return starTexture;
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.065,'rgba(255,255,255,.96)');r.addColorStop(.18,'rgba(210,225,255,.34)');r.addColorStop(.45,'rgba(170,194,255,.08)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
 starTexture=new T.CanvasTexture(c);starTexture.colorSpace=T.SRGBColorSpace;return starTexture;
}
export function installUpgradeColors(actor){
 const lowDetail=new URLSearchParams(location.search).get('bossQuality')==='low';
 const states={weapon:{rank:0,present:false,layers:[],moving:[],beacons:[]},armor:{rank:0,present:false,layers:[],moving:[],beacons:[]}},materials=[],cloth=[];
 const layer=(slot,rank,parent)=>{const g=new T.Group();g.name='enhance-'+slot+'-'+rank;g.userData.enhanceRank=rank;g.userData.slot=slot;parent.add(g);states[slot].layers.push(g);return g;};
 const socket=source=>{const g=new T.Group();source.parent.add(g);g.position.copy(source.position);g.quaternion.copy(source.quaternion);return g;};
 const makeFlames=(slot,rank,parent,specs,color)=>{
  const group=layer(slot,rank,parent),mat=new T.ShaderMaterial({uniforms:{time:{value:0},tint:{value:new T.Color(color||UPGRADE_LAYERS[rank].color)},strength:{value:slot==='armor'?1.22:1}},vertexShader:vertex,fragmentShader:fragment,transparent:true,blending:T.NormalBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const mesh=new T.Mesh(flameGeometry(specs),mat);mesh.userData.equipmentBloom=true;mesh.userData.upgradeColor=true;mesh.userData.lightForm='soft-flame';group.add(mesh);materials.push(mat);return group;
 };
 const radiance=(slot,rank,parent,p,size,phase)=>{
  const g=layer(slot,rank,parent),mat=new T.SpriteMaterial({map:starMap(),color:UPGRADE_LAYERS[rank].color,transparent:true,opacity:.84,blending:T.NormalBlending,depthWrite:false,toneMapped:false}),sp=new T.Sprite(mat);
  sp.position.fromArray(p);sp.scale.setScalar(size);sp.userData.equipmentBloom=true;sp.userData.lightForm='local-radiance';g.add(sp);states[slot].moving.push({mesh:sp,type:'radiance',size,phase});
 };
 const chest=socket(actor.equipmentGlow.armor.groups.find(g=>g.name==='equipment-chest-emission'));
 const shoulders=actor.equipmentGlow.armor.groups.filter(g=>g.name==='equipment-shoulder-emission').map(socket),blade=actor.sword;
 radiance('weapon',1,blade,[-.043,.40,.091],.23,0);
 radiance('weapon',2,blade,[.058,.22,.098],.22,2);
 // Unequal tongues on different sides leave the steel and previous colors visible.
 makeFlames('weapon',1,blade,[[-.084,.22,.050,.19,.40,.45,1],[.035,.46,.035,.13,.31,-.35,3],[-.012,.74,.020,.10,.20,.18,5]]);
 makeFlames('weapon',2,blade,[[.070,.15,.064,.15,.23,-.45,7],[-.014,.36,-.054,.105,.28,.32,9]]);
 makeFlames('weapon',3,blade,[[-.028,.76,.023,.13,.20,.35,4,.73]]);
 makeFlames('weapon',4,blade,[[.04,.57,-.032,.12,.24,-.48,8,.67]]);
 makeFlames('weapon',5,blade,[[.063,.095,.037,.12,.16,-.85,10,.74],[-.070,.09,.032,.11,.14,.75,12,.70]]);
 makeFlames('weapon',6,blade,[[-.097,.39,-.028,.16,.27,.46,13,.70]]);
 makeFlames('weapon',7,blade,[[.005,.17,.070,.095,.15,-.1,16,.75]]);
 makeFlames('weapon',8,blade,[[.112,.29,.005,.10,.16,-.4,18,.55]]);
 makeFlames('weapon',9,blade,[[-.067,.67,-.028,.14,.25,.5,19,.60]]);
 makeFlames('weapon',10,blade,[[-.041,.12,-.039,.11,.18,.65,22,.68]]);
 makeFlames('weapon',12,blade,[[.018,.83,.027,.10,.19,-.3,24,.70]],'#198cff');
 makeFlames('weapon',12,blade,[[.082,.50,.044,.10,.19,-.6,27,.50]],'#36ef76');
 makeFlames('weapon',12,blade,[[-.12,.24,.004,.105,.19,.5,29,.55]],'#ae55ff');
 for(const [i,s] of shoulders.entries()){
  const side=i===0?-1:1;
  radiance('armor',1,s,[side*.074,.032,.146],.24,i*2);
  makeFlames('armor',1,s,[[side*.070,.015,.091,.16,.30,-side*.95,2+i*4,.94]]);
  makeFlames('armor',3,s,[[side*.11,.09,-.034,.12,.23,-side*1.04,5+i*2,.70]]);
  makeFlames('armor',5,s,[[-side*.047,-.025,.08,.10,.12,side*.30,8+i*3,.55]]);
  makeFlames('armor',8,s,[[side*.09,.10,-.10,.12,.17,-side*.25,15+i*3,.55]]);
 }
 makeFlames('armor',1,chest,[[-.039,-.10,.070,.12,.22,.77,3,.87],[.039,-.10,.070,.13,.20,-.87,5,.82]]);
 makeFlames('armor',2,chest,[[0,-.14,.079,.18,.26,.12,7,1.05],[-.024,-.015,.073,.08,.12,.9,11,.69]]);
 radiance('armor',2,chest,[0,.008,.064],.21,3);
 makeFlames('armor',7,chest,[[0,-.08,.064,.07,.14,0,17,.64]]);
 makeFlames('armor',6,chest,[[-.076,-.11,.032,.1,.18,.7,16,.70],[.072,-.11,.032,.09,.16,-.82,18,.65]]);
 makeFlames('armor',10,chest,[[-.06,-.115,.005,.085,.15,.6,20,.55],[.06,-.115,.005,.085,.13,-.6,23,.55]]);
 for(const boneName of ['RightLeg','LeftLeg']){
  const mounts=actor.bones[boneName].children.filter(g=>g.isGroup).slice(0,2);
  for(const [i,source] of mounts.entries()){
   const leg=socket(source),side=boneName==='RightLeg'?-1:1;
   if(i===0)radiance('armor',1,leg,[side*.025,.013,.051],.12,side*2);
   makeFlames('armor',1,leg,[[side*.028,i===0?-.045:-.074,.040,.09,i===0?.15:.22,-side*.40,3+i*5,.90]]);
   if(i===0)makeFlames('armor',2,leg,[[-side*.030,-.057,.054,.075,.18,side*.58,10,.79]]);
   else makeFlames('armor',6,leg,[[-side*.035,-.065,.037,.085,.20,side*.62,19,.69]]);
  }
 }
 for(const [side,w] of actor.wings.entries()){
  const feathers=w.children.filter(g=>g.isGroup&&!g.name.startsWith('enhance'));
  for(let i=0;i<feathers.length;i++){
   const f=feathers[i],len=.28+i*.032;
   if(i===3)makeFlames('armor',1,f,[[-.035,len*.46,.009,.18,.39,.50,3+side*2,.98]]);
   if(i===1)makeFlames('armor',2,f,[[.016,len*.43,.004,.13,.26,-.58,6+side*3,.80]]);
   if(i===0)makeFlames('armor',4,f,[[0,len*.74,.012,.11,.17,.1,9+side*2,.58]]);
   if(i===2)makeFlames('armor',6,f,[[-.033,len*.35,-.009,.14,.30,.75,13+side*4,.65]]);
   if(i===3)makeFlames('armor',9,f,[[-.067,len*.32,-.068,.11,.33,-.45,18+side*3,.53]]);
   if(i===0||i===2)makeFlames('armor',12,f,[[.012,len*.70,-.008,.085,i===0?.16:.25,i===0?-.7:.4,25+i+side*2,.52]],['#198cff','#36ef76','#ae55ff'][i]);
  }
 }
 // A few patches follow deformed cape vertices, never its full perimeter.
 for(const [rank,index,color,phase] of [[1,9*17,'#198cff',3],[1,14*17+16,'#198cff',6],[2,19*17+1,'#36ef76',9],[6,22*17+12,'#ae55ff',12]]){
  const mount=new T.Group();actor.capeGroup.add(mount);makeFlames('armor',rank,mount,[[0,0,-.035,.13,.26,index%17<8?.70:-.65,phase,.79]],color);cloth.push({mount,index});
 }
 // Fixed pool of sparse hot specks. Every layer follows the same grip/bone.
 for(const slot of ['weapon','armor']){
  const host=layer(slot,11,slot==='weapon'?blade:chest);
  for(let i=0;i<4;i++){
   const mat=new T.SpriteMaterial({map:starMap(),color:0xd2c2ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),sprite=new T.Sprite(mat);sprite.userData.equipmentBloom=true;host.add(sprite);states[slot].moving.push({mesh:sprite,type:'mote',index:i,slot});
  }
 }
 const update=actor.update.bind(actor);
 actor.update=function(a,t,preview){
  update(a,t,preview);const v=a.visual||{},dead=a.state==='dead',visualTime=lowDetail?Math.floor(t*12)/12:t;
  for(const mat of materials)mat.uniforms.time.value=visualTime;
  for(const {mount,index} of cloth){const p=actor.cape.geometry.attributes.position;mount.position.set(p.getX(index),p.getY(index),p.getZ(index)-.016);}
  for(const slot of ['weapon','armor']){
   const s=states[slot];s.rank=clamp(v[slot+'Enhance']);s.present=v[slot==='weapon'?'hasWeapon':'hasArmor']!==false&&!dead;
   for(const g of s.layers)g.visible=s.present&&s.rank>=g.userData.enhanceRank;
   for(const fx of s.moving){const sp=fx.mesh;if(fx.type==='radiance'){const pulse=.82+.18*Math.sin(visualTime*2.8+fx.phase);sp.scale.setScalar(fx.size*(.90+pulse*.10));sp.material.opacity=.9*pulse;continue;}const i=fx.index,u=(visualTime*.32+i*.241)%1,life=Math.sin(u*Math.PI);sp.visible=!lowDetail||i<2;
    if(slot==='weapon')sp.position.set(Math.sin(u*6+i)*.12,.22+u*.64,.03+Math.cos(u*7+i)*.06);
    else sp.position.set(Math.sin(i*2.399+u*1.4)*(.16+u*.10),.04+u*.23,Math.cos(i*2.399+u*1.4)*.13);
    sp.scale.setScalar(.036+life*.017);sp.material.opacity=life*life*.85;
   }
  }
  this.root.userData.upgradeColors={weapon:states.weapon.rank,armor:states.armor.rank,weaponLayers:states.weapon.present?UPGRADE_LAYERS.filter(x=>x.rank>0&&x.rank<=states.weapon.rank).map(x=>x.rank):[],armorLayers:states.armor.present?UPGRADE_LAYERS.filter(x=>x.rank>0&&x.rank<=states.armor.rank).map(x=>x.rank):[],dimension:'enhancement-only',maxMotes:lowDetail?4:8,detail:lowDetail?'low':'full',form:'soft-flames-local-halo'};
 };
 actor.upgradeColors=states;return states;
}
