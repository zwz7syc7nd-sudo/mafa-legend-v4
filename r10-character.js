import * as THREE from 'three';
import {GLTFLoader} from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from './vendor/three/examples/jsm/utils/SkeletonUtils.js';
import {RoomEnvironment} from './vendor/three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from './vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
// Exact integration of a speed-limited exponential turn. For a constant target,
// splitting elapsed time into 30/60 Hz steps gives the same angle. No Euler clamp
// can turn a long frame into an immediate snap; wrap through the shortest arc.
export function advanceYaw(current,target,dt,attacking=false){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 const distance=Math.abs(delta),rate=attacking?16:12,maxSpeed=attacking?Math.PI*3:Math.PI*2;
 const threshold=maxSpeed/rate,linearTime=Math.max(0,(distance-threshold)/maxSpeed);
 const elapsed=Math.max(0,dt);
 const remaining=elapsed<=linearTime?distance-maxSpeed*elapsed:Math.min(distance,threshold)*Math.exp(-rate*(elapsed-linearTime));
 return current+Math.sign(delta)*(distance-remaining);
}
let source;
const texLoader=new THREE.TextureLoader();
const assetRoot=new URL('./assets/r10/',import.meta.url).href;
export async function loadCharacter(){
 if(source)return source;
 const [gltf,map,mr,bump]=await Promise.all([new GLTFLoader().loadAsync(assetRoot+'champion.glb'),texLoader.loadAsync(assetRoot+'champion-gold.png'),texLoader.loadAsync(assetRoot+'champion-mr.png'),texLoader.loadAsync(assetRoot+'champion-height.png')]);
 for(const t of [map,mr,bump]){t.flipY=false;t.anisotropy=4;}map.colorSpace=THREE.SRGBColorSpace;
 gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.material=new THREE.MeshStandardMaterial({map,metalnessMap:mr,roughnessMap:mr,metalness:.88,roughness:.72,bumpMap:bump,bumpScale:.0022,side:THREE.DoubleSide});o.frustumCulled=false;
 // Replace the central long tabard. A continuous panel weighted to both legs tears during strides.
 const p=o.geometry.attributes.position,ix=o.geometry.index.array,kept=[];let removed=0;
 for(let i=0;i<ix.length;i+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=p.getX(ix[i+k])/3;y+=p.getY(ix[i+k])/3;z+=p.getZ(ix[i+k])/3;}if((y>.25&&y<.585&&Math.abs(x)<.145&&z>.058)||(x<-.463&&y>.65&&y<.80)){removed++;}else kept.push(ix[i],ix[i+1],ix[i+2]);}
 o.geometry=o.geometry.clone();o.geometry.setIndex(kept);o.userData.removedTabardTriangles=removed;
 }});
 const keep=['idle','walk_loop','jog_fwd_loop','sword_regular_a','sword_regular_b','sword_regular_c','hit_chest','death'];
 gltf.animations=gltf.animations.filter(c=>keep.includes(c.name)).map(c=>{const clip=c.clone();const seen=new Set();clip.tracks=clip.tracks.filter(t=>{if(seen.has(t.name))return false;seen.add(t.name);return true;});for(const t of clip.tracks){if(t.name==='mixamorigHips.position'){for(let i=0;i<t.values.length;i+=3){t.values[i]=0;t.values[i+2]=0;}}}return clip;});
 source=gltf;return source;
}

