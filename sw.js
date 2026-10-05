'use strict';
const BUILD='R9.4.0-six', VERSION='mafa-r94-20261005';
const ROOT=new URL('./',self.location.href).href;
const FILES=[
  "./art-frame.svg?v=R9.4.0-six",
  "./art-skill-basic.png?v=R9.4.0-six",
  "./art-skill-crescent.png?v=R9.4.0-six",
  "./art-skill-fire.png?v=R9.4.0-six",
  "./art-skill-thunder.png?v=R9.4.0-six",
  "./art-skill-whirl.png?v=R9.4.0-six",
  "./demon-head.png?v=R9.4.0-six",
  "./demon-left-arm.png?v=R9.4.0-six",
  "./demon-left-leg.png?v=R9.4.0-six",
  "./demon-right-arm.png?v=R9.4.0-six",
  "./demon-right-leg.png?v=R9.4.0-six",
  "./demon-torso.png?v=R9.4.0-six",
  "./dragon-head.png?v=R9.4.0-six",
  "./dragon-neck.png?v=R9.4.0-six",
  "./dragon-wing.png?v=R9.4.0-six",
  "./hero-cape-left.png?v=R9.4.0-six",
  "./hero-cape-right.png?v=R9.4.0-six",
  "./hero-head.png?v=R9.4.0-six",
  "./hero-left-arm.png?v=R9.4.0-six",
  "./hero-left-boot.png?v=R9.4.0-six",
  "./hero-left-shin.png?v=R9.4.0-six",
  "./hero-left-shoulder.png?v=R9.4.0-six",
  "./hero-left-thigh.png?v=R9.4.0-six",
  "./hero-portrait.png?v=R9.4.0-six",
  "./hero-right-arm.png?v=R9.4.0-six",
  "./hero-right-boot.png?v=R9.4.0-six",
  "./hero-right-shin.png?v=R9.4.0-six",
  "./hero-right-shoulder.png?v=R9.4.0-six",
  "./hero-right-thigh.png?v=R9.4.0-six",
  "./hero-skirt.png?v=R9.4.0-six",
  "./hero-sword.png?v=R9.4.0-six",
  "./hero-torso.png?v=R9.4.0-six",
  "./hero-wing.png?v=R9.4.0-six",
  "./icon-192.png?v=R9.4.0-six",
  "./icon-512.png?v=R9.4.0-six",
  "./index.html",
  "./item-armor-0.png?v=R9.4.0-six",
  "./item-armor-1.png?v=R9.4.0-six",
  "./item-armor-2.png?v=R9.4.0-six",
  "./item-armor-3.png?v=R9.4.0-six",
  "./item-charm-0.png?v=R9.4.0-six",
  "./item-charm-1.png?v=R9.4.0-six",
  "./item-charm-2.png?v=R9.4.0-six",
  "./item-charm-3.png?v=R9.4.0-six",
  "./item-ring-0.png?v=R9.4.0-six",
  "./item-ring-1.png?v=R9.4.0-six",
  "./item-ring-2.png?v=R9.4.0-six",
  "./item-ring-3.png?v=R9.4.0-six",
  "./item-weapon-0.png?v=R9.4.0-six",
  "./item-weapon-1.png?v=R9.4.0-six",
  "./item-weapon-2.png?v=R9.4.0-six",
  "./item-weapon-3.png?v=R9.4.0-six",
  "./manifest.webmanifest?v=R9.4.0-six",
  "./materials-normal.png?v=R9.4.0-six",
  "./materials.jpg?v=R9.4.0-six",
  "./ornament-corner.jpg?v=R9.4.0-six",
  "./prop-pillar.png?v=R9.4.0-six",
  "./r9-avatar.svg?v=R9.4.0-six",
  "./r9-basic.svg?v=R9.4.0-six",
  "./r9-blink.svg?v=R9.4.0-six",
  "./r9-crescent.svg?v=R9.4.0-six",
  "./r9-dash.svg?v=R9.4.0-six",
  "./r9-dragon.svg?v=R9.4.0-six",
  "./r9-fire.svg?v=R9.4.0-six",
  "./r9-guard.svg?v=R9.4.0-six",
  "./r9-layout.css?v=R9.4.0-six",
  "./r9-thunder.svg?v=R9.4.0-six",
  "./r9-visual.js?v=R9.4.0-six",
  "./r9-whirl.svg?v=R9.4.0-six",
  "./skill-attack.jpg?v=R9.4.0-six",
  "./skill-dash.jpg?v=R9.4.0-six",
  "./skill-fire.jpg?v=R9.4.0-six",
  "./skill-potion.jpg?v=R9.4.0-six",
  "./skill-whirl.jpg?v=R9.4.0-six",
  "./terrain-ash.jpg?v=R9.4.0-six",
  "./terrain-basalt.jpg?v=R9.4.0-six",
  "./terrain-forest.jpg?v=R9.4.0-six",
  "./terrain-stone.jpg?v=R9.4.0-six",
  "./terrain-water.jpg?v=R9.4.0-six",
  "./ui-frame.svg?v=R9.4.0-six",
  "./art-rig.json?v=R9.4.0-six"
];
const ENTRY=new URL('./index.html',ROOT).href;
const MARKER=new URL('./__installed_R94__',ROOT).href;
const ASSETS=new Set(FILES.map(p=>new URL(p,ROOT).href));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 try {
  for(const path of FILES){const url=new URL(path,ROOT).href,r=await fetch(new Request(url,{cache:'reload'}));if(!r.ok)throw new Error('缺少離線資源：'+path+' '+r.status);await cache.put(url,r);}
  await cache.put(MARKER,new Response(JSON.stringify({build:BUILD,assets:FILES.length}),{headers:{'Content-Type':'application/json'}}));
  await self.skipWaiting();
 }catch(err){await caches.delete(VERSION);throw err;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);if(!await cache.match(MARKER))throw new Error('離線版本未完整安裝');
 for(const k of await caches.keys())if(k!==VERSION&&/^(mafa-reborn-|mafa-legend-|mafa-r9[0-9]-)/.test(k))await caches.delete(k);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(ROOT))return;
 const isEntry=r.mode==='navigate'&&(u.pathname===new URL(ROOT).pathname||u.pathname===new URL(ENTRY).pathname);
 if(isEntry){event.respondWith((async()=>{
  const c=await caches.open(VERSION);
  try{const response=await fetch(r,{cache:'no-cache'});if(response.ok&&response.headers.get('content-type')?.includes('text/html')){const h=await response.clone().text();if(h.includes('content="'+BUILD+'"'))await c.put(ENTRY,response.clone());}return response;}
  catch(e){return await c.match(ENTRY)||new Response('離線資源尚未安裝完成，請先連網開啟。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
 })());}
 else if(ASSETS.has(u.href))event.respondWith((async()=>{const c=await caches.open(VERSION),hit=await c.match(r);if(hit)return hit;const response=await fetch(r);if(response.ok)await c.put(r,response.clone());return response;})());
});
