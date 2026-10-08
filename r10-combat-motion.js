import * as THREE from 'three';
import {advanceYaw} from './r12-rotation.js';

const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function motionPhase(a){
  let kind=a.kind,hit=a.hitAt,t=a.elapsed,d=a.duration;
  if(kind==='basic')kind=['basic','crescent','fire'][a.step-1];
  if(kind==='whirl'){kind='fire';t=(a.elapsed-.04)% .30;if(t<0)t=0;d=.30;hit=.20;}
  const impact=kind==='basic'?.78:kind==='crescent'?.35:.43;
  const lead=Math.max(.035,hit-.085),end=Math.min(d-.02,hit+.075);
  let p=t<lead?(impact-.12)*t/lead:t<end?impact-.12+(t-lead)/(end-lead)*.22:impact+.10+(1-impact-.10)*(t-end)/(d-end);
  if(a.turning)p=0;
  return {kind:['basic','crescent','fire'].includes(kind)?kind:'fire',p:clamp(p,0,.9999)};
}

export function installCombatMotion(bridge){
  const rig=bridge.world,update=rig.update.bind(rig);let lastSignature='';
  rig.update=function(actor,t,preview=false){
    const a=actor.action,signature=[t,actor.state,a?.serial,a?.elapsed,a?.turning,actor.x,actor.z,actor.visual?.weaponId,actor.visual?.armorId,actor.visual?.weaponEnhance,actor.visual?.armorEnhance].join('|');
    if(signature===lastSignature)return;
    lastSignature=signature;
    if(a&&actor.state!=='dead'){
      const phase=motionPhase(a);this.yaw=a.visualYaw??a.yaw;this.hurtUntil=0;
      update({...actor,yaw:this.yaw,hurt:0,action:{...a,kind:phase.kind,elapsed:phase.p,duration:1}},t,preview);
      if(a.kind==='basic'&&a.aimDown&&!a.turning){
        const envelope=clamp((a.elapsed-(a.hitAt-.18))/.11)*clamp((a.hitAt+.19-a.elapsed)/.12),arm=this.bones.RightArm;
        const axis=new THREE.Vector3(Math.cos(this.yaw),0,-Math.sin(this.yaw));
        const world=arm.getWorldQuaternion(new THREE.Quaternion()).premultiply(new THREE.Quaternion().setFromAxisAngle(axis,a.aimDown*envelope));
        arm.quaternion.copy(arm.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));arm.updateWorldMatrix(false,true);
        this.clearWeapon();this.root.updateMatrixWorld(true);
      }
    }else update(actor,t,preview);
  };
  return {
    turn(a,dt){a.visualYaw=advanceYaw(a.visualYaw,a.yaw,dt,true);a.turning=Math.abs(Math.atan2(Math.sin(a.yaw-a.visualYaw),Math.cos(a.yaw-a.visualYaw)))>.04;},
    sample(actor,t,groundHeight=0){rig.update(actor,t);rig.root.updateMatrixWorld(true);const world=v=>{const p=rig.sword.localToWorld(v);return [actor.x+p.x*7.2,groundHeight+p.y*7.2,actor.z+p.z*7.2];};return {a:world(new THREE.Vector3(0,rig.sword.userData.bladeStart??.17,0)),b:world(new THREE.Vector3(0,rig.sword.userData.bladeEnd??.89,0)),t,serial:actor.action?.serial,phase:actor.action?motionPhase(actor.action).p:0};},
    reset(){lastSignature='';rig.lastT=null;rig.yaw=null;rig.hurtUntil=0;},
    phase:motionPhase
  };
}

