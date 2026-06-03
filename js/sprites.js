// ══════════════════════════════════════
//  SPRITES — Draw ducks with canvas 2D
// ══════════════════════════════════════

const C = {
  white:'#fffcf5', cream:'#f5ead0', beak:'#e07b30', eye:'#1a1a1a',
  cap:'#c0392b', capBrim:'#a93226', capBand:'#8B0000',
  bow:'#ff8fab', bow2:'#ff6b9d', pearl:'#f0ece4', pearlSh:'#d4cfc7',
  foot:'#e07b30', wing:'#eee8d8', blush:'rgba(255,150,150,0.35)',
  angry:'#ff4757', outline:'#3a2a2a',
  heartC:'#ff4d6d', starC:'#ffe066', flowerC:'#ff8fab',
};

function drawDuckBase(ctx, x, y, scale, bodyColor='#fffcf5') {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  ctx.beginPath(); ctx.ellipse(0,10,28,22,0,0,Math.PI*2);
  ctx.fillStyle=bodyColor; ctx.fill();
  ctx.strokeStyle=C.outline; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-6,12,16,10,-0.3,0,Math.PI*2);
  ctx.fillStyle=C.wing; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22,4); ctx.quadraticCurveTo(36,-6,30,14); ctx.quadraticCurveTo(28,20,20,14);
  ctx.fillStyle=C.cream; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(-6,-14,18,0,Math.PI*2);
  ctx.fillStyle=bodyColor; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-2,-10,8,5,0.3,0,Math.PI*2); ctx.fillStyle=C.blush; ctx.fill();
  ctx.beginPath(); ctx.arc(-12,-16,3.5,0,Math.PI*2); ctx.fillStyle=C.eye; ctx.fill();
  ctx.beginPath(); ctx.arc(-13.5,-17.5,1.2,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-22,-13,9,5,-0.2,0,Math.PI*2);
  ctx.fillStyle=C.beak; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-22,-13); ctx.lineTo(-30,-13);
  ctx.strokeStyle=C.outline; ctx.lineWidth=1.2; ctx.stroke();
  drawFoot(ctx,-12,30,1); drawFoot(ctx,6,31,1);
  ctx.restore();
}

function drawFoot(ctx,x,y,s) {
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.fillStyle=C.foot; ctx.strokeStyle=C.outline; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.ellipse(0,0,6,4,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  for(let i=-1;i<=1;i++){
    ctx.beginPath(); ctx.ellipse(i*4,3,2.5,4,i*0.3,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawBfDuck(ctx, x, y, scale=1, anim=0, facingLeft=false, state='idle') {
  ctx.save();
  if(!facingLeft){ ctx.translate(x*2,0); ctx.scale(-1,1); }
  drawDuckBase(ctx,x,y,scale,C.white);
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  ctx.beginPath(); ctx.ellipse(-6,-30,22,5,0,0,Math.PI*2);
  ctx.fillStyle=C.capBrim; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(-6,-30,16,Math.PI,0);
  ctx.fillStyle=C.cap; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-22,-30); ctx.lineTo(10,-30);
  ctx.strokeStyle=C.capBand; ctx.lineWidth=3; ctx.stroke();
  ctx.beginPath(); ctx.arc(-6,-46,3,0,Math.PI*2); ctx.fillStyle=C.capBand; ctx.fill();
  if(state==='idle'||state==='run'){
    ctx.beginPath(); ctx.moveTo(-16,-22); ctx.lineTo(-8,-20);
    ctx.strokeStyle=C.outline; ctx.lineWidth=2; ctx.stroke();
  }
  if(state==='hit'){ ctx.font='14px serif'; ctx.fillText('💫',-5,-52); }
  ctx.restore(); ctx.restore();
}

function drawGfDuck(ctx, x, y, scale=1, anim=0, facingLeft=false, state='idle') {
  ctx.save();
  // Base sprite faces LEFT, so flip it to face RIGHT by default
  // Only skip the flip when explicitly facing left
  if(!facingLeft){ ctx.translate(x*2,0); ctx.scale(-1,1); }
  drawDuckBase(ctx,x,y,scale,C.white);
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  const pc=9;
  for(let i=0;i<pc;i++){
    const angle=(-0.6+i*(1.2/(pc-1)));
    const px=-6+Math.cos(angle)*20, py=-4+Math.sin(angle)*8;
    ctx.beginPath(); ctx.arc(px,py,2.8,0,Math.PI*2);
    ctx.fillStyle=C.pearl; ctx.fill(); ctx.strokeStyle=C.pearlSh; ctx.lineWidth=.8; ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(-16,-30,10,6,-0.5,0,Math.PI*2);
  ctx.fillStyle=C.bow; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-2,-30,10,6,0.5,0,Math.PI*2);
  ctx.fillStyle=C.bow; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(-9,-30,5,0,Math.PI*2);
  ctx.fillStyle=C.bow2; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  if(state==='angry'||state==='run'){
    ctx.beginPath(); ctx.moveTo(-18,-23); ctx.lineTo(-8,-20);
    ctx.strokeStyle=C.outline; ctx.lineWidth=2.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16,-19); ctx.lineTo(-8,-19);
    ctx.strokeStyle=C.angry; ctx.lineWidth=1.5; ctx.stroke();
  }
  if(state==='angry'){ ctx.font='13px serif'; ctx.fillText('😤',4,-50); }
  ctx.restore(); ctx.restore();
}

function walkBob(t, speed=1) { return Math.sin(t*speed*0.15)*4; }

function drawFryingPan(ctx,x,y,angle=0){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  ctx.beginPath(); ctx.rect(-4,0,8,26); ctx.fillStyle='#5a3a1a'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,-4,18,14,0,0,Math.PI*2); ctx.fillStyle='#888'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-4,-6,6,4,-0.5,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fill();
  ctx.restore();
}

function drawRollingPin(ctx,x,y,angle=0.3){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  ctx.beginPath(); ctx.rect(-24,-5,48,10); ctx.fillStyle='#c8a06e'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.rect(-32,-8,10,16); ctx.fillStyle='#a07040'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.stroke();
  ctx.beginPath(); ctx.rect(22,-8,10,16); ctx.fillStyle='#a07040'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.stroke();
  ctx.restore();
}

function drawFlowerPot(ctx,x,y,angle=0){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(-16,20); ctx.lineTo(16,20); ctx.lineTo(12,0); ctx.closePath();
  ctx.fillStyle='#e07b30'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,0,12,5,0,0,Math.PI*2); ctx.fillStyle='#7a5a3a'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-12,5,0,Math.PI*2); ctx.fillStyle='#ffcc00'; ctx.fill(); ctx.stroke();
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2;
    ctx.beginPath(); ctx.ellipse(Math.cos(a)*9,-12+Math.sin(a)*9,4,3,a,0,Math.PI*2);
    ctx.fillStyle='#ff8fab'; ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(ctx,x,y,size=18){
  ctx.save(); ctx.translate(x,y);
  ctx.beginPath(); ctx.moveTo(0,size*0.3);
  ctx.bezierCurveTo(-size,-size*0.3,-size,size*0.7,0,size);
  ctx.bezierCurveTo(size,size*0.7,size,-size*0.3,0,size*0.3);
  ctx.fillStyle=C.heartC; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}