function mesh(geo,mat,parent,pos){const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;if(pos)m.position.fromArray(pos);parent.add(m);return m;}
function plate(points,depth,mat,parent,z=0){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.0025,bevelThickness:.0025,bevelSegments:2,steps:1,curveSegments:6});g.translate(0,0,z-depth/2);return mesh(g,mat,parent);}
function tube(points,r,mat,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(12,points.length*5),r,5,false),mat,parent);}
function jewel(parent,x,y,z,s,mat){const j=mesh(new THREE.OctahedronGeometry(s,0),mat,parent,[x,y,z]);j.scale.set(.8,1.2,.42);return j;}
function relief(points,depth,bulge,mat,parent,z=0){let cx=0,cy=0;for(const p of points){cx+=p[0]/points.length;cy+=p[1]/points.length;}const n=points.length,pos=[],idx=[];for(const [scale,dz] of [[1,-depth/2],[1,depth/2],[.78,depth/2+bulge*.45],[.2,depth/2+bulge]])for(const p of points)pos.push(cx+(p[0]-cx)*scale,cy+(p[1]-cy)*scale,z+dz);for(let r=0;r<3;r++)for(let i=0;i<n;i++){let a=r*n+i,b=r*n+(i+1)%n;idx.push(a,b,a+n,b,b+n,a+n);}for(let i=1;i<n-1;i++){idx.push(3*n,3*n+i,3*n+i+1);idx.push(0,i+1,i);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(pos.flatMap((_,i)=>i%3===0?[pos[i]*5,pos[i+1]*5]:[]),2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,mat,parent);}
function dragonRelief(parent,x,y,z,s,materials){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);const m=materials;relief([[-.027,.021],[-.036,.056],[-.016,.038],[0,.047],[.016,.038],[.036,.056],[.027,.021],[.041,-.005],[.019,-.018],[0,-.045],[-.019,-.018],[-.041,-.005]],.009,.015,m.gold,g);for(const side of [-1,1]){horn(g,[[side*.024,.037,.015],[side*.052,.064,.012],[side*.048,.10,0]],.007,m.edge);jewel(g,side*.017,.015,.024,.007,m.ruby);tube([[side*.033,0,.018],[side*.015,-.013,.029],[0,-.024,.031]],.002,m.dark,g);}return g;}
function metalFinish(materials){const n=256,c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d'),im=ctx.createImageData(n,n);let seed=3919;for(let y=0;y<n;y++)for(let x=0;x<n;x++){seed=(seed*1664525+1013904223)>>>0;const a=(seed/4294967296-.5),v=190+a*27+Math.sin(x*.34+y*.008)*8,i=(y*n+x)*4;im.data[i]=v;im.data[i+1]=v;im.data[i+2]=v;im.data[i+3]=255;}ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);for(const name of ['gold','edge','dark','red']){materials[name].bumpMap=t;materials[name].bumpScale=.0007;materials[name].roughnessMap=t;materials[name].roughness=name==='edge'?.44:.62;}materials.edge.color.setHex(0xd7b779);}
function batchGroup(group){group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),byMat=new Map(),remove=[];group.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const name of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(name))geo.deleteAttribute(name);if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));geo.applyMatrix4(inverse.clone().multiply(o.matrixWorld));const key=o.material.uuid;if(!byMat.has(key))byMat.set(key,{material:o.material,geos:[]});byMat.get(key).geos.push(geo);remove.push(o);});for(const o of remove)o.removeFromParent();for(const {material,geos} of byMat.values()){const g=mergeGeometries(geos,false);if(g)mesh(g,material,group);for(const p of geos)p.dispose();}}
function horn(parent,pts,r,mat){const path=new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),n=16,k=7,positions=[],inds=[];const frames=path.computeFrenetFrames(n,false);for(let i=0;i<=n;i++){let p=path.getPoint(i/n),rad=r*Math.pow(1-i/n,.8)+.0004;for(let j=0;j<k;j++){let q=p.clone().addScaledVector(frames.normals[i],Math.cos(j/k*Math.PI*2)*rad).addScaledVector(frames.binormals[i],Math.sin(j/k*Math.PI*2)*rad);positions.push(...q.toArray());if(i<n){let a=i*k+j,b=i*k+(j+1)%k;inds.push(a,b,a+k,b,b+k,a+k);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(inds);g.computeVertexNormals();return mesh(g,mat,parent);}

export class R10Character {
 constructor(gltf){
 this.root=new THREE.Group();this.body=clone(gltf.scene);this.root.add(this.body);this.bones={};this.body.traverse(o=>{if(o.isBone)this.bones[o.name.replace('mixamorig','')]=o;if(o.isSkinnedMesh){this.skin=o;o.castShadow=o.receiveShadow=true;}});this.body.updateMatrixWorld(true);
 this.materials={gold:new THREE.MeshStandardMaterial({color:0xd6a64e,metalness:.9,roughness:.29}),edge:new THREE.MeshStandardMaterial({color:0xf7d891,metalness:.85,roughness:.23}),dark:new THREE.MeshStandardMaterial({color:0x322217,metalness:.78,roughness:.37}),red:new THREE.MeshStandardMaterial({color:0x670f19,metalness:.30,roughness:.4}),cloth:new THREE.MeshStandardMaterial({color:0x620c17,metalness:.03,roughness:.87,side:THREE.DoubleSide}),ruby:new THREE.MeshStandardMaterial({color:0x930716,metalness:.5,roughness:.19,emissive:0xe92e05,emissiveIntensity:.1})};
 metalFinish(this.materials);this.ornaments=[];this.effects=true;this.buildArmor();this.buildCape();this.buildWings();
 this.mixer=new THREE.AnimationMixer(this.body);this.clips=Object.fromEntries(gltf.animations.map(c=>[c.name,c]));this.actions=Object.fromEntries(gltf.animations.map(c=>[c.name,this.mixer.clipAction(c)]));this.actions.idle.play();this.current='idle';this.mixer.update(.15);this.body.updateMatrixWorld(true);
 for(let i=0;i<2;i++){const side=i===0?-1:1,group=this.ornaments[i],parent=group.parent,anchor=this.bones[side<0?'RightArm':'LeftArm'].getWorldPosition(V());this.body.add(group);group.position.copy(anchor).add(V(side*.039,.033,0));group.rotation.set(0,0,0);this.body.updateMatrixWorld(true);parent.attach(group);}
 this.buildSword();this.gripBind={position:this.sword.position.clone(),quaternion:this.sword.quaternion.clone()};
 for(const bone of Object.values(this.bones))for(const group of [...bone.children])if(group.isGroup&&group!==this.capeGroup)batchGroup(group);
 this.footSamples=[];const p=this.skin.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<.026&&i%9===0)this.footSamples.push(i);
 this.time=0;this.lastT=null;this.lastAction=null;this.hurtUntil=0;this.state='idle';this.lastHurt=0;this.lastPos=null;this.phase=0;this.footLocks={};this.yaw=null;
 }
 mount(obj,bone,pos){obj.position.fromArray(pos);this.body.add(obj);this.body.updateMatrixWorld(true);this.bones[bone].attach(obj);return obj;}
 buildArmor(){const m=this.materials;
 // Three overlapping, closed plates per shoulder; raised ribs and dragon crest silhouettes.
 for(const side of [-1,1]){
 const shoulder=new THREE.Group();
 for(let j=0;j<3;j++){const shell=mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.65),j===0?m.red:m.gold,shoulder,[side*j*.027,-j*.024,0]);shell.scale.set(.111-j*.009,.075-j*.009,.088-j*.008);shell.rotation.z=-side*.2;
 const hoop=[];for(let k=0;k<=24;k++){let a=k/24*Math.PI*2;hoop.push([Math.cos(a)*(.111-j*.009)+side*j*.027,-j*.024-.025,Math.sin(a)*(.088-j*.008)]);}tube(hoop,.0035,m.edge,shoulder);}
 for(let j=0;j<4;j++){let x=side*(.015+j*.024);horn(shoulder,[[x,.046,-.017],[x+side*.025,.10+j*.009,-.019],[x+side*(.07+j*.012),.15+j*.021,-.018]],.018-j*.0025,j%2?m.gold:m.edge);}
 for(let j=0;j<7;j++){const ang=-1.30+j*.43,points=[];for(let k=0;k<12;k++){const p=k/11,theta=.2+p*1.72;points.push([Math.cos(ang)*.112*Math.sin(theta),.076*Math.cos(theta),Math.sin(ang)*.090*Math.sin(theta)]);}tube(points,.004,j%2?m.gold:m.edge,shoulder);}
 for(let j=0;j<4;j++){const tile=relief([[-.027,.022],[0,.045],[.027,.022],[.023,-.019],[0,-.038],[-.023,-.019]],.009,.012,j%2?m.gold:m.dark,shoulder);tile.position.set(side*(j*.026-.025),.057,.042);tile.rotation.set(-.70,side*.25,-side*.28);}
 for(let j=0;j<9;j++){let ang=j/9*Math.PI*2;mesh(new THREE.SphereGeometry(.004,6,4),m.gold,shoulder,[Math.cos(ang)*.095,.038,Math.sin(ang)*.072]);}
 plate([[-.035,.014],[0,.045],[.043,.002],[.035,-.050],[0,-.077],[-.034,-.044]],.016,m.dark,shoulder,.080);
 for(const s of [-1,1]){tube([[s*.036,-.03,.093],[s*.020,.011,.099],[0,.023,.10],[s*.011,-.014,.106],[0,-.045,.11]],.004,m.edge,shoulder);}
 jewel(shoulder,0,-.004,.111,.020,m.ruby);dragonRelief(shoulder,0,-.015,.105,.80,m);for(let j=0;j<3;j++)plate([[-.011,0],[0,-.028],[.011,0]],.008,m.gold,shoulder,.092).position.set(side*j*.020,-.04-j*.01,0);
 this.mount(shoulder,side<0?'RightShoulder':'LeftShoulder',[side*.195,.803,-.005]);this.ornaments.push(shoulder);
 // Greave crest and kneecap trim.
 const knee=new THREE.Group();plate([[-.037,.039],[0,.062],[.039,.031],[.032,-.045],[0,-.065],[-.03,-.043]],.017,m.gold,knee,.003);jewel(knee,0,.008,.017,.016,m.ruby);tube([[-.029,.032,.018],[0,-.043,.024],[.029,.032,.018]],.0035,m.edge,knee);this.mount(knee,side<0?'RightLeg':'LeftLeg',[side*.099,.28,.067]);
 const shin=new THREE.Group();plate([[-.027,.068],[0,.102],[.032,.067],[.024,-.056],[0,-.078],[-.020,-.056]],.009,m.dark,shin);tube([[-.026,.068,.01],[0,.093,.018],[.026,.067,.01],[.02,-.056,.012],[0,-.071,.016],[-.02,-.056,.012],[-.026,.068,.01]],.003,m.gold,shin);tube([[0,.08,.016],[0,-.056,.016]],.003,m.edge,shin);this.mount(shin,side<0?'RightLeg':'LeftLeg',[side*.099,.173,.057]);
 // Split tassets follow their own thigh; no bridge between the thighs.
 const skirt=new THREE.Group();for(let j=0;j<3;j++){const layer=new THREE.Group();layer.position.set(0,-j*.061,.03-j*.009);skirt.add(layer);let w=.072-j*.007;relief([[-w,.008],[0,.024],[w,.008],[w*.86,-.048],[0,-.085],[-w*.86,-.048]],.016,.018,j%2?m.red:m.dark,layer);tube([[-w,.008,.010],[0,.024,.014],[w,.008,.010],[w*.86,-.048,.010],[0,-.085,.01],[-w*.86,-.048,.01],[-w,.008,.01]],.0035,m.gold,layer);relief([[-.041,-.021],[0,-.038],[.041,-.021],[.020,-.059],[0,-.078],[-.020,-.059]],.007,.009,m.gold,layer,.026);dragonRelief(layer,0,-.016,.031,.45,m);}
 skirt.scale.set(.80,.82,1);this.mount(skirt,side<0?'RightUpLeg':'LeftUpLeg',[side*.086,.555,.092]);
 }
 const chest=new THREE.Group();relief([[-.104,.035],[-.075,.068],[0,.041],[.075,.068],[.104,.035],[.076,-.054],[0,-.083],[-.076,-.054]],.025,.027,m.dark,chest);
 for(const side of [-1,1]){tube([[side*.093,.043,.020],[side*.051,.013,.036],[0,-.051,.052]],.006,m.gold,chest);tube([[side*.080,.013,.024],[side*.036,-.004,.045],[side*.017,-.038,.057]],.003,m.edge,chest);horn(chest,[[side*.016,.019,.035],[side*.042,.071,.025],[side*.073,.091,.004]],.010,m.gold);}
 jewel(chest,0,.008,.055,.03,m.ruby);tube([[0,.039,.057],[.026,.008,.059],[0,-.026,.059],[-.026,.008,.059],[0,.039,.057]],.0037,m.edge,chest);dragonRelief(chest,0,-.031,.040,.74,m);chest.scale.setScalar(.78);this.mount(chest,'Spine2',[0,.746,.077]);
 const belt=new THREE.Group();relief([[-.081,.022],[.081,.022],[.065,-.025],[0,-.055],[-.067,-.027]],.023,.016,m.dark,belt);dragonRelief(belt,0,-.003,.025,.70,m);this.mount(belt,'Hips',[0,.618,.095]);
 const crown=new THREE.Group();for(const side of [-1,1]){horn(crown,[[side*.027,0,.035],[side*.053,.036,.010],[side*.045,.088,-.006]],.009,m.gold);tube([[side*.041,0,.02],[0,.019,.05]],.0035,m.edge,crown);}jewel(crown,0,.018,.047,.011,m.ruby);this.mount(crown,'Head',[0,.899,.035]);
 }
 buildCape(){const m=this.materials,group=new THREE.Group(),positions=[],uv=[],inds=[],cols=16,rows=22;
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){let u=i/cols,v=j/rows,x=(u-.5)*(.28+.33*v),y=-v*(.64-.055*Math.cos(u*Math.PI*4))+.075*Math.pow(Math.abs(u-.5)*2,2)*v,z=-.022-v*.08+Math.sin(u*Math.PI*8)*.034*v;positions.push(x,y,z);uv.push(u,v);if(i<cols&&j<rows){let a=j*(cols+1)+i;inds.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(inds);geo.computeVertexNormals();this.cape=mesh(geo,m.cloth,group);this.capeBase=positions.slice();this.capeGroup=group;this.mount(group,'Spine2',[0,.786,-.088]);
 const border=new THREE.Group();group.add(border);this.capeTrim=border;this.capeEdges=[0,cols];
 // Fine brocade is a cloth material, while the silhouette remains a deforming mesh.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;let g=canvas.getContext('2d');g.fillStyle='#610d18';g.fillRect(0,0,512,512);g.strokeStyle='#b1843f';g.lineWidth=9;g.strokeRect(16,9,480,492);g.lineWidth=2;g.strokeRect(27,20,458,470);for(let y=40;y<500;y+=42)for(let x=30;x<510;x+=45){g.globalAlpha=.15;g.beginPath();g.moveTo(x,y-13);g.lineTo(x+13,y);g.lineTo(x,y+13);g.lineTo(x-13,y);g.closePath();g.stroke();}g.globalAlpha=.8;g.lineWidth=5;g.beginPath();g.moveTo(256,90);g.bezierCurveTo(170,125,350,230,256,370);g.bezierCurveTo(370,255,157,202,256,90);g.stroke();const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;this.materials.cloth.map=t;
 }
 buildWings(){const m=this.materials;this.wings=[];for(const side of [-1,1]){const g=new THREE.Group();for(let i=0;i<4;i++){const feather=new THREE.Group(),len=.28+i*.032;g.add(feather);feather.position.set(side*i*.033,-i*.047,-i*.012);feather.rotation.set(.05,-side*.17,-side*(.54+i*.20));const pts=[[-.018,0],[-.045,len*.24],[-.034,len*.55],[0,len],[.023,len*.54],[.017,len*.25]];relief(pts,.012,.009,m.gold,feather);relief(pts.map(([x,y])=>[x*.54,y*.85+.011]),.007,.006,m.red,feather,.019);tube([[0,.025,.03],[0,len*.5,.03],[0,len*.92,.01]],.003,m.edge,feather);for(let j=1;j<4;j++)tube([[-.02,len*j/4,.025],[0,len*(j+.25)/4,.032],[.017,len*j/4,.025]],.002,m.dark,feather);}
 this.mount(g,'Spine2',[side*.104,.800,-.104]);this.wings.push(g);}}
 buildSword(){const m=this.materials,weapon=new THREE.Group();this.sword=weapon;
 const grip=mesh(new THREE.CylinderGeometry(.013,.015,.14,12),m.dark,weapon,[0,0,0]);for(let i=0;i<7;i++)mesh(new THREE.TorusGeometry(.014,.002,5,12),m.gold,weapon,[0,-.061+i*.019,0]).rotation.x=Math.PI/2;
 jewel(weapon,0,-.092,0,.023,m.ruby);mesh(new THREE.SphereGeometry(.023,12,8),m.gold,weapon,[0,-.078,0]).scale.set(1,.55,1);
 const outline=[[-.025,.080],[-.086,.124],[-.101,.242],[-.066,.267],[-.09,.347],[-.056,.364],[-.065,.495],[-.045,.560],[0,.89],[.044,.58],[.075,.492],[.063,.365],[.099,.343],[.064,.267],[.102,.233],[.083,.125],[.025,.080]];
 relief(outline,.022,.022,m.gold,weapon);const inset=outline.map(([x,y])=>[x*.72,(y-.08)*.94+.092]);relief(inset,.024,.029,m.red,weapon);
 for(const z of [-.023,.047]){tube(outline.map(([x,y])=>[x,y,z<0?-.013:.013]),.0025,m.edge,weapon);tube([[0,.13,z],[0,.70,z],[0,.85,z*.3]],.006,m.gold,weapon);for(let i=0;i<5;i++){let y=.20+i*.09;dragonRelief(weapon,0,y,z,.43,m);}}
 for(const side of [-1,1]){horn(weapon,[[side*.021,.094,0],[side*.075,.064,.003],[side*.133,.13,0]],.022,m.gold);horn(weapon,[[side*.015,.12,0],[side*.053,.16,.004],[side*.046,.203,0]],.012,m.edge);}
 jewel(weapon,0,.108,.027,.030,m.ruby);jewel(weapon,0,.108,-.027,.030,m.ruby);
 const hand=this.bones.RightHand,world=hand.getWorldPosition(V());weapon.position.copy(world).add(V(0,-.012,.025));weapon.rotation.z=.32;this.body.add(weapon);this.body.updateMatrixWorld(true);hand.attach(weapon);
 // Closed gauntlet knuckles, visibly wrapping around the hilt.
 const fist=new THREE.Group();mesh(new THREE.SphereGeometry(1,12,8),m.dark,fist).scale.set(.025,.029,.026);for(let k=0;k<4;k++){let x=(k-1.5)*.011;tube([[x,.015,-.018],[x,.023,.011],[x,.005,.023]],.0055,m.gold,fist);}fist.position.set(0,-.012,.0);weapon.add(fist);
 this.swordTip=new THREE.Object3D();this.swordTip.position.set(0,.89,0);weapon.add(this.swordTip);
 }
 setAppearance(visual={armor:3,weapon:3}){const tier=visual.armor??3;if(this.tier===tier&&this.weaponTier===visual.weapon)return;this.tier=tier;this.weaponTier=visual.weapon;const pal=[0x999a93,0xb9d2d6,0xa9956a,0xd6a64e];this.materials.gold.color.setHex(pal[tier]);this.materials.red.color.setHex([0x352b25,0x1c3f4d,0x351e43,0x670f19][tier]);this.ornaments.forEach(o=>o.visible=tier>=2);this.capeGroup.visible=tier>=1;}
 setEffects(enabled){this.effects=enabled;this.materials.ruby.emissiveIntensity=enabled?.14:0;}
 choose(name,dt,seek=null){if(!this.actions[name])name='idle';if(this.current!==name){const old=this.actions[this.current],next=this.actions[name];next.reset().play();next.setEffectiveWeight(1);old.crossFadeTo(next,.13,false);this.current=name;}const a=this.actions[name];if(seek!==null){a.time=Math.max(0,Math.min(this.clips[name].duration-.0001,seek));a.paused=true;}else a.paused=false;this.mixer.update(dt);}
 pose(state,t,options={}){const duration=this.clips[state]?.duration||1;for(const a of Object.values(this.actions)){a.stop();a.enabled=false;}const a=this.actions[state]||this.actions.idle;a.enabled=true;a.reset().play();a.time=t%duration;a.paused=true;this.mixer.update(0);this.current=state;this.state=state;this.recoil(state,t%duration);this.manageSword(state,t%duration);this.decorate(t,options);}
 manageSword(state,t){if(state==='death'&&t>.18){if(!this.dropStart){this.root.updateMatrixWorld(true);this.root.attach(this.sword);this.dropStart={p:this.sword.position.clone(),q:this.sword.quaternion.clone()};}const u=THREE.MathUtils.clamp((t-.18)/.40,0,1),ease=u*u*(3-2*u);this.sword.position.lerpVectors(this.dropStart.p,V(-.08,.065,.18),ease);this.sword.quaternion.slerpQuaternions(this.dropStart.q,new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,-Math.PI/2)),ease);}else if(this.dropStart){this.bones.RightHand.add(this.sword);this.sword.position.copy(this.gripBind.position);this.sword.quaternion.copy(this.gripBind.quaternion);this.dropStart=null;}}
 recoil(state,t){if(state!=='hit_chest')return;const k=Math.sin(Math.PI*Math.min(1,t/.375));this.bones.Spine1.rotateX(-k*.23);this.bones.Head.rotateX(k*.10);this.bones.RightArm.rotateZ(k*.10);this.bones.LeftArm.rotateZ(-k*.16);}
 update(actor,t,preview=false){let dt=this.lastT===null?0:Math.max(0,Math.min(.25,t-this.lastT));this.lastT=t;this.setAppearance(actor.visual);const wanted=actor.yaw||0;if(this.yaw===null||preview)this.yaw=wanted;const delta=Math.atan2(Math.sin(wanted-this.yaw),Math.cos(wanted-this.yaw));this.yaw=advanceYaw(this.yaw,wanted,dt,!!actor.action);this.root.rotation.y=this.yaw;let name='idle',seek=null;
 if(actor.state==='dead'){name='death';seek=Math.min(actor.deathTime||0,this.clips.death.duration-.001);}
 else if(actor.hurt>this.lastHurt+.025){this.hurtUntil=t+.375;}this.lastHurt=actor.hurt||0;
 if(actor.state!=='dead'&&t<this.hurtUntil){name='hit_chest';seek=.375-(this.hurtUntil-t);}
 else if(actor.state!=='dead'&&actor.action){const kinds={basic:'sword_regular_a',crescent:'sword_regular_b',fire:'sword_regular_c',whirl:'sword_regular_c',dash:'sword_regular_a'};name=kinds[actor.action.kind]||'sword_regular_a';const p=Math.max(0,Math.min(1,actor.action.elapsed/actor.action.duration));seek=p*this.clips[name].duration;}
 else if(actor.state!=='dead'&&(actor.moving||Math.abs(delta)>.06)){name='walk_loop';const speed=preview?.64:this.lastPos&&dt>0?Math.hypot(actor.x-this.lastPos.x,actor.z-this.lastPos.z)/dt/7.2:.64;this.actions.walk_loop.timeScale=Math.max(.40,Math.min(3,speed/.641));}
 this.lastPos={x:actor.x||0,z:actor.z||0};this.choose(name,dt,seek);this.state=name;this.recoil(name,seek||0);this.manageSword(name,seek||0);this.decorate(t,{moving:actor.moving,dead:actor.state==='dead'});if(name==='walk_loop'&&!preview)this.plantFeet(actor,dt);else {this.footLocks={};this.lastToeLocal={};}
 }
 plantFeet(actor,dt){
 const offset=V((actor.x||0)/7.2,0,(actor.z||0)/7.2);this.lastToeLocal??={};
 for(const side of ['Left','Right']){
  const upper=this.bones[side+'UpLeg'],lower=this.bones[side+'Leg'],foot=this.bones[side+'Foot'],toe=this.bones[side+'ToeBase'];let toeP=toe.getWorldPosition(V()),end=foot.getWorldPosition(V());const local=this.root.worldToLocal(toeP.clone()),previous=this.lastToeLocal[side];this.lastToeLocal[side]=local;
  const returning=previous&&dt>0&&(local.z-previous.z)/dt>.15,contact=toeP.y<.105&&!returning;
  if(!contact){delete this.footLocks[side];continue;}
  let lock=this.footLocks[side];if(!lock){lock=toeP.clone().add(offset);this.footLocks[side]=lock;}
  let shift=lock.clone().sub(offset).sub(toeP);if(shift.length()>.14){this.footLocks[side]=toeP.clone().add(offset);continue;}
  const target=end.clone().add(shift),A=upper.getWorldPosition(V()),B=lower.getWorldPosition(V()),C=end,footQ=foot.getWorldQuaternion(new THREE.Quaternion()),ab=B.clone().sub(A),bc=C.clone().sub(B),L1=ab.length(),L2=bc.length(),dir=target.clone().sub(A),d=dir.length();
  // Release an unreachable contact instead of fighting the turn with a straight
  // knee and silently sliding a supposedly planted toe.
  if(d>=L1+L2-.0001||d<=Math.abs(L1-L2)+.0001){this.footLocks[side]=toeP.clone().add(offset);continue;}dir.normalize();
  const axis=ab.clone().addScaledVector(dir,-ab.dot(dir)).normalize(),x=(d*d+L1*L1-L2*L2)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-x*x)),newB=A.clone().addScaledVector(dir,x).addScaledVector(axis,h),q=new THREE.Quaternion().setFromUnitVectors(ab.normalize(),newB.clone().sub(A).normalize()).multiply(upper.getWorldQuaternion(new THREE.Quaternion()));
  upper.quaternion.copy(upper.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));upper.updateWorldMatrix(false,true);
  const actualB=lower.getWorldPosition(V()),actualC=foot.getWorldPosition(V()),lq=new THREE.Quaternion().setFromUnitVectors(actualC.sub(actualB).normalize(),target.clone().sub(actualB).normalize()).multiply(lower.getWorldQuaternion(new THREE.Quaternion()));lower.quaternion.copy(lower.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(lq));lower.updateWorldMatrix(false,true);foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(footQ));this.root.updateMatrixWorld(true);
 }
 }

 decorate(t,{moving=false,dead=false}={}){
 // Keep grip stable during travel while retaining the spine and leg stride from the CC0 clip.
 this.body.updateMatrixWorld(true);this.skin.skeleton.update();let minY=Infinity;const p=this.skin.geometry.attributes.position;
 for(const i of this.footSamples){const q=this.skin.applyBoneTransform(i,V(p.getX(i),p.getY(i),p.getZ(i)));minY=Math.min(minY,q.y);}this.body.position.y=dead?0:Math.max(-.08,Math.min(.12,-minY));
 const spineQ=this.bones.Spine2.getWorldQuaternion(new THREE.Quaternion()),e=new THREE.Euler().setFromQuaternion(spineQ,'YXZ'),desired=new THREE.Quaternion().setFromAxisAngle(V(0,1,0),e.y);this.capeGroup.quaternion.copy(spineQ.invert().multiply(desired));
 const a=this.cape.geometry.attributes.position;
 for(let i=0;i<a.count;i++){const k=i*3,v=-this.capeBase[k+1]/.63,u=this.capeBase[k];let wind=Math.sin(t*(moving?7:2.3)+v*4+u*8)*(.012+.031*v)*v;a.setXYZ(i,u+wind*.4,this.capeBase[k+1]+Math.sin(t*2.1+u*10)*.012*v,this.capeBase[k+2]-Math.abs(wind)-(moving?.095*v:0));}a.needsUpdate=true;this.cape.geometry.computeVertexNormals();this.root.updateMatrixWorld(true);if(!dead)this.clearWeapon();
 }
 clearWeapon(){const hand=this.bones.RightHand,colliders=[[this.bones.Spine2,.137],[this.bones.Spine1,.13],[this.bones.Hips,.12],[this.bones.Head,.096]];for(let j=0;j<16;j++){const A=this.sword.localToWorld(V(0,.14,0)),B=this.sword.localToWorld(V(0,.86,0)),D=B.clone().sub(A),length=D.lengthSq();let worst=null;for(const [bone,r] of colliders){const C=bone.getWorldPosition(V());if(bone===this.bones.Head)C.y+=.035;const u=THREE.MathUtils.clamp(C.clone().sub(A).dot(D)/length,0,1),P=A.clone().addScaledVector(D,u),away=P.sub(C),gap=r-away.length();if(gap>0&&(!worst||gap>worst.gap))worst={gap,away};}if(!worst)break;const axis=D.clone().cross(worst.away).normalize();if(axis.lengthSq()<.001)break;const delta=new THREE.Quaternion().setFromAxisAngle(axis,Math.min(.10,worst.gap*1.8)),world=delta.multiply(hand.getWorldQuaternion(new THREE.Quaternion()));hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));hand.updateWorldMatrix(false,true);}}
 metrics(){return {state:this.state,hips:this.bones.Hips.position.toArray(),swordParent:this.sword.parent.name,tabardRemoved:this.skin.userData.removedTabardTriangles,bones:Object.keys(this.bones).length,triangles:this.skin.geometry.index.count/3};}
}

