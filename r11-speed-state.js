(function(root){
 'use strict';
 // Project tuning. Only normal knight and green potion can affect speed.
 const DEFAULTS=Object.freeze({knight:Object.freeze({move:1.5,attack:1.5}),greenPotion:Object.freeze({move:1.20,attack:1.25,duration:300})});
 const finite=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
 function checkTime(now){if(!finite(now,0,1e12))throw new TypeError('Invalid simulation time');}
 function validateSaved(saved){
  if(saved==null)return {greenRemaining:0,legacyTransformationRemaining:0};
  if(!saved||![1,2].includes(saved.version)||!finite(saved.greenRemaining,0,86400))throw new TypeError('Invalid redesign effect save');
  if(saved.version===1&&!finite(saved.transformRemaining,0,86400))throw new TypeError('Invalid legacy effect save');
  if(saved.version===2&&saved.legacyTransformationRemaining!==undefined&&!finite(saved.legacyTransformationRemaining,0,86400))throw new TypeError('Invalid legacy effect record');
  return saved;
 }
 function create(overrides={}){
  const config={knight:{...DEFAULTS.knight,...overrides.knight},greenPotion:{...DEFAULTS.greenPotion,...overrides.greenPotion}};
  for(const kind of ['knight','greenPotion']){for(const stat of ['move','attack'])if(!finite(config[kind][stat],.25,4))throw new TypeError('Invalid speed factor');Object.freeze(config[kind]);}
  if(!finite(config.greenPotion.duration,0,86400))throw new TypeError('Invalid effect duration');Object.freeze(config);
  let greenUntil=0,legacyTransformationRemaining=0;
  function at(now){checkTime(now);const green=now<greenUntil-1e-9;return {form:'knight',green,move:config.knight.move*(green?config.greenPotion.move:1),attack:config.knight.attack*(green?config.greenPotion.attack:1),greenRemaining:Math.max(0,greenUntil-now),transformRemaining:0};}
  return {config,at,
   greenPotion(now,seconds=config.greenPotion.duration){checkTime(now);if(!finite(seconds,0,86400))throw new TypeError('Invalid effect duration');greenUntil=now+seconds;return at(now);},
   clearGreen(now){checkTime(now);greenUntil=now;return at(now);},
   // Retired callers cannot reactivate the form or consume stored legacy items.
   transform(now){return at(now);},clearTransformation(now){return at(now);},
   reset(){greenUntil=legacyTransformationRemaining=0;},
   movementBetween(start,end){checkTime(start);checkTime(end);if(end<start)throw new TypeError('Time must advance');if(end===start)return at(start).move;const active=Math.max(0,Math.min(end,greenUntil)-start);return config.knight.move*(1+(config.greenPotion.move-1)*active/(end-start));},
   save(now){const state=at(now);return {version:2,greenRemaining:state.greenRemaining,legacyTransformationRemaining};},
   load(saved,now){checkTime(now);const state=validateSaved(saved);greenUntil=now+state.greenRemaining;legacyTransformationRemaining=state.version===1?state.transformRemaining:state.legacyTransformationRemaining||0;return at(now);}
  };
 }
 const api={DEFAULTS,create,validateSaved};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.R11SpeedState=api;
})(globalThis);
