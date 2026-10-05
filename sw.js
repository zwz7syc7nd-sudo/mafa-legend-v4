'use strict';
// R8 complete offline resource set. No save data, IndexedDB, or unrelated site cache is deleted.
const VERSION='mafa-reborn-r8-20261005-r1';
const ROOT=new URL('./',self.location.href).href;
const FILES=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./item-armor-0.png",
  "./item-armor-1.png",
  "./item-armor-2.png",
  "./item-armor-3.png",
  "./item-charm-0.png",
  "./item-charm-1.png",
  "./item-charm-2.png",
  "./item-charm-3.png",
  "./item-ring-0.png",
  "./item-ring-1.png",
  "./item-ring-2.png",
  "./item-ring-3.png",
  "./item-weapon-0.png",
  "./item-weapon-1.png",
  "./item-weapon-2.png",
  "./item-weapon-3.png",
  "./materials-normal.png",
  "./materials.jpg",
  "./skill-attack.jpg",
  "./skill-dash.jpg",
  "./skill-fire.jpg",
  "./skill-potion.jpg",
  "./skill-whirl.jpg",
  "./ui-frame.svg"
];
const ASSETS=new Set(FILES.map(p=>new URL(p,ROOT).href));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  for(const path of FILES){
   const url=new URL(path,ROOT).href;
   const response=await fetch(new Request(url,{cache:'reload'}));
   if(!response.ok)throw new Error('R8 offline asset unavailable: '+path+' ('+response.status+')');
   await cache.put(url,response);
  }
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys()){
   if(key!==VERSION&&(key.startsWith('mafa-reborn-')||key.startsWith('mafa-legend-')))await caches.delete(key);
  }
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
 const entry=new URL('./index.html',ROOT).href;
 const path=url.pathname;
 const isEntry=request.mode==='navigate'&&(path===new URL(ROOT).pathname||path===new URL(entry).pathname);
 if(isEntry){
  event.respondWith((async()=>{
   const cache=await caches.open(VERSION);
   try{
    const response=await fetch(request,{cache:'no-cache'});
    if(response.ok&&response.headers.get('content-type')?.includes('text/html'))await cache.put(entry,response.clone());
    // Do not disguise a real server 404 by serving an old game as if deployment succeeded.
    return response;
   }catch(error){
    return await cache.match(entry)||new Response('離線資源尚未安裝完成。請先連網開啟遊戲。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
   }
  })());
 }else if(ASSETS.has(url.href)){
  event.respondWith((async()=>{
   const cache=await caches.open(VERSION),cached=await cache.match(request);
   if(cached)return cached;
   const response=await fetch(request);
   if(response.ok)await cache.put(request,response.clone());
   return response;
  })());
 }
});
