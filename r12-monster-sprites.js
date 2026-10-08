import {runtimeMaterial} from './r12-death-knight.js';
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
export const SPECIES=Object.freeze({
 skeleton:{name:'骷髏',file:30,w:204,h:210,anchor:[102,148],body:107,height:4.2,idle:27,walk:seq(23,29),hurt:seq(30,32),die:seq(33,38),attack:[19,20,21,22,27],starts:[0,.18,.40,.62,.80],duration:.92,hitAt:.40,impactFrame:21},
 orc:{name:'獸人',file:56,w:246,h:229,anchor:[129,148],body:90,height:3.8,idle:27,walk:seq(20,26),hurt:seq(28,33),die:seq(34,44),attack:[0,1,2,3,4,27],starts:[0,.12,.26,.40,.50,.72],duration:.96,hitAt:.50,impactFrame:4},
 wolf:{name:'狼',file:96,w:213,h:162,anchor:[112,118],body:79,height:3,idle:55,walk:seq(48,54),hurt:seq(71,73),die:seq(74,81),attack:[7,8,10,12,13,14,18,22,23],starts:[0,.10,.20,.30,.42,.52,.64,.74,.82],duration:.90,hitAt:.42,impactFrame:13},
 spider:{name:'巨蛛',file:1082,w:242,h:186,anchor:[122,148],body:67,height:2.5,idle:17,walk:seq(8,17),hurt:seq(18,20),die:seq(21,26),attack:[0,1,2,3,17],starts:[0,.20,.40,.60,.76],duration:.88,hitAt:.20,impactFrame:1}
});
export function frameFor(m){const s=SPECIES[m.visualKind||m.type];if(!s)return null;let frame=s.idle,phase='idle';
 if(m.state==='dead'){phase='die';frame=s.die[Math.min(s.die.length-1,Math.floor((m.deathTime||0)/.12))];}
 else if(m.action){phase='attack';let i=0;while(i+1<s.starts.length&&m.action.elapsed+1e-8>=s.starts[i+1])i++;frame=s.attack[i];}
 else if(m.hurt>0){phase='hurt';frame=s.hurt[Math.min(s.hurt.length-1,Math.floor((.24-Math.min(.24,m.hurt))/.24*s.hurt.length))];}
 else if(m.moving){phase='walk';frame=s.walk[Math.floor(Math.abs(m.walk||0)/.62)%s.walk.length];}
 return {frame,phase,species:s};
}
export function actionFor(m){const s=SPECIES[m.visualKind||m.type];if(!s)throw Error('Missing original monster GIF: '+m.visualKind);return {kind:'basic',elapsed:0,duration:s.duration,hit:false,hitAt:s.hitAt};}
export async function createMonsterSprites(){const materials={};for(const kind of Object.keys(SPECIES)){const image=new Image();image.src='./monster-'+kind+'-atlas.png';await image.decode();materials[kind]=runtimeMaterial(image);}
 return {ready:true,species:SPECIES,materials,frameFor,actionFor,draw(ctx,m,x,y,unit){const f=frameFor(m);if(!f)return;const s=f.species,kind=m.visualKind||m.type,scale=Math.min(1,unit*s.height/s.body),sx=Math.sin(m.yaw||0)*.8-Math.cos(m.yaw||0)*.6;ctx.save();ctx.translate(x,y);ctx.scale(sx<-.08?-scale:scale,scale);ctx.imageSmoothingEnabled=false;if(m.state==='dead')ctx.globalAlpha*=Math.max(0,Math.min(1,(2.3-(m.deathTime||0))/.6));ctx.drawImage(materials[kind],(f.frame%8)*s.w,Math.floor(f.frame/8)*s.h,s.w,s.h,-s.anchor[0],-s.anchor[1],s.w,s.h);ctx.restore();}};
}
