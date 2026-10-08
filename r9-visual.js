/* R9.3 / 2.5D layered painted render path. No screenshot is a playable scene.
 * Simulation, paths and hit tests remain in the original R9.1 engine.
 */
const R9Props=[];
const R9Art={images:{},rig:{},tints:new Map(),poseSignatures:{},ready:false};
async function r9LoadArt(){
 const json=window.R9_RIG||await (await fetch('./art-rig.json?v=R9.4.0-six')).json();R9Art.rig=json;
 const names=[...Object.keys(json).map(n=>n+'.png'),'prop-pillar.png','terrain-ash.jpg','terrain-stone.jpg','terrain-basalt.jpg','terrain-forest.jpg','r11-grass-albedo.png','terrain-water.jpg','hero-portrait.png'];
 await Promise.all(names.map(n=>new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{R9Art.images[n]=im;resolve();};im.onerror=()=>reject(new Error('素材載入失敗：'+n+'。請確認整包上傳，不是只換 index.html。'));im.src=window.R8_ASSETS?.[n]||'./'+n+'?v=R9.4.0-six';})));
 for(let tier=0;tier<4;tier++)for(const [name,im] of Object.entries(R9Art.images)){if(!name.startsWith('hero-')||name.includes('portrait'))continue;const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.filter=tier===0?'saturate(.12) brightness(.75)':tier===1?'hue-rotate(163deg) saturate(.60) brightness(1.08)':tier===2?'hue-rotate(267deg) saturate(.85)':'none';g.drawImage(im,0,0);R9Art.tints.set(name+':'+tier,c);}
 R9Art.ready=true;
}
function r9Piece(g,name,tier=3){const p=R9Art.rig[name];if(!p)return;g.drawImage(R9Art.tints.get(name+'.png:'+tier)||R9Art.images[name+'.png'],p.x,p.y,p.w,p.h);}
function r9Joint(g,x,y,a,fn){g.save();g.translate(x,y);g.rotate(a);g.translate(-x,-y);fn();g.restore();}
function r9Human(g,a,x,y,unit,t,preview=false){
 if(!a.npc&&window.R10?.ready){window.R10.draw(g,a,x,y,unit,t,preview);return;}
 const npc=a.npc===true, tier=npc?0:(a.visual?.armor??3),wep=npc?0:(a.visual?.weapon??3),dead=a.state==='dead',fall=Math.min(1,(a.deathTime||0)/.65);
 const k=unit*(npc?4.45:5.05)/380,phase=a.walk||0,walk=a.moving?Math.sin(phase):0,pace=a.moving?Math.cos(phase):0;
 const act=a.action,progress=act?Math.min(1,(act.elapsed||0)/(act.duration||.6)):0;
 const attack=act?(progress<.30?-progress/.30*.62:progress<.62?-.62+(progress-.30)/.32*2.08:1.46*(1-progress)/.38):0;
 const type=act?.kind||act?.skill||'basic',thrust=act?Math.sin(progress*Math.PI):0;
 const sx=Math.sin(a.yaw||0)*.8-Math.cos(a.yaw||0)*.6,sz=Math.sin(a.yaw||0)*.6+Math.cos(a.yaw||0)*.8;
 const angle=Math.atan2(sx,sz),sector=(Math.round(angle/(Math.PI/4))+8)%8,face=sx<-.06?-1:1,back=sz<-.28;
 const side=Math.abs(sx)>.7,width=side?.86:1;
 g.save();g.globalAlpha*=dead?Math.max(0,1-(a.deathTime||0)/2.3):1;g.translate(x,y);g.scale(k*face*width,k);
 if(dead){g.translate(fall*65,0);g.rotate(fall*1.45);}
 g.translate(-550,-597);
 const actorKey=a.npc?'npc:'+a.name:(a.id??0);const rec=(name,px,py)=>{const m=g.getTransform();R9Art.poseSignatures[actorKey+':'+name]=[m.a*px+m.c*py+m.e,m.b*px+m.d*py+m.f];};
 const piece=(name,look=tier)=>r9Piece(g,'hero-'+name,look);
 const armPiece=(left,lower)=>{const name='hero-'+(left?'left':'right')+'-arm',p=R9Art.rig[name],im=R9Art.tints.get(name+'.png:'+tier)||R9Art.images[name+'.png'],split=.49;
  const y0=lower?split:0,y1=lower?1:split+.08;g.drawImage(im,0,im.height*y0,im.width,im.height*(y1-y0),p.x,p.y+p.h*y0,p.w,p.h*(y1-y0));};
 if(tier>=2&&!dead){g.save();g.globalAlpha=.9;g.translate(550,336);for(const side of[-1,1]){g.save();g.scale(side,1);g.rotate(-.20+Math.sin(t*2.5+side*.5)*.065+walk*.025);const wing=R9Art.tints.get('hero-wing.png:'+tier)||R9Art.images['hero-wing.png'];g.drawImage(wing,30,-139,tier===3?182:116,tier===3?181:126);g.restore();}g.restore();}
 const cape=Math.sin(t*2.4)*.025+walk*.085+thrust*.045;
 r9Joint(g,501,355,cape+fall*.3,()=>piece('cape-left'));r9Joint(g,626,355,-cape-fall*.3,()=>piece('cape-right'));
 const leg=left=>{const n=left?'left':'right',sgn=left?1:-1,hip=left?[528,438]:[580,438],knee=left?[512,517]:[615,513],ankle=left?[499,568]:[621,571];
  const upper=walk*.28*sgn+thrust*.045*sgn+fall*sgn*.32,lower=Math.max(0,-walk*sgn)*.52+fall*.45;
  r9Joint(g,...hip,upper,()=>{piece(n+'-thigh');r9Joint(g,...knee,lower,()=>{piece(n+'-shin');r9Joint(g,...ankle,-upper*.45-lower*.65,()=>{piece(n+'-boot');rec(n+'Foot',ankle[0],ankle[1]);});});});};
 if(face<0){leg(true);leg(false);}else{leg(false);leg(true);}
 r9Joint(g,551,419,walk*.04+thrust*.07,()=>piece('skirt'));
 r9Joint(g,554,414,-thrust*.10+walk*.012,()=>{
  piece('torso');
  const shoulder=(left)=>{const n=left?'left':'right',p=left?[486,350]:[619,351],el=left?[473,376]:[625,391];const rot=left?attack+walk*.18:-walk*.23-thrust*.30;
   r9Joint(g,...p,rot,()=>{armPiece(left,false);r9Joint(g,...el,left?thrust*.24:thrust*.35,()=>{
    if(left){g.save();g.translate(458,392);g.scale(.66+wep*.125,.67+wep*.145);g.translate(-458,-392);piece('sword',wep);rec('swordTip',406,74);g.restore();}
    armPiece(left,true);rec(n+'Hand',left?459:630,left?395:435);
   });});};
  shoulder(false);shoulder(true);
  const pa=(left)=>{const p=left?[502,338]:[605,333];r9Joint(g,...p,(left?-1:1)*thrust*.085,()=>{g.save();g.translate(...p);g.scale(.74+tier*.086,.73+tier*.09);g.translate(-p[0],-p[1]);piece((left?'left':'right')+'-shoulder');g.restore();});};pa(true);pa(false);
  r9Joint(g,551,316,walk*.02+thrust*.08,()=>{piece('head');rec('head',551,295);});
  if(back){g.save();g.translate(550,340);g.scale(.85,1.11);g.translate(-550,-340);piece('cape-right');piece('cape-left');g.restore();}
 });
 R9Art.poseSignatures[actorKey]=[walk,attack,sector,tier,wep,dead?fall:0];g.restore();
 if(tier>=2&&!dead&&!npc){g.save();g.globalCompositeOperation='screen';g.globalAlpha=preview?.44:.20;g.strokeStyle=tier===3?'#ffa630':'#b977ff';g.lineWidth=1.2;g.beginPath();g.ellipse(x,y+2,unit*1.24,unit*.37,0,0,7);g.stroke();for(let i=0;i<(preview?12:7);i++){let q=(t*.3+i*.173)%1;g.globalAlpha=Math.sin(q*Math.PI)*.65;g.fillStyle=i%3?'#ffda7f':'#a878ff';g.fillRect(x+Math.sin(i*2.4+t)*unit*.8,y-q*unit*4.7,1.4,2.8);}g.restore();}
}

