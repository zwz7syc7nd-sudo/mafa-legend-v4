(function(global){
 'use strict';
 const TAU=Math.PI*2,EPS=1e-9;
 const skills=Object.freeze({claw:Object.freeze({name:'首領攻擊',shape:'cone',halfAngle:.95,windup:.65,life:.45,radius:0,range:5.5,mul:1,pulses:[0]})});
 function segmentDistance(x,z,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)):0;return Math.hypot(x-ax-dx*t,z-az-dz*t);}
 function ends(c){return [c.ox??c.x,c.oz??c.z,c.ex??((c.ox??c.x)+Math.sin(c.yaw)*(c.range+(c.frontExtent||0))),c.ez??((c.oz??c.z)+Math.cos(c.yaw)*(c.range+(c.frontExtent||0)))];}
 function signedDistance(c,x,z){
  const dx=x-c.x,dz=z-c.z,r=Math.hypot(dx,dz);
  if(c.shape==='circle'||c.shape==='summon')return r-c.radius;
  if(c.shape==='line')return segmentDistance(x,z,...ends(c))-c.radius;
  if(c.shape==='cone'){
   const half=c.halfAngle??.8,a=Math.atan2(Math.sin(Math.atan2(dx,dz)-c.yaw),Math.cos(Math.atan2(dx,dz)-c.yaw));
   const left=[c.x+Math.sin(c.yaw-half)*c.range,c.z+Math.cos(c.yaw-half)*c.range],right=[c.x+Math.sin(c.yaw+half)*c.range,c.z+Math.cos(c.yaw+half)*c.range];
   const edge=Math.min(segmentDistance(x,z,c.x,c.z,...left),segmentDistance(x,z,c.x,c.z,...right));
   const arc=Math.abs(a)<=half?Math.abs(r-c.range):Math.min(Math.hypot(x-left[0],z-left[1]),Math.hypot(x-right[0],z-right[1]));
   return Math.min(edge,arc)*(r<=c.range&&Math.abs(a)<=half?-1:1);
  }
  return Infinity;
 }
 function contains(c,x,z,extra=0){return signedDistance(c,x,z)<=extra+EPS;}
 function boundary(c,segments=64){
  const points=[],add=(x,z,r,a)=>points.push([x+Math.sin(a)*r,z+Math.cos(a)*r]);
  if(c.shape==='line'){
   const [ax,az,bx,bz]=ends(c),yaw=Math.atan2(bx-ax,bz-az),n=Math.max(12,Math.ceil(segments/2));
   for(let i=0;i<=n;i++)add(bx,bz,c.radius,yaw-Math.PI/2+i*Math.PI/n);
   for(let i=0;i<=n;i++)add(ax,az,c.radius,yaw+Math.PI/2+i*Math.PI/n);
  }else{
   const cone=c.shape==='cone',start=cone?c.yaw-(c.halfAngle??.8):0,end=cone?c.yaw+(c.halfAngle??.8):TAU,r=cone?c.range:c.radius;
   if(cone)points.push([c.x,c.z]);for(let i=0;i<=segments;i++)add(c.x,c.z,r,start+(end-start)*i/segments);
  }
  return points;
 }
 function makeCast(actor,key,target){
  const d=skills[key];if(!d)return null;const yaw=Math.atan2(target.x-actor.x,target.z-actor.z);
  return {...d,key,age:0,fired:0,hit:false,yaw,x:actor.x+Math.sin(yaw)*(d.originOffset||0),z:actor.z+Math.cos(yaw)*(d.originOffset||0),ox:actor.x,oz:actor.z,windup:d.windup*(actor.enraged?.8:1),traveled:0};
 }
 function duePulses(c){const events=[];while(c.fired<c.pulses.length&&c.age+EPS>=c.windup+c.pulses[c.fired]){events.push({index:c.fired,time:c.windup+c.pulses[c.fired]});c.fired++;}return events;}
 function activeDuration(c,previousAge){return Math.max(0,Math.min(c.age,c.windup+c.life)-Math.max(previousAge,c.windup));}
 function sweep(c,from,to){return {...c,shape:'line',x:from[0],z:from[1],ox:from[0],oz:from[1],ex:to[0]+Math.sin(c.yaw)*(c.frontExtent||0),ez:to[1]+Math.cos(c.yaw)*(c.frontExtent||0)};}
 function phase(c){return c.age<c.windup-EPS?'windup':c.age<c.windup+c.life-EPS?'active':'recovery';}
 function drawGround(ctx,project,monsters,hero){
  ctx.save();ctx.lineJoin='round';
  const path=shape=>{ctx.beginPath();boundary(shape).forEach((v,i)=>{const p=project(v[0],.07,v[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();};
  for(const m of monsters){const c=m.cast;if(m.state==='dead'||!c||Math.hypot(m.x-hero.x,m.z-hero.z)>40)continue;
   const windup=phase(c)==='windup',progress=Math.max(0,Math.min(1,c.age/c.windup)),summon=c.key==='summon';
   path(c);ctx.fillStyle=summon?'rgba(122,40,210,.13)':windup?'rgba(222,30,10,'+(.08+progress*.16)+')':'rgba(140,30,8,.045)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=summon?'#ba86e2':windup?'#ff5635':'#a85028';ctx.stroke();
   if(windup){ctx.setLineDash([5,5]);ctx.lineDashOffset=-progress*24;ctx.strokeStyle='#ffdb9a';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);}
   else if(c.key==='charge'&&c.activeSweep){path(c.activeSweep);ctx.fillStyle='rgba(255,170,70,.30)';ctx.fill();ctx.strokeStyle='#ffe2ad';ctx.stroke();}
   else if(!summon){const since=c.age-c.windup,last=c.pulses.filter(p=>p<=since+EPS).at(-1);if(last!==undefined){const flash=Math.max(0,1-(since-last)/.16);if(flash>0){path(c);ctx.fillStyle='rgba(255,173,76,'+(flash*.32)+')';ctx.fill();ctx.strokeStyle='rgba(255,235,174,'+flash+')';ctx.stroke();}}}
  }
  ctx.restore();
 }
 global.R13BossCombat=Object.freeze({skills,segmentDistance,signedDistance,contains,boundary,makeCast,duePulses,activeDuration,sweep,phase,drawGround});
})(globalThis);
