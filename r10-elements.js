/* R10.9 weapon elements. Simulation-clock only; no asset or network dependency. */
(function(root){
 'use strict';
 const definitions=Object.freeze({
  fire:Object.freeze({name:'焰火',color:'#ff9a65',duration:2,rate:.06,description:'真命中後燃燒 2 秒，每秒造成該次直接傷害的 6%（合計 12%）。'}),
  ice:Object.freeze({name:'寒霜',color:'#8bdcff',duration:1.2,description:'真命中後，普通怪物移動速度降低 15%，持續 1.2 秒；Boss 不受緩速。'}),
  lightning:Object.freeze({name:'雷電',color:'#d5b6ff',description:'同一次攻擊對同一目標，額外造成直接傷害的 10%，最多觸發一次。'}),
  poison:Object.freeze({name:'劇毒',color:'#a9df76',duration:3,rate:.05,description:'真命中後中毒 3 秒，每秒造成該次直接傷害的 5%（合計 15%）。'})
 });
 const valid=item=>item.element===undefined||item.element===null||item.element==='none'||(item.slot==='weapon'&&typeof item.element==='string'&&Object.hasOwn(definitions,item.element));
 const kind=item=>item?.slot==='weapon'&&typeof item.element==='string'&&Object.hasOwn(definitions,item.element)?item.element:'none';
 const label=item=>kind(item)==='none'?'無元素':definitions[kind(item)].name;
 const describe=item=>{const k=kind(item);if(k==='none')return '無元素附傷。隨機掉落的武器有 40% 無元素，四種元素各 15%。';return definitions[k].description+(k==='ice'?' 同一武器對同一目標只刷新時間；移速降低不疊加。':k==='lightning'?' 每次攻擊各自計算。元素附傷不暴擊、不吸血、不再觸發元素。':' 同一武器對同一目標刷新持續時間，不疊加；刷新保留每秒結算節拍。元素附傷不暴擊、不吸血、不再觸發元素。');};
 const roll=random=>{const r=random();return r<.4?'none':r<.55?'fire':r<.7?'ice':r<.85?'lightning':'poison';};
 const round=x=>Math.round(x*100)/100;
 function create(){
  const statuses=new Map();
  const snapshot=(item,attack)=>({itemId:item?.id??null,element:kind(item),attack,seen:new Set()});
  function clear(target){if(target===undefined)statuses.clear();else statuses.delete(target);}
  function hit(target,damage,source,now,emit,visual){
   if(!source||source.element==='none'||target.state==='dead'||!(damage>0))return;
   const k=source.element,d=definitions[k];if(!d)return;
   const context={element:k,sourceItem:source.itemId,action:source.attack,secondary:true};
   if(k==='lightning'){
    if(source.seen.has(target.id))return;source.seen.add(target.id);
    emit(target,round(damage*.10),{...context,eventTime:now});visual?.(target,k,now);return;
   }
   if(k==='ice'&&target.boss)return;
   let group=statuses.get(target.id);if(!group){group=new Map();statuses.set(target.id,group);}
   const key=source.itemId+':'+k,old=group.get(key);
   group.set(key,{target:target.id,key,element:k,sourceItem:source.itemId,action:source.attack,damage:round(damage*(d.rate||0)),expires:now+d.duration,nextAt:old?.nextAt??now+1});
   visual?.(target,k,now);
  }
  function step(now,targets,emit){
   for(const [id,group] of statuses){const target=targets.find(m=>m.id===id);if(!target||target.state==='dead'){statuses.delete(id);continue;}
    for(const [key,status] of group){
     if(status.element!=='ice')while(status.nextAt<=now+1e-8&&status.nextAt<=status.expires+1e-8&&target.state!=='dead'){
      emit(target,status.damage,{element:status.element,sourceItem:status.sourceItem,action:status.action,secondary:true,eventTime:status.nextAt});status.nextAt+=1;
     }
     if(now>=status.expires-1e-8||target.state==='dead')group.delete(key);
    }
    if(!group.size)statuses.delete(id);
   }
  }
  const movement=(target,now)=>target.boss?1:[...(statuses.get(target.id)?.values()||[])].some(s=>s.element==='ice'&&s.expires>now+1e-8)?.85:1;
  const inspect=()=>[...statuses.values()].flatMap(g=>[...g.values()].map(s=>({...s})));
  return {snapshot,hit,step,clear,movement,inspect};
 }
 const api={definitions,valid,kind,label,describe,roll,create};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.R10Elements=api;
})(typeof window!=='undefined'?window:globalThis);