function r9Demon(g,m,x,y,S,t){
 const type=m.type||'wolf',dead=m.state==='dead',fade=dead?Math.max(0,1-(m.deathTime||0)/2.3):1;
 const scale={wolf:3.0,skeleton:3.5,ogre:4.6}[type]||3.2,k=S*scale/360,walk=m.moving?Math.sin(m.walk):0;
 const q=m.action?Math.min(1,m.action.elapsed/(m.action.duration||.8)):0,atk=Math.sin(q*Math.PI),turn=Math.sin(m.yaw||0)*.8-Math.cos(m.yaw||0)*.6;
 g.save();g.globalAlpha*=fade;g.translate(x,y);g.scale(k*(turn<0?-1:1),k);if(dead)g.rotate(Math.min(1,m.deathTime/.6)*1.48);g.translate(-512,-815);
 const piece=n=>{const name='demon-'+n,reg=R9Art.rig[name];let cache=R9Art.tints.get(name+':'+type);if(!cache){const im=R9Art.images[name+'.png'];cache=document.createElement('canvas');cache.width=im.width;cache.height=im.height;const c=cache.getContext('2d');c.filter=type==='skeleton'?'saturate(.15) brightness(1.35)':type==='ogre'?'hue-rotate(185deg) saturate(.65) brightness(1.12)':'saturate(.82)';c.drawImage(im,0,0);R9Art.tints.set(name+':'+type,cache);}g.drawImage(cache,reg.x,reg.y,reg.w,reg.h);};
 r9Joint(g,470,641,walk*.26,()=>piece('left-leg'));r9Joint(g,515,651,-walk*.25,()=>piece('right-leg'));
 r9Joint(g,500,643,-atk*.15,()=>{piece('torso');r9Joint(g,435,557,walk*.15+atk*.2,()=>piece('left-arm'));r9Joint(g,530,583,-walk*.18-atk*.82,()=>piece('right-arm'));r9Joint(g,528,550,Math.sin(t*2)*.018+atk*.1,()=>piece('head'));});
 R9Art.poseSignatures['m'+m.id]=[walk,atk,turn,type,dead?m.deathTime:0];g.restore();
 if(m.hurt>0){g.save();g.globalCompositeOperation='screen';g.globalAlpha=Math.min(.5,m.hurt*2);g.fillStyle='#ffae52';g.beginPath();g.ellipse(x,y-S*1.7,S*.64,S*1.4,0,0,7);g.fill();g.restore();}
}

