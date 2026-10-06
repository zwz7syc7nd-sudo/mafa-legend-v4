import * as THREE from 'three';

// Selective light spread from the actual equipment-emission render pass.
// Opaque black materials retain depth occlusion; the rest of the character and
// scene are never brightened. Accepted geometry, camera and animation stay intact.
export function installEquipmentBloom(bridge) {
  if(typeof bridge.draw!=='function'||!bridge.render)return;
  const draw=bridge.draw.bind(bridge);
  const black=new THREE.MeshBasicMaterial({color:0x000000,toneMapped:false});
  const hiddenSprite=new THREE.SpriteMaterial({transparent:true,opacity:0,depthWrite:false});
  bridge.draw=function(g,a,x,y,unit,t,preview=false){
    draw(g,a,x,y,unit,t,preview);
    const visual=a.visual||{},weapon=visual.hasWeapon===false?0:(visual.weapon||0),armor=visual.hasArmor===false?0:(visual.armor||0),tier=Math.max(weapon,armor);
    if(!tier){(preview?this.preview:this.world).root.userData.equipmentBloom={tier:0,rank:0,strength:0,radius:0,selective:true};return;}
    const rank=Math.max(weapon?visual.weaponEnhance||0:0,armor?visual.armorEnhance||0:0),r=this.render,char=preview?this.preview:this.world,swapped=[];
    char.root.traverse(o=>{if(!o.material||o.userData.equipmentBloom)return;swapped.push([o,o.material]);o.material=o.isSprite?hiddenSprite:black;});
    try{r.renderer.render(r.scene,r.camera);}finally{for(const [o,mat] of swapped)o.material=mat;}
    const half=preview?1.02:1.10,origin=new THREE.Vector3().project(r.camera),side=unit*7.2*half*2,left=x-(origin.x+1)/2*side,top=y-(1-origin.y)/2*side;
    const strength=[0,.18,.40,.66][tier],radius=Math.max(2.4,Math.min(8,side/80));
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=strength;g.filter='blur('+radius.toFixed(2)+'px)';g.drawImage(r.renderer.domElement,left,top,side,side);
    g.globalAlpha=strength*.42;g.filter='blur('+Math.max(1,radius*.32).toFixed(2)+'px)';g.drawImage(r.renderer.domElement,left,top,side,side);g.restore();
    char.root.userData.equipmentBloom={tier,rank,strength,radius,selective:true};
  };
}
