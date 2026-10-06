import * as THREE from 'three';
import {mergeGeometries} from './vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const COLORS=[0x000000,0x66d9ff,0xc178ff,0xff5b0c];
let haloTexture,flameTexture;
function flame(){if(flameTexture)return flameTexture;const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d'),gradient=g.createLinearGradient(0,126,0,0);gradient.addColorStop(0,'rgba(255,240,151,0)');gradient.addColorStop(.22,'rgba(255,232,105,.9)');gradient.addColorStop(.48,'rgba(255,132,20,.85)');gradient.addColorStop(.82,'rgba(255,59,7,.55)');gradient.addColorStop(1,'rgba(255,32,3,0)');g.fillStyle=gradient;g.beginPath();g.moveTo(31,125);g.bezierCurveTo(2,101,6,87,18,61);g.bezierCurveTo(27,78,38,37,34,5);g.bezierCurveTo(62,50,44,60,47,78);g.bezierCurveTo(61,72,60,116,31,125);g.fill();flameTexture=new THREE.CanvasTexture(c);flameTexture.colorSpace=THREE.SRGBColorSpace;return flameTexture;}
function halo(){if(haloTexture)return haloTexture;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.08,'rgba(255,244,204,.95)');r.addColorStop(.21,'rgba(255,211,143,.45)');r.addColorStop(.48,'rgba(255,155,60,.12)');r.addColorStop(1,'rgba(255,80,10,0)');g.fillStyle=r;g.fillRect(0,0,128,128);haloTexture=new THREE.CanvasTexture(c);haloTexture.colorSpace=THREE.SRGBColorSpace;return haloTexture;}
function tube(points,r=.0026){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(8,points.length*5),r,5,false);}
function luminousPaths(parent,paths,state,r=.0026){
 const geometry=mergeGeometries(paths.map(p=>tube(p,r))),mat=new THREE.MeshStandardMaterial({color:0xffedc7,emissive:0xff780d,emissiveIntensity:4,metalness:0,roughness:.5,toneMapped:false});const core=new THREE.Mesh(geometry,mat);core.userData.equipmentBloom=true;parent.add(core);state.cores.push(mat);
 const broad=geometry.clone(),pos=broad.attributes.position,norm=broad.attributes.normal;for(let i=0;i<pos.count;i++)pos.setXYZ(i,pos.getX(i)+norm.getX(i)*.012,pos.getY(i)+norm.getY(i)*.012,pos.getZ(i)+norm.getZ(i)*.012);
 const glow=new THREE.MeshBasicMaterial({color:0xff710e,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const shell=new THREE.Mesh(broad,glow);shell.userData.equipmentBloom=true;parent.add(shell);state.halos.push(glow);
}
function star(parent,p,size,state){const mat=new THREE.SpriteMaterial({map:halo(),color:0xffa747,transparent:true,opacity:.63,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const sprite=new THREE.Sprite(mat);sprite.userData.equipmentBloom=true;sprite.position.fromArray(p);sprite.scale.setScalar(size);parent.add(sprite);state.stars.push({sprite,mat,size,phase:state.stars.length*1.37});}
function makeState(){return {cores:[],halos:[],stars:[],groups:[],sparks:[],surges:[],strength:0,tier:0,rank:0};}
function apply(state,tier,rank,present){state.tier=tier;state.rank=rank;state.strength=present?[0,.35,.72,1.4][tier]*(rank>0?.64:1):0;
 for(const g of state.groups)g.visible=state.strength>0;
 for(const mat of state.cores){mat.color.setHex(tier===3?0xffebc1:tier===2?0xf7d9ff:0xd7f8ff);mat.emissive.setHex(COLORS[tier]);mat.emissiveIntensity=state.strength*3.2;}
 for(const mat of state.halos){mat.color.setHex(COLORS[tier]);mat.opacity=.27*state.strength;}
 for(const {mat} of state.stars){mat.color.setHex(tier===3?0xff9624:COLORS[tier]);mat.opacity=.55*state.strength;}
}
function animate(state,t,dead){
 for(const {sprite,mat,phase} of state.surges){const amount=0,u=(t*.8+phase)%1;sprite.visible=state.strength>0&&state.tier>=2&&amount>0&&!dead;sprite.position.set(Math.sin(u*12)*.012,.14+u*.68,phase>.5?-.043:.067);mat.opacity=Math.sin(Math.PI*u)*amount*.65;mat.color.setHex(state.tier===3?0xffeec8:COLORS[state.tier]);sprite.scale.set(.030+amount*.02,.07+amount*.08,1);}
for(const {sprite,mat,size,phase} of state.stars){const pulse=.91+.09*Math.sin(t*3+phase);sprite.scale.setScalar(size*pulse);mat.opacity=Math.min(.9,.55*state.strength)*pulse*(dead?.25:1);}
 for(const {sprite,mat,base,phase,size,side} of state.sparks){const u=(t*(.48+phase*.013)+phase)%1,life=Math.sin(Math.PI*u);sprite.position.set(base.x+side*Math.sin(u*3.1)*.024,base.y+u*.068,base.z+Math.sin(u*4+phase)*.012);sprite.scale.set(size*(.3+life*.7),size*(.6+life*1.8),1);mat.color.setHex(state.tier===3?0xff6510:COLORS[state.tier]);mat.opacity=state.tier>=2?life*Math.min(.95,.60*state.strength)*(dead?0:1):0;}
}
export function installGlow(actor){
 const weapon=makeState(),armor=makeState(),blade=new THREE.Group();blade.name='equipment-weapon-emission';actor.sword.add(blade);weapon.groups.push(blade);
 // Two sided, narrow white/gold cores with orange emissive edges. Geometry stays
 // attached to the accepted sword, so every turn, swing and death follows its grip.
 const bladePaths=[];for(const z of [-.034,.059]){bladePaths.push([[-.023,.14,z],[-.066,.23,z],[-.037,.31,z],[-.049,.41,z],[-.028,.57,z],[0,.875,z*.4]]);bladePaths.push([[.023,.14,z],[.066,.23,z],[.037,.31,z],[.049,.41,z],[.028,.57,z],[0,.875,z*.4]]);bladePaths.push([[0,.16,z],[.015,.24,z],[-.014,.33,z],[.013,.44,z],[-.012,.54,z],[0,.73,z]]);}
 luminousPaths(blade,bladePaths,weapon,.0032);for(const y of [.20,.43,.66,.84])star(blade,[0,y,.054],y===.84?.09:.13,weapon);
 for(let i=0;i<16;i++){const side=i%2?1:-1,y=.19+Math.floor(i/2)*.085,x=side*(.071-(y-.19)*.065),mat=new THREE.SpriteMaterial({map:flame(),color:0xff6812,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const sprite=new THREE.Sprite(mat),base=V(x,y,.02);sprite.userData.equipmentBloom=true;sprite.position.copy(base);blade.add(sprite);weapon.sparks.push({sprite,mat,base,side,size:.07,phase:i*.371});}
 for(let i=0;i<8;i++){const mat=new THREE.SpriteMaterial({map:halo(),color:0xffe6a6,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});const sprite=new THREE.Sprite(mat);sprite.userData.equipmentBloom=true;sprite.scale.set(.035,.11,1);blade.add(sprite);weapon.surges.push({sprite,mat,phase:i*.137});}
 // Breastplate runes and gem; these are small bone-mounted light sources, not a
 // screen-space blob. Keep the accepted metal plating readable between lines.
 const chest=new THREE.Group();chest.name='equipment-chest-emission';const chestAnchor=actor.bones.Spine2.children.find(g=>g.isGroup&&g!==actor.capeGroup&&!actor.wings.includes(g));if(!chestAnchor)throw new Error('Chest glow anchor missing');chestAnchor.add(chest);chest.position.z=.059;armor.groups.push(chest);
 luminousPaths(chest,[[[-.071,.025,0],[-.042,.007,.007],[0,-.043,.004],[.042,.007,.007],[.071,.025,0]],[[0,.037,0],[.024,.008,.003],[0,-.018,.003],[-.024,.008,.003],[0,.037,0]]],armor,.0022);star(chest,[0,.008,.009],.17,armor);
 for(let side of [-1,1]){
  const shoulder=new THREE.Group();shoulder.name='equipment-shoulder-emission';actor.ornaments[side<0?0:1].add(shoulder);armor.groups.push(shoulder);const paths=[];
  for(let j=0;j<3;j++){const x=side*(.02+j*.03);paths.push([[x,.05,-.014],[x+side*.022,.105+j*.014,-.015],[x+side*(.07+j*.012),.155+j*.021,-.016]]);}
  paths.push([[-.064,-.005,.090],[0,.02,.115],[.064,-.005,.090]]);luminousPaths(shoulder,paths,armor,.0025);star(shoulder,[0,0,.118],.15,armor);
  const hand=new THREE.Group();hand.name='equipment-gauntlet-emission';actor.bones[side<0?'RightHand':'LeftHand'].add(hand);if(side<0){hand.position.copy(actor.gripBind.position);hand.quaternion.copy(actor.gripBind.quaternion);}armor.groups.push(hand);star(hand,[0,0,.014],.07,armor);
 }
 // Follow the existing feather groups, including their skeletal mounts.
 for(const wing of actor.wings){const feathers=wing.children.filter(g=>g.isGroup);for(let i=0;i<feathers.length;i++){const feather=feathers[i],g=new THREE.Group(),len=.28+i*.032;g.name='equipment-wing-emission';feather.add(g);armor.groups.push(g);luminousPaths(g,[[[-.018,.01,.029],[-.041,len*.25,.026],[-.030,len*.54,.026],[0,len,.02],[.019,len*.53,.026]],[[0,.025,.037],[0,len*.5,.037],[0,len*.91,.014]]],armor,.0023);star(g,[0,len*.89,.023],.085,armor);}}
 const update=actor.update.bind(actor);actor.update=function(a,t,preview){update(a,t,preview);const v=a.visual||{};apply(weapon,v.weapon??0,v.weaponEnhance||0,v.hasWeapon!==false);apply(armor,v.armor??0,v.armorEnhance||0,v.hasArmor!==false);animate(weapon,t,a.state==='dead');animate(armor,t,a.state==='dead');this.root.userData.equipmentGlow={weapon:{tier:weapon.tier,rank:weapon.rank,strength:weapon.strength},armor:{tier:armor.tier,rank:armor.rank,strength:armor.strength},worldTime:t};};
 actor.equipmentGlow={weapon,armor};return actor.equipmentGlow;
}
