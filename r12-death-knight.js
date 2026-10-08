// Original 240.gif pixels: fixed character. This runtime material only discards
// the GIF's neutral gray background/fringe band; neither the GIF nor atlas is rewritten.
export const CLIPS=Object.freeze({attack:[0,1,2,3,4],cast:[5,6,7,8,9,10],walk:[27,28,29,30,31,32,33],hurt:[34,35,36,37,38],die:[39,40,41,42,43,44,45,46]});
// User-matched original reference: zero-based frame 38 (the 39th frame).
// Inspected 34–38 show the low sword-ready stance; frame 4 was attack recovery.
export const IDLE_FRAME=38;
export const BLADE=Object.freeze({1:[[179,88],[212,103]],2:[[201,161],[201,190]],3:[[199,159],[199,187]],20:[[90,95],[56,112]],27:[[116,108],[158,134]]});
export const TUNING=Object.freeze({duration:.62,hitAt:.31,frameStarts:[0,.155,.31,.40,.49],reach:3.15,bladeRadius:.34});
const W=273,H=219,AX=140,AY=164;
export function attackFrame(elapsed){let f=0;for(let i=1;i<5;i++)if(elapsed+1e-8>=TUNING.frameStarts[i])f=i;return f;}
export function frameFor(actor,t=0){
 if(actor.state==='dead')return CLIPS.die[Math.min(7,Math.floor((actor.deathTime||0)/.13))];
 if(actor.action){const a=actor.action;if(a.kind==='basic')return attackFrame(a.turning?0:a.elapsed);return CLIPS.cast[Math.min(5,Math.floor((a.elapsed/a.duration)*6))];}
 if(actor.hurt>0)return CLIPS.hurt[Math.min(4,Math.floor((.22-actor.hurt)/.044))];
 if(actor.moving)return CLIPS.walk[Math.floor(Math.abs(actor.walk||t*8)/.8)%7];
 return IDLE_FRAME;
}
export function drawGold(ctx,frame){const p=BLADE[frame];if(!p)return;ctx.save();ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...p[0]);ctx.lineTo(...p[1]);ctx.globalAlpha*=.62;ctx.strokeStyle='#edba47';ctx.lineWidth=1.7;ctx.shadowColor='#ffc346';ctx.shadowBlur=4;ctx.stroke();ctx.globalAlpha=.70;ctx.strokeStyle='#ffe5a2';ctx.lineWidth=.65;ctx.shadowBlur=1.5;ctx.stroke();ctx.restore();}
export function runtimeMaterial(image){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
 const gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('此裝置無法啟用角色貼圖遮罩');
 const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p; varying vec2 uv; void main(){uv=(p+1.0)*0.5;uv.y=1.0-uv.y;gl_Position=vec4(p,0.0,1.0);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec2 uv; uniform sampler2D atlas; void main(){vec4 c=texture2D(atlas,uv);float lo=min(c.r,min(c.g,c.b)),hi=max(c.r,max(c.g,c.b));if(lo>0.725&&hi<0.812&&hi-lo<0.014)discard;gl_FragColor=c;}'));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
 // A canvas copy frees the temporary WebGL context; original asset stays intact.
 const out=document.createElement('canvas');out.width=c.width;out.height=c.height;out.getContext('2d').drawImage(c,0,0);gl.getExtension('WEBGL_lose_context')?.loseContext();return out;
}
export async function createDeathKnightBridge(){
 const atlas=new Image();atlas.src='./death-knight-original-atlas.png';await atlas.decode();const material=runtimeMaterial(atlas);
 const bridge={ready:true,world:{yaw:null},glow:false,atlas,material,frameFor,attackFrame,clips:CLIPS,blade:BLADE,
  drawFrame(ctx,frame,x,y,{mirror=false,glow=bridge.glow,scale=1,raw=false}={}){ctx.save();ctx.translate(x,y);ctx.scale(mirror?-scale:scale,scale);ctx.imageSmoothingEnabled=false;ctx.translate(-AX,-AY);ctx.drawImage(raw?atlas:material,(frame%8)*W,Math.floor(frame/8)*H,W,H,0,0,W,H);if(glow)drawGold(ctx,frame);ctx.restore();},
  draw(ctx,actor,x,y,unit,t,preview=false){bridge.world.yaw=actor.action?.visualYaw??actor.yaw;const sx=Math.sin(bridge.world.yaw||0)*.8-Math.cos(bridge.world.yaw||0)*.6;bridge.drawFrame(ctx,frameFor(actor,t),x,y,{mirror:sx<-.08,scale:Math.min(1,unit*4.9/125)});},
  portrait(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#16191f';g.fillRect(0,0,128,128);g.imageSmoothingEnabled=false;g.drawImage(material,4*W+109,46,46,50,12,8,104,113);return c;}
 };return bridge;
}
export function installSpriteMotion(bridge){return {
 turn(a){a.visualYaw=a.yaw;a.turning=false;bridge.world.yaw=a.yaw;},
 sample(actor,t,groundHeight=0){const yaw=actor.action?.yaw??actor.yaw,dx=Math.sin(yaw),dz=Math.cos(yaw);return {a:[actor.x+dx*.5,groundHeight+2.7,actor.z+dz*.5],b:[actor.x+dx*TUNING.reach,groundHeight+.35,actor.z+dz*TUNING.reach],t,serial:actor.action?.serial,frame:frameFor(actor,t),phase:actor.action?.elapsed||0};},
 reset(){bridge.world.yaw=null;},phase:a=>({kind:a.kind,p:a.elapsed/a.duration})
};}
// A single directional ground capsule, evaluated only when original frame 2
// starts. Left/right source art is intentionally not claimed as eight-view art.
export function basicContact(actor,target){
 const a=actor.action,yaw=a?.yaw??actor.yaw,dx=target.x-actor.x,dz=target.z-actor.z,forward=dx*Math.sin(yaw)+dz*Math.cos(yaw),side=Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw)),radius=target.radius+TUNING.bladeRadius;
 if(forward<0||forward>TUNING.reach+radius||side>radius)return null;
 return {point:[target.x,.8,target.z],distance:Math.hypot(dx,dz),radius,source:'original-overhead-frame-2',frame:2};
}
