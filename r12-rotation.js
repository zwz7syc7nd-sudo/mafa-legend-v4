// Existing R10 turn integrator, extracted without behavior changes.
export function advanceYaw(current,target,dt,attacking=false){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 const distance=Math.abs(delta),rate=attacking?16:12,maxSpeed=attacking?Math.PI*3:Math.PI*2;
 const threshold=maxSpeed/rate,linearTime=Math.max(0,(distance-threshold)/maxSpeed);
 const elapsed=Math.max(0,dt);
 const remaining=elapsed<=linearTime?distance-maxSpeed*elapsed:Math.min(distance,threshold)*Math.exp(-rate*(elapsed-linearTime));
 return current+Math.sign(delta)*(distance-remaining);
}