function drawStar(ctx,x,y,size=14){
  ctx.save(); ctx.translate(x,y); ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=(i*4*Math.PI)/5-Math.PI/2, b=((i*4+2)*Math.PI)/5-Math.PI/2;
    i===0?ctx.moveTo(Math.cos(a)*size,Math.sin(a)*size):ctx.lineTo(Math.cos(a)*size,Math.sin(a)*size);
    ctx.lineTo(Math.cos(b)*(size*0.4),Math.sin(b)*(size*0.4));
  }
  ctx.closePath(); ctx.fillStyle=C.starC; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}

function drawFlower(ctx,x,y,size=14){
  ctx.save(); ctx.translate(x,y);
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2;
    ctx.beginPath(); ctx.ellipse(Math.cos(a)*size*0.7,Math.sin(a)*size*0.7,size*0.45,size*0.3,a,0,Math.PI*2);
    ctx.fillStyle=C.flowerC; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0,0,size*0.35,0,Math.PI*2); ctx.fillStyle='#ffe066'; ctx.fill(); ctx.strokeStyle=C.outline; ctx.lineWidth=1; ctx.stroke();
  ctx.restore();
}

function renderStaticGf(canvasId, scale=1, facingLeft=false){
  const c=document.getElementById(canvasId); if(!c)return;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  drawGfDuck(ctx,c.width/2,c.height/2+8,scale,0,facingLeft,'idle');
}

function renderStaticBf(canvasId, scale=1, facingLeft=false){
  const c=document.getElementById(canvasId); if(!c)return;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  drawBfDuck(ctx,c.width/2,c.height/2+8,scale,0,facingLeft,'idle');
}

function drawWeddingScene(ctx,w,h){
  ctx.clearRect(0,0,w,h);
  ctx.beginPath(); ctx.arc(w/2,h*0.2,80,Math.PI,0);
  ctx.strokeStyle='#ffb7c5'; ctx.lineWidth=4; ctx.stroke();
  [[-60,0],[-40,-40],[0,-60],[40,-40],[60,0]].forEach(([dx,dy])=>drawFlower(ctx,w/2+dx,h*0.2+dy,10));
  drawGfDuck(ctx,w*0.35,h*0.65,0.9,0,false,'idle');
  drawBfDuck(ctx,w*0.65,h*0.65,0.9,0,true,'idle');
  drawHeart(ctx,w/2,h*0.45,14);
}

function drawBeatingScene(ctx,w,h,frame=0){
  ctx.clearRect(0,0,w,h);
  drawGfDuck(ctx,w*0.35,h*0.65,0.9,0,false,'angry');
  drawFryingPan(ctx,w*0.48,h*0.55,Math.sin(frame*0.25)*0.8);
  drawBfDuck(ctx,w*0.68,h*0.65,0.9,0,true,'hit');
  for(let i=0;i<3;i++){
    const a=(i/3)*Math.PI*2+frame*0.08;
    drawStar(ctx,w*0.68+Math.cos(a)*35,h*0.35+Math.sin(a)*20,10);
  }
}