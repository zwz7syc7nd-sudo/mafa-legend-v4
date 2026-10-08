// One local playable HUD/ground proof. Original CC0 character remains a disclosed placeholder.
const $=id=>document.getElementById(id);
function icon(type){
 const paths={
 red:'<path fill="url(#red)" d="M25 8h14v6h-2v13c0 6 14 10 14 23 0 13-38 13-38 0 0-13 14-17 14-23V14h-2Z"/><path fill="#ac9571" d="M25 5h14v6H25Z"/><path d="M20 43q12-8 25 0M30 14v13q-10 12-10 21" fill="none" stroke="#ffdab3" stroke-width="2" opacity=".7"/>',
 green:'<path fill="url(#green)" d="M25 8h14v6h-2v13c0 6 14 10 14 23 0 13-38 13-38 0 0-13 14-17 14-23V14h-2Z"/><path fill="#ac9571" d="M25 5h14v6H25Z"/><path d="M20 43q12-8 25 0M30 14v13q-10 12-10 21" fill="none" stroke="#f0ffda" stroke-width="2" opacity=".7"/>',
 skill:'<path fill="#052551" d="M6 4h52v56H6Z"/><path fill="#39b9ff" stroke="#afeeff" d="m13 51 14-28-2 13L48 9 34 35l15-7-27 26 8-16Z"/><path stroke="#24a0ff" fill="none" d="M7 52Q29 45 55 11M16 60Q50 49 58 20"/>',
 recall:'<ellipse cx="32" cy="43" rx="24" ry="11" fill="#042657" stroke="#42b9ff" stroke-width="2"/><ellipse cx="32" cy="42" rx="17" ry="7" fill="none" stroke="#8debff"/><path d="M32 9v39M20 33l12-24 12 24ZM15 36h34" fill="none" stroke="#58cbff" stroke-width="2"/>',
 bag:'<path fill="#503522" d="m16 23 4-15 28 4 6 41-39 3-6-22Z"/><path fill="#936b44" d="m19 9 27 3 4 17-19 9-18-9Z"/><path fill="#473121" d="m19 31-2 21 13 2 1-17m9-3 2 21"/><path stroke="#d7b98a" fill="none" d="m18 12 27 3 2 13-16 7-14-6M33 29v18"/><path fill="#d7b98a" d="M30 39h7v7h-7Z"/>'
 };
 return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="red" cx="35%" cy="30%"><stop stop-color="#ff9086"/><stop offset=".4" stop-color="#d7080d"/><stop offset="1" stop-color="#430000"/></radialGradient><radialGradient id="green" cx="35%" cy="30%"><stop stop-color="#d1ff8f"/><stop offset=".4" stop-color="#4ab908"/><stop offset="1" stop-color="#143900"/></radialGradient></defs>'+paths[type]+'</svg>';
}
export async function installScreenProof(){
 document.body.classList.add('screen-proof');
 const bar=$('quickbar'),labels=['紅水','綠水','技能','回城','背包'],types=['red','green','skill','recall','bag'];
 const actions=[()=>Reborn.perform('potion'),()=>{Reborn.useConsumable('green');},()=>Reborn.openPanel('skills'),()=>{Reborn.useConsumable('recall');},()=>Reborn.openPanel('bag')];
 labels.forEach((label,i)=>{const b=document.createElement('button');b.id='quick-'+types[i];b.setAttribute('aria-label',label);b.innerHTML=icon(types[i])+'<span>'+label+'</span><em></em>';b.onclick=()=>{if(!Reborn.snapshot().started||Reborn.snapshot().paused)return;actions[i]();};bar.append(b);});
 $('pickup-button').onclick=()=>{const h=Reborn.hero,d=Reborn.drops.filter(d=>Math.hypot(d.x-h.x,d.z-h.z)<12).sort((a,b)=>Math.hypot(a.x-h.x,a.z-h.z)-Math.hypot(b.x-h.x,b.z-h.z))[0];if(d)Reborn.requestPickup(d.item.id);else{$('toast').textContent='附近沒有可拾取物品';$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1600);}};
 const attack=$('attack');attack.style.backgroundImage='none';attack.querySelector('svg').setAttribute('viewBox','0 0 32 32');
 $('hero-name').querySelector('em').remove();
 $('buff-bar').insertAdjacentHTML('afterend','<div id="proof-buffs" aria-label="效果狀態"><span title="防禦">♜</span><span title="武器">⚔</span><span id="proof-green"></span><span></span></div>');
 window.R11ScreenHUD={update(){const h=Reborn.hero;$('coin-value').textContent=h.gold.toLocaleString();const s=Reborn.redesignState;$('proof-green').textContent=s.green?'綠':'';$('quick-red').querySelector('em').textContent=h.cooldowns.potion>0?Math.ceil(h.cooldowns.potion)+'s':Reborn.consumableCount('red');$('quick-green').querySelector('em').textContent=Reborn.consumableCount('green');$('quick-recall').querySelector('em').textContent=Reborn.consumableCount('recall');$('xp').setAttribute('data-xp',Math.round(h.xp)+' EXP');}};
 // The HUD face comes from the same original GIF atlas.
 $('avatar').replaceChildren(R10.portrait());
 Reborn.setAuto(false);window.R11ScreenHUD.update();
}
