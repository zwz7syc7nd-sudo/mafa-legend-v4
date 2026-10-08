// Public Lineage GIF frames, inspected 2026-10-08. See BOSS-SOURCES.txt.
// Original GIFs are unchanged; the atlases retain selected source frames losslessly.
// Source art is one viewing direction plus runtime mirror, not eight-view artwork.
import {runtimeMaterial} from './r12-death-knight.js';
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const queenFrames=[...seq(31,36),...seq(60,70),...seq(83,110),...seq(136,150)];
export const SPECIES=Object.freeze({
 ifrit:{name:'伊弗利特',sourceName:'Ifrit',file:1773,w:353,h:416,anchor:[185,298],body:200,height:6.2,
  atlasFrames:seq(0,52),idle:28,idleLoop:seq(28,34),walk:seq(17,27),hurt:seq(35,37),die:seq(38,52),deathFrameTime:.14,
  attack:seq(0,7),starts:[0,.14,.28,.42,.60,.77,.94,1.08],duration:1.20,hitAt:.42,impactFrame:3,
  cast:{frames:seq(8,16),starts:[0,.17,.34,.51,.68,.90,1.08,1.25,1.43],duration:1.60,hitAt:.90,impactFrame:13}},
 antQueen:{name:'巨蟻女皇',sourceName:'Giant Ant Queen',file:10899,w:512,h:370,anchor:[272,268],body:180,height:5.5,
  atlasFrames:queenFrames,idle:97,idleLoop:seq(97,110),walk:seq(89,96),hurt:seq(83,88),die:seq(136,150),deathFrameTime:.14,
  attack:seq(31,36),starts:[0,.18,.36,.54,.75,.93],duration:1.10,hitAt:.54,impactFrame:34,
  cast:{frames:seq(60,70),starts:[0,.15,.30,.45,.65,.80,.95,1.10,1.22,1.34,1.46],duration:1.60,hitAt:.65,impactFrame:64}}
});
const kindFor=m=>m.bossKind||m.visualKind||m.type;
const isSpecial=m=>m.action?.kind==='cast'||m.cast?.animation==='cast'||(m.cast?.key&&!['claw','basic'].includes(m.cast.key));
function clipFor(s,m){return isSpecial(m)?s.cast:{frames:s.attack,starts:s.starts,duration:s.duration,hitAt:s.hitAt,impactFrame:s.impactFrame};}
export function frameFor(m,t=0){const s=SPECIES[kindFor(m)];if(!s)return null;let frame=s.idle,phase='idle';
 if(m.state==='dead'){phase='die';frame=s.die[Math.min(s.die.length-1,Math.floor(Math.max(0,m.deathTime||0)/s.deathFrameTime))];}
 else if(m.action||m.cast){
  const clip=clipFor(s,m),a=m.cast||m.action;phase=isSpecial(m)?'cast':'attack';
  const age=Math.max(0,m.cast?.age??m.action?.elapsed??0),hit=m.cast?.windup??m.action?.hitAt??clip.hitAt,duration=m.cast?m.cast.windup+m.cast.life:(m.action?.duration??clip.duration);
  // Retiming preserves the inspected source impact frame at the gameplay hit event.
  const elapsed=age<hit?age/Math.max(.001,hit)*clip.hitAt:clip.hitAt+(age-hit)/Math.max(.001,duration-hit)*(clip.duration-clip.hitAt);
  let i=0;while(i+1<clip.starts.length&&elapsed+1e-8>=clip.starts[i+1])i++;frame=clip.frames[i];
 }else if(m.hurt>0){phase='hurt';frame=s.hurt[Math.min(s.hurt.length-1,Math.floor((.24-Math.min(.24,m.hurt))/.24*s.hurt.length))];}
 else if(m.moving){phase='walk';frame=s.walk[Math.floor(Math.abs(m.walk||t*5)/.62)%s.walk.length];}
 else frame=s.idleLoop[Math.floor(Math.max(0,t)*7)%s.idleLoop.length];
 return {frame,phase,species:s,atlasIndex:s.atlasFrames.indexOf(frame)};
}
export function actionFor(m,kind='basic'){const s=SPECIES[kindFor(m)];if(!s)throw Error('Missing original boss GIF: '+kindFor(m));const c=kind==='cast'?s.cast:s;return {kind,elapsed:0,duration:c.duration,hit:false,hitAt:c.hitAt};}
export async function createBossSprites(){const materials={};
 for(const kind of Object.keys(SPECIES)){const image=new Image();image.src='./boss-'+kind+'-atlas.png';await image.decode();materials[kind]=runtimeMaterial(image);}
 return {ready:true,species:SPECIES,materials,frameFor,actionFor,draw(ctx,m,x,y,unit,t=0){const f=frameFor(m,t);if(!f)return;const s=f.species,kind=kindFor(m),scale=Math.min(1,unit*s.height/s.body),yaw=m.cast?.yaw??m.action?.yaw??m.yaw??0,sx=Math.sin(yaw)*.8-Math.cos(yaw)*.6;ctx.save();ctx.translate(x,y);ctx.scale(sx<-.08?-scale:scale,scale);ctx.imageSmoothingEnabled=false;if(m.state==='dead')ctx.globalAlpha*=Math.max(0,Math.min(1,(3.2-(m.deathTime||0))/.65));ctx.drawImage(materials[kind],(f.atlasIndex%8)*s.w,Math.floor(f.atlasIndex/8)*s.h,s.w,s.h,-s.anchor[0],-s.anchor[1],s.w,s.h);ctx.restore();}};
}