// Swept blade segments, sampled from the same posed rig that is drawn.
// Targets are vertical body cylinders, with no invisible full-circle melee hit.
export function bladeContact(previous,current,m,groundHeight=0){
  const radius=m.radius+(m.boss?1.35:.48),height=m.boss?8:m.type==='wolf'?3.15:m.type==='spider'?1.85:m.type==='skeleton'?3.6:4.6;
  let best=null;
  for(let i=0;i<=8;i++){
    const u=i/8,A=current.a.map((v,k)=>previous.a[k]+(v-previous.a[k])*u),B=current.b.map((v,k)=>previous.b[k]+(v-previous.b[k])*u);
    const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],l=dx*dx+dz*dz;
    // Clip the segment to the body's finite vertical slab first. The closest
    // horizontal point may be above its head while a later blade section
    // actually passes through the body. Radius and attack timing are unchanged.
    let low=0,high=1;
    if(Math.abs(dy)<1e-9){if(A[1]<groundHeight+.15||A[1]>groundHeight+height)continue;}
    else{const a=(groundHeight+.15-A[1])/dy,b=(groundHeight+height-A[1])/dy;low=Math.max(0,Math.min(a,b));high=Math.min(1,Math.max(a,b));if(low>high)continue;}
    const f=clamp(((m.x-A[0])*dx+(m.z-A[2])*dz)/(l||1),low,high);
    const p=A.map((v,k)=>v+(B[k]-v)*f),distance=Math.hypot(p[0]-m.x,p[2]-m.z);
    // The clipped interval already enforces height. Clamp roundoff at cap
    // intersections rather than rejecting an exact boundary such as .1499999999.
    p[1]=clamp(p[1],groundHeight+.15,groundHeight+height);
    if(distance<=radius&&(!best||distance<best.distance))best={point:p,distance,radius};
  }
  return best;
}

export function drawCombatFX(ctx,engine,trails,waves,effects,time,ground=()=>0){
  const project=p=>engine.project(...p),line=(points,color,width,blur)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();};
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineJoin='round';ctx.lineCap='round';
  for(let i=1;i<trails.length;i++){
    const a=trails[i-1],b=trails[i];if(a.serial!==b.serial||time-b.t>.13)continue;
    const fade=clamp(1-(time-b.t)/.13),A=project(a.a),B=project(a.b),C=project(b.b),D=project(b.a);
    ctx.globalAlpha=fade*.50;ctx.fillStyle='#ff4b16';ctx.shadowColor='#ff590d';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(...A.slice(0,2));ctx.lineTo(...B.slice(0,2));ctx.lineTo(...C.slice(0,2));ctx.lineTo(...D.slice(0,2));ctx.closePath();ctx.fill();
    ctx.globalAlpha=fade*.92;line([B,C],'#ffb134',4,8);line([B,C],'#fff8d6',1.5,3);
  }
  for(const w of waves){
    const pts=[],r=w.radius,half=w.kind==='whirl'?Math.PI:w.kind==='fire'?.87:1.55;
    for(let j=0;j<=36;j++){const a=w.yaw-half+2*half*j/36;const x=w.x+Math.sin(a)*r,z=w.z+Math.cos(a)*r;pts.push(project([x,ground(x,z)+.9,z]));}
    ctx.globalAlpha=clamp((w.range-r)/1.2)*.8;line(pts,w.kind==='crescent'?'#ef6714':'#f4430a',9,12);line(pts,'#ffb62c',4,6);line(pts,'#fff6db',1.4,2);
  }
  for(const e of effects){if(e.kind!=='contact')continue;const q=clamp(e.age/e.life),p=project([e.x,e.height||2.7,e.z]),r=(5+q*24)*(e.crit?1.2:1),blue=e.skill==='thunder'||e.skill==='guard';ctx.globalAlpha=(1-q)*(1-q);
    const g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r);g.addColorStop(0,'#fffce5');g.addColorStop(.16,blue?'#c4f4ff':'#ffeaba');g.addColorStop(.42,blue?'#379effaa':'#ff871aaf');g.addColorStop(1,'#ff330000');ctx.fillStyle=g;ctx.shadowBlur=0;ctx.fillRect(p[0]-r,p[1]-r,r*2,r*2);
    for(let j=0;j<7;j++){const a=j*2.399+e.serial*.3,dx=Math.cos(a),dy=Math.sin(a)*.65;line([[p[0]+dx*r*.35,p[1]+dy*r*.35],[p[0]+dx*r,p[1]+dy*r]],blue?'#b4efff':'#ffd16d',1.4,4);}
    ctx.globalAlpha=clamp(1-q*3);line([[p[0]-r*.40,p[1]+r*.55],[p[0]+r*.4,p[1]-r*.55]],'#fffdeb',2.8,6);
  }
  ctx.restore();
}