function r9Spider(g,m,x,y,S,t){
 g.save();g.translate(x,y);if(m.state==='dead')g.globalAlpha*=Math.max(0,1-m.deathTime/2.3);
 const phase=m.walk||t*6;
 for(let side of [-1,1])for(let i=0;i<4;i++){
  const a=(i-1.5)*.48,move=m.moving?Math.sin(phase+i*1.9)*.18:0;
  const pts=[[side*S*.38,-S*.55+i*S*.12],[side*S*(.7+i*.13),-S*(1.05-i*.25+move)],[side*S*(1.15+i*.12),S*(i*.15-.45+move)]];
  g.beginPath();pts.forEach((p,j)=>j?g.lineTo(...p):g.moveTo(...p));g.strokeStyle='#17110e';g.lineWidth=6;g.stroke();g.strokeStyle='#987055';g.lineWidth=2;g.stroke();
 }
 g.drawImage(R9Art.images['demon-torso.png'],-S*.58,-S*1.25,S*1.16,S*1.4);g.drawImage(R9Art.images['demon-head.png'],-S*.42,-S*.12,S*.84,S*.62);
 g.globalCompositeOperation='screen';g.fillStyle='#fb4d1c';g.beginPath();g.arc(-S*.12,-S*.07,2,0,7);g.arc(S*.12,-S*.07,2,0,7);g.fill();g.restore();
}
function r9LineageBoss(g,m,x,y,S,t){window.R13BossSprites.draw(g,m,x,y,S,t);}
class R9PaintedEngine{
 constructor(canvas){this.canvas=canvas;this.g=canvas.getContext('2d',{alpha:false});if(!this.g)throw new Error('裝置無法建立 Canvas 2D');this.w=innerWidth;this.h=innerHeight;this.S=25;this.cx=0;this.cz=63;this.draws=0;this.tris=0;this.chunks=new Map();this.props=R9Props;}
 batch(v){return {count:v.length};}
 setup(cam,zoom){this.w=innerWidth;this.h=innerHeight;this.S=this.h/zoom;this.cx=cam.x;this.cz=cam.z;let d=Math.min(devicePixelRatio||1,1.5);if(this.canvas.width!==Math.round(this.w*d)||this.canvas.height!==Math.round(this.h*d)){this.canvas.width=Math.round(this.w*d);this.canvas.height=Math.round(this.h*d);}this.g.setTransform(d,0,0,d,0,0);this.draws=0;}
 project(x,y,z){const dx=x-this.cx,dz=z-this.cz,S=this.S;return[this.w*.5+(.8*dx-.6*dz)*S,this.h*.51+(.424264*dx+.565685*dz-.707107*y)*S,0];}
 screenGround(x,y){const a=(x-this.w*.5)/this.S,b=(y-this.h*.51)/this.S;return [this.cx+.8*a+.848529*b,this.cz-.6*a+1.131371*b];}
 chunk(ix,iz){
  const key=ix+','+iz;if(this.chunks.has(key))return this.chunks.get(key);
  const size=384,U=size/16,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
  if(!this.grassPixels){const q=document.createElement('canvas');q.width=q.height=1024;const ctx=q.getContext('2d',{willReadFrequently:true});ctx.drawImage(R9Art.images['r11-grass-albedo.png'],0,0,1024,1024);this.grassPixels=ctx.getImageData(0,0,1024,1024).data;}
  const src=this.grassPixels,data=g.createImageData(size,size),out=data.data;
  const hash=(x,z)=>{let n=Math.imul(x,374761393)^Math.imul(z,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const noise=(x,z,scale)=>{x/=scale;z/=scale;const a=Math.floor(x),b=Math.floor(z);let u=x-a,v=z-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return (hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;};
  const mirror=x=>{x=((x%2048)+2048)%2048;return Math.min(1023,Math.floor(x<1024?x:2047-x));};
  for(let z=0;z<size;z++)for(let x=0;x<size;x++){
   const wx=ix*16+x/U,wz=iz*16+z/U,k=(z*size+x)*4,t=(mirror(wz*32)*1024+mirror(wx*32))*4;
   const broad=noise(wx+70,wz-20,9),fine=noise(wx,wz,1.7),variation=.78+broad*.42+(fine-.5)*.16;
   const soil=Math.max(0,(noise(wx-9,wz+44,6.8)-.48)*1.6),w=R11Regions.groundWeights(wx,wz);
   const r=src[t]*.83*variation,gr=src[t+1]*.91*variation,bl=(src[t+2]*.95+14)*variation;
   out[k]=w.grass*(r*(1-soil)+104*soil)+w.sand*(158+(r-75)*.32)+w.rock*(86+(r-75)*.4);
   out[k+1]=w.grass*(gr*(1-soil)+87*soil)+w.sand*(137+(gr-85)*.27)+w.rock*(87+(gr-85)*.34);
   out[k+2]=w.grass*(bl*(1-soil)+52*soil)+w.sand*(95+(bl-40)*.32)+w.rock*(74+(bl-40)*.4);out[k+3]=255;
  }g.putImageData(data,0,0);this.chunks.set(key,c);if(this.chunks.size>64)this.chunks.delete(this.chunks.keys().next().value);return c;
 }
 terrain(){
  const g=this.g;g.fillStyle='#18221b';g.fillRect(0,0,this.w,this.h);
  const edge=MAP_EDGE,outline=[[-edge,-edge],[edge,-edge],[edge,edge],[-edge,edge]].map(([x,z])=>this.project(x,0,z));
  const boundary=()=>{g.beginPath();outline.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};
  g.save();boundary();g.clip();
  const r=this.h/this.S*2+this.w/this.S;
  const a=Math.max(-7,Math.floor((this.cx-r)/16)),b=Math.min(6,Math.ceil((this.cx+r)/16)),c=Math.max(-7,Math.floor((this.cz-r)/16)),d=Math.min(6,Math.ceil((this.cz+r)/16));
  for(let iz=c;iz<=d;iz++)for(let ix=a;ix<=b;ix++){
   const p=this.project(ix*16,0,iz*16),q=this.project(ix*16+16,0,iz*16),v=this.project(ix*16,0,iz*16+16),fourth=[q[0]+v[0]-p[0],q[1]+v[1]-p[1]],xs=[p[0],q[0],v[0],fourth[0]],ys=[p[1],q[1],v[1],fourth[1]];
   if(Math.max(...xs)<-2||Math.min(...xs)>this.w+2||Math.max(...ys)<-2||Math.min(...ys)>this.h+2)continue;
   g.save();g.transform((q[0]-p[0])/384,(q[1]-p[1])/384,(v[0]-p[0])/384,(v[1]-p[1])/384,p[0],p[1]);g.drawImage(this.chunk(ix,iz),-.5,-.5,385,385);g.restore();this.draws++;
  }
  g.restore();boundary();g.strokeStyle='#aab48b';g.lineWidth=2;g.stroke();
 }
  shadow(x,y,w,h){if(window.R9_SHADOWS===false)return;const g=this.g;g.save();g.fillStyle='#08030170';g.beginPath();g.ellipse(x,y,w,h,-.15,0,7);g.fill();g.restore();}
 prop(p,t){const g=this.g,S=this.S,P=this.project(p.x,ground(p.x,p.z),p.z),x=P[0],y=P[1],s=p.s||1;
 if(x< -160||x>this.w+160||y< -60||y>this.h+250)return;
 this.shadow(x+S*.6,y,S*s,S*s*.28);
 if(p.kind==='pillar'||p.kind==='tower'||p.kind==='torch'){const h=S*(p.kind==='torch'?2.5:p.h||4.8),w=h*.64;g.drawImage(R9Art.images['prop-pillar.png'],x-w/2,y-h,w,h);if(p.kind==='torch'||p.kind==='tower')this.flame(x,y-h+S*.5,S*.7,t+p.x);return;}
 if(p.kind==='house'){const w=S*(p.w||8),h=S*5;g.save();g.translate(x,y);const tex=g.createPattern(R9Art.images['terrain-stone.jpg'],'repeat');g.fillStyle=tex;g.strokeStyle='#21190f';g.lineWidth=4;
 g.beginPath();g.moveTo(-w*.43,0);g.lineTo(-w*.43,-h*.63);g.lineTo(w*.07,-h);g.lineTo(w*.46,-h*.6);g.lineTo(w*.46,-h*.11);g.lineTo(0,h*.16);g.closePath();g.fill();g.stroke();
 g.fillStyle='#0f0b09';g.beginPath();g.moveTo(-w*.53,-h*.63);g.lineTo(-w*.05,-h*1.26);g.lineTo(w*.48,-h*.63);g.lineTo(w*.07,-h*.28);g.closePath();g.fill();g.stroke();
 for(let i=0;i<13;i++){g.strokeStyle=i%2?'#837358':'#322b22';g.lineWidth=2;g.beginPath();g.moveTo(-w*.51+i*w*.071,-h*.64);g.lineTo(-w*.045,-h*1.23);g.stroke();}
 g.fillStyle='#120b07';g.fillRect(-w*.18,-h*.44,w*.17,h*.48);g.fillStyle='#fc993e';g.shadowBlur=8;g.shadowColor='#ff6126';for(let q of [-.3,.2]){g.fillRect(w*q,-h*.53,w*.075,h*.14);}g.restore();return;}
 if(p.kind==='tree'){const salt=Math.sin(p.x*2.3+p.z*.7);g.save();g.translate(x,y);g.scale(S*s/25,S*s/25);g.rotate(salt*.13);g.lineCap='round';const branch=(pts,width)=>{g.strokeStyle='#1f160f';g.lineWidth=width+2;g.beginPath();pts.forEach((P,i)=>i?g.lineTo(...P):g.moveTo(...P));g.stroke();g.strokeStyle='#715740';g.lineWidth=width;g.stroke();g.strokeStyle='#b29162';g.lineWidth=Math.max(1,width*.15);g.stroke();};
 branch([[0,2],[-4,-28],[3,-58],[-1,-93],[6,-137]],9);for(let i=0;i<7;i++){let side=i%2?1:-1,h=40+i*13;branch([[0,-h],[side*(18+i),-h-12],[side*(26+i*2),-h-42],[side*(19+i*2),-h-59]],5-i*.5);branch([[side*(18+i),-h-12],[side*(38+i),-h-19],[side*43,-h-36]],2);}g.restore();return;}
 if(p.kind==='wall'){
 const w=p.w||.7,d=p.d||.7,H=1.9;const pts=[[-w,-d],[w,-d],[w,d],[-w,d]];const poly=(arr,tint)=>{g.beginPath();arr.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fillStyle=g.createPattern(R9Art.images['terrain-stone.jpg'],'repeat');g.fill();g.save();g.clip();g.fillStyle=tint;g.fillRect(0,0,this.w,this.h);g.restore();g.strokeStyle='#322416';g.lineWidth=1.5;g.stroke();};
 const bot=pts.map(q=>this.project(p.x+q[0],0,p.z+q[1])),top=pts.map(q=>this.project(p.x+q[0],H,p.z+q[1]));
 poly([bot[1],bot[2],top[2],top[1]],'#10090055');poly([bot[2],bot[3],top[3],top[2]],'#45210b22');poly(top,'#c49d4833');
 const alongX=w>d,len=alongX?w*2:d*2;for(let v=-len/2;v<len/2;v+=1.35){let q=this.project(p.x+(alongX?v:0),H,p.z+(alongX?0:v));g.fillStyle='#67503a';g.strokeStyle='#2b1d10';g.fillRect(q[0]-S*.20,q[1]-S*.26,S*.42,S*.28);g.strokeRect(q[0]-S*.2,q[1]-S*.26,S*.42,S*.28);}return;
 }

 // Weathered rock prop: irregular silhouette + textured face + fine strata.
 g.save();g.translate(x,y);g.scale(S*s/30,S*s/30);g.beginPath();g.moveTo(-33,0);g.lineTo(-38,-17);g.lineTo(-25,-47);g.lineTo(-2,-65);g.lineTo(21,-57);g.lineTo(38,-24);g.lineTo(30,3);g.lineTo(-5,12);g.closePath();g.fillStyle=g.createPattern(R9Art.images['terrain-basalt.jpg'],'repeat');g.fill();g.strokeStyle='#706254';g.lineWidth=2;g.stroke();g.strokeStyle='#211b15';g.lineWidth=2;for(let i=0;i<6;i++){g.beginPath();g.moveTo(-27,-8-i*7);g.lineTo(0,-4-i*8);g.lineTo(24,-14-i*5);g.stroke();}g.restore();}
 flame(x,y,r,t){const g=this.g;g.save();g.globalCompositeOperation='screen';let glow=g.createRadialGradient(x,y,0,x,y,r*2.4);glow.addColorStop(0,'#ff97173b');glow.addColorStop(1,'#ff410000');g.fillStyle=glow;g.fillRect(x-r*2.4,y-r*3,r*4.8,r*5);
 for(let i=0;i<5;i++){let tipX=x+Math.sin(t*7+i)*r*.26,tipY=y-r*(.9+.30*Math.sin(t*9+i));g.globalAlpha=.5;g.fillStyle=i>2?'#ffde66':'#ff5a13';const w=r*(.33-i*.036);g.beginPath();g.moveTo(x,y+r*.26);g.bezierCurveTo(x-w,y+r*.15,x-w*1.4,y-r*.38,tipX,tipY);g.bezierCurveTo(tipX-r*.10,tipY+r*.46,x+w*1.7,y-r*.16,x,y+r*.26);g.fill();}
 g.restore();}
 drawWorld(hero,monsters,npcs,drops,cam,zoom,t){this.setup(cam,zoom);this.terrain();R13BossCombat.drawGround(this.g,this.project.bind(this),monsters,hero);const g=this.g,S=this.S;const draw=[];for(const p of this.props){let P=this.project(p.x,0,p.z);if(P[0]>-S*14&&P[0]<this.w+S*14&&P[1]>-S*10&&P[1]<this.h+S*14)draw.push({depth:P[1],p});}
 const visible=monsters.filter(m=>Math.hypot(m.x-hero.x,m.z-hero.z)<45&&(m.state!=='dead'||m.deathTime<(m.boss?4:2.3)));
 for(const a of [hero,...visible,...npcs.filter(n=>Math.hypot(n.x-hero.x,n.z-hero.z)<38)]){const P=this.project(a.x,ground(a.x,a.z),a.z);draw.push({depth:P[1],a,P});}
 for(const d of drops){if(Math.hypot(d.x-hero.x,d.z-hero.z)>32)continue;let P=this.project(d.x,0,d.z);this.shadow(P[0],P[1],S*.35,S*.16);g.save();g.translate(...P.slice(0,2));g.fillStyle='#ffe096';g.shadowBlur=12;g.shadowColor='#ff8833';g.rotate(Math.PI/4);g.fillRect(-5,-5,10,10);g.restore();g.save();g.globalCompositeOperation='screen';const gr=g.createLinearGradient(P[0],P[1],P[0],P[1]-80);gr.addColorStop(0,'#ffb43baa');gr.addColorStop(1,'#ffc14300');g.fillStyle=gr;g.fillRect(P[0]-4,P[1]-80,8,80);g.restore();}
 draw.sort((a,b)=>a.depth-b.depth);for(const o of draw){if(o.p){let P=this.project(o.p.x,0,o.p.z),H=this.project(hero.x,0,hero.z);g.save();if(P[1]>H[1]&&Math.abs(P[0]-H[0])<S*2.4&&P[1]-H[1]<S*5)g.globalAlpha=.30;this.prop(o.p,t);g.restore();}else{const a=o.a,[x,y]=o.P;this.shadow(x,y,S*(a.boss?1.4:a===hero?1:.7),S*.3);if(a===hero||a.type==='hero')r9Human(g,a,x,y,S,t);else if(a.boss)r9LineageBoss(g,a,x,y,S,t);else R12MonsterSprites.draw(g,a,x,y,S,t);}this.draws++;}
 g.save();g.globalCompositeOperation='screen';for(let i=0;i<30;i++){const x=((i*137.21+t*(9+i%3))%(this.w+100))-50,y=(i*87.12-t*(4+i%5)+this.h*100)%(this.h+50);g.globalAlpha=.20+.16*Math.sin(i+t);g.fillStyle=i%2?'#d98433':'#d9c590';g.fillRect(x,y,1,2);}g.restore();return visible;}
 preview(canvas,a,t){const d=1.5,w=canvas.clientWidth||300,h=canvas.clientHeight||300;if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}const g=canvas.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);let gr=g.createRadialGradient(w*.5,h*.48,4,w*.5,h*.48,h*.55);gr.addColorStop(0,'#75351088');gr.addColorStop(1,'#08050200');g.fillStyle=gr;g.fillRect(0,0,w,h);g.save();g.strokeStyle='#b18a43';g.lineWidth=1;for(let r of [w*.27,w*.31]){g.beginPath();g.ellipse(w*.5,h*.93,r,r*.24,0,0,7);g.stroke();}g.restore();r9Human(g,a,w*.53,h*.91,Math.min(w/10.8,(h-30)/10.2),t,true);}
}

let r9FlameStamp;
function r9GetFlame(){if(r9FlameStamp)return r9FlameStamp;const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');
 let grad=g.createLinearGradient(0,0,128,0);grad.addColorStop(0,'#ff260000');grad.addColorStop(.45,'#f83309cc');grad.addColorStop(.83,'#ffd751');grad.addColorStop(1,'#fff8da');
 for(let j=0;j<9;j++){g.fillStyle=grad;g.globalAlpha=.30+j*.06;g.beginPath();g.moveTo(125,32);g.bezierCurveTo(91,6+j*2,49,23,4+j*3,10+j*4);g.bezierCurveTo(44,25,57,30,33,43);g.bezierCurveTo(82,33,106,49-j,125,32);g.fill();}r9FlameStamp=c;return c;}
function r9FlameCombat(ctx,engine,effects,t){ctx.save();ctx.globalCompositeOperation='screen';const stamp=r9GetFlame();
 for(const e of effects){let q=e.age/e.life;if(q<0||q>1)continue;
 if(['fire','crescent','whirl','dragonBurst'].includes(e.kind)){const r=e.kind==='dragonBurst'?1+q*7:e.kind==='whirl'?3+q*2.5:3+q*3.6;
  ctx.globalAlpha=Math.sin(Math.PI*q)*.72;let n=e.kind==='dragonBurst'?32:20;
  for(let j=0;j<n;j++){const a=(e.yaw||0)+(e.kind==='dragonBurst'?t*.3:0)-1.45+j/n*(e.kind==='dragonBurst'?6.283:2.8)+q*.8;const P=engine.project(e.x+Math.sin(a)*r,.9,e.z+Math.cos(a)*r),Q=engine.project(e.x+Math.sin(a+.02)*r,.9,e.z+Math.cos(a+.02)*r);ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(Math.atan2(Q[1]-P[1],Q[0]-P[0]));ctx.drawImage(stamp,-65,-12,78+Math.sin(j*4+q*8)*15,25+Math.sin(j+q*7)*6);ctx.restore();}
 }
 if(e.kind==='dragonBurst'){const P=engine.project(e.x+Math.sin(q*6)*2,3.5+q*5,e.z+Math.cos(q*6)*2);ctx.globalAlpha=Math.sin(q*Math.PI)*.66;ctx.drawImage(R9Art.images['dragon-head.png'],P[0]-60,P[1]-90,120,140);}
 }
 ctx.restore();}
