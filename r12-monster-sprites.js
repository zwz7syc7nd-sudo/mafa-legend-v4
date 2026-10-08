import {runtimeMaterial} from './r12-death-knight.js';
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
export const SPECIES=Object.freeze({
 skeleton:{name:'骷髏',file:30,w:204,h:210,anchor:[102,148],body:107,height:4.2,idle:27,walk:seq(23,29),hurt:seq(30,32),die:seq(33,38),attack:[19,20,21,22,27],starts:[0,.18,.40,.62,.80],duration:.92,hitAt:.40,impactFrame:21},
 orc:{name:'獸人',file:56,w:246,h:229,anchor:[129,148],body:90,height:3.8,idle:27,walk:seq(20,26),hurt:seq(28,33),die:seq(34,44),attack:[0,1,2,3,4,27],starts:[0,.12,.26,.40,.50,.72],duration:.96,hitAt:.50,impactFrame:4},
 wolf:{name:'狼',file:96,w:213,h:162,anchor:[112,118],body:79,height:3,idle:55,walk:seq(48,54),hurt:seq(71,73),die:seq(74,81),attack:[7,8,10,12,13,14,18,22,23],starts:[0,.10,.20,.30,.42,.52,.64,.74,.82],duration:.90,hitAt:.42,impactFrame:13},
 spider:{name:'巨蛛',file:1082,w:242,h:186,anchor:[122,148],body:67,height:2.5,idle:17,walk:seq(8,17),hurt:seq(18,20),die:seq(21,26),attack:[0,1,2,3,17],starts:[0,.20,.40,.60,.76],duration:.88,hitAt:.20,impactFrame:1},
 // R12.1: inspected source clips; GIF delays are not gameplay timing.
 elder:{name:'長者',file:32,w:261,h:257,anchor:[125,181],body:105,height:4.3,idle:0,walk:seq(35,41),hurt:seq(42,44),die:seq(45,51),attack:[4,5,6,7,0],starts:[0,.18,.34,.58,.84],duration:1.05,hitAt:.34,impactFrame:6,ranged:true,projectileKind:'magic'},
 scorpion:{name:'毒蠍',file:4060,w:371,h:278,anchor:[190,212],body:150,height:3.6,idle:16,walk:seq(8,17),hurt:seq(18,19),die:seq(20,26),attack:[0,1,2,3,16],starts:[0,.18,.40,.59,.78],duration:.98,hitAt:.40,impactFrame:2},
 banditLeader:{name:'強盜隊長',sourceName:'Bandit Leader',file:2417,w:224,h:211,anchor:[110,162],body:119,height:4.3,idle:26,walk:seq(15,25),hurt:seq(34,37),die:seq(38,46),attack:[0,1,2,3,4,5,6,26],starts:[0,.12,.26,.38,.50,.60,.70,.82],duration:1.0,hitAt:.50,impactFrame:4},
 crabman:{name:'蟹人',file:1610,w:294,h:192,anchor:[164,154],body:115,height:3.5,idle:22,walk:seq(14,21),hurt:seq(30,35),die:seq(36,41),attack:[0,1,2,3,4,5,6,7,8,22],starts:[0,.10,.18,.26,.38,.50,.60,.70,.80,.91],duration:1.05,hitAt:.50,impactFrame:5},
 darkElf:{name:'黑暗妖精',file:1125,w:337,h:224,anchor:[177,161],body:110,height:4.5,idle:34,walk:seq(27,33),hurt:seq(40,42),die:seq(43,50),attack:[19,20,21,22,23,24,25,26,34],starts:[0,.12,.23,.38,.50,.58,.67,.76,.88],duration:1.05,hitAt:.50,impactFrame:23,ranged:true,projectileKind:'arrow'}
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