export class CharacterRenderer {
 constructor({size=512,alpha=true}={}){this.renderer=new THREE.WebGLRenderer({alpha,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.renderer.setSize(size,size);this.renderer.setPixelRatio(1);this.renderer.setClearColor(0x000000,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;this.scene=new THREE.Scene();const pmrem=new THREE.PMREMGenerator(this.renderer);this.scene.environment=pmrem.fromScene(new RoomEnvironment(),.05).texture;pmrem.dispose();this.scene.add(new THREE.HemisphereLight(0xd5dbef,0x312319,1.6));const key=new THREE.DirectionalLight(0xffd9a4,3.2);key.position.set(-2,3,4);this.scene.add(key);const rim=new THREE.DirectionalLight(0xcce0ff,2);rim.position.set(2,2,-3);this.scene.add(rim);this.camera=new THREE.OrthographicCamera(-1.15,1.15,1.15,-1.15,.01,20);this.camera.position.set(3,5,4);this.camera.lookAt(0,.49,0);this.scene.add(this.camera);this.size=size;}
 setCharacter(char){if(this.char)this.scene.remove(this.char.root);this.char=char;this.scene.add(char.root);}
 render({preview=false,size=this.size}={}){if(this.size!==size){this.renderer.setSize(size,size);this.size=size;}const half=preview?1.02:1.10;this.camera.left=this.camera.bottom=-half;this.camera.right=this.camera.top=half;this.camera.position.copy(preview?V(0,1.30,5):V(3,5.49,4));this.camera.lookAt(0,.49,0);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);const origin=V().project(this.camera);return {canvas:this.renderer.domElement,x:(origin.x+1)/2,y:(1-origin.y)/2,span:half*2};}
 draw(g,actor,x,y,unit,t,preview=false){this.char.update(actor,t,preview);const px=unit*7.2*(preview?2.04:2.2),size=preview?640:Math.max(384,Math.min(1024,Math.ceil(px*Math.min(devicePixelRatio||1,1.5)/64)*64));const result=this.render({preview,size});const side=unit*7.2*result.span;g.drawImage(result.canvas,x-result.x*side,y-result.y*side,side,side);}
}

export async function createR10Bridge(){const gltf=await loadCharacter(),render=new CharacterRenderer(),world=new R10Character(gltf),preview=new R10Character(gltf);render.setCharacter(world);return {gltf,render,world,preview,draw(g,a,x,y,unit,t,isPreview=false){render.setCharacter(isPreview?preview:world);render.draw(g,a,x,y,unit,t,isPreview);},ready:true};}
