// ══════════════════════════════════════
//  LEVELS — 5 cute locations
// ══════════════════════════════════════

const LEVELS = [
  { id:0, name:'🌸 Cherry Blossom Park',       drawBg: drawCherryBlossom },
  { id:1, name:'🍄 Enchanted Mushroom Forest',  drawBg: drawMushroomForest },
  { id:2, name:'☁️ Floating Cloud Kingdom',    drawBg: drawCloudKingdom },
  { id:3, name:'🏰 Tiny Medieval Village',      drawBg: drawMedievalVillage },
  { id:4, name:'🌙 Nighttime Rooftop',          drawBg: drawNightRooftop },
];

const GROUND_Y = 400;

function drawCherryBlossom(ctx, W, H, camX, t) {
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#fde8f5'); sky.addColorStop(1,'#fff0f8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.translate(-camX*0.2,0);
  for(let i=0;i<14;i++){
    const tx=60+i*160, th=160+Math.sin(i*1.7)*40;
    ctx.fillStyle='#8b5e3c'; ctx.fillRect(tx-8,GROUND_Y-th,16,th);
    ctx.beginPath(); ctx.arc(tx,GROUND_Y-th-20,42,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,180,200,${0.7+Math.sin(i)*0.2})`; ctx.fill();
    ctx.beginPath(); ctx.arc(tx-22,GROUND_Y-th-10,28,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx+22,GROUND_Y-th-10,28,0,Math.PI*2); ctx.fill();
  }
  for(let i=0;i<30;i++){
    const px=((i*137+t*0.6)%(W+200))-100;
    const py=(i*53+t*0.4+i*0.8)%H;
    ctx.save(); ctx.translate(px,py); ctx.rotate(t*0.02+i);
    ctx.beginPath(); ctx.ellipse(0,0,5,3,0,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,182,215,${0.6+Math.sin(i)*0.3})`; ctx.fill(); ctx.restore();
  }
  ctx.restore();
  const grd=ctx.createLinearGradient(0,GROUND_Y,0,H);
  grd.addColorStop(0,'#a8e0a0'); grd.addColorStop(1,'#7ec870');
  ctx.fillStyle=grd; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
  ctx.save(); ctx.translate(-camX*0.5,0);
  for(let i=0;i<40;i++){
    const fx=(i*173+20)%(W*3);
    ctx.beginPath(); ctx.arc(fx,GROUND_Y+10,4,0,Math.PI*2);
    ctx.fillStyle=i%2===0?'#ffb7c5':'#fff'; ctx.fill();
  }
  ctx.restore();
}

function drawMushroomForest(ctx, W, H, camX, t) {
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0d1b2a'); sky.addColorStop(0.6,'#1a3a2a'); sky.addColorStop(1,'#2a4a2a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){
    const sx=(i*137)%W, sy=(i*97)%(GROUND_Y*0.7);
    const alpha=0.4+Math.sin(t*0.03+i)*0.3;
    ctx.beginPath(); ctx.arc(sx,sy,1.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${alpha})`; ctx.fill();
  }
  ctx.save(); ctx.translate(-camX*0.25,0);
  const mc=['#e74c3c','#e67e22','#9b59b6','#1abc9c','#3498db'];
  for(let i=0;i<10;i++) drawMushroom(ctx,80+i*220,GROUND_Y,100+Math.sin(i*2)*50,mc[i%mc.length],0.8+i*0.05,t);
  for(let i=0;i<20;i++){
    const sx=(i*201)%(W*3);
    const fireX=(i*173+t*0.5)%(W*2), fireY=100+(i*97)%(GROUND_Y-150)+Math.sin(t*0.04+i)*20;
    const a=0.4+Math.sin(t*0.08+i*1.3)*0.4;
    ctx.beginPath(); ctx.arc(fireX,fireY,3,0,Math.PI*2); ctx.fillStyle=`rgba(200,255,100,${a})`; ctx.fill();
    ctx.beginPath(); ctx.arc(fireX,fireY,8,0,Math.PI*2); ctx.fillStyle=`rgba(180,255,80,${a*0.3})`; ctx.fill();
    drawMushroom(ctx,sx,GROUND_Y,30+Math.sin(i)*10,mc[i%mc.length],0.5,t);
  }
  ctx.restore();
  const grd=ctx.createLinearGradient(0,GROUND_Y,0,H);
  grd.addColorStop(0,'#2d6a2d'); grd.addColorStop(1,'#1a4a1a');
  ctx.fillStyle=grd; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
}

function drawMushroom(ctx,x,groundY,h,color,scale=1){
  ctx.save(); ctx.translate(x,groundY); ctx.scale(scale,scale);
  const sw=h*0.25;
  ctx.beginPath(); ctx.rect(-sw/2,-h*0.5,sw,h*0.5); ctx.fillStyle='#f0e6d0'; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-h*0.5,h*0.55,Math.PI,0); ctx.fillStyle=color; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1.5; ctx.stroke();
  for(let d=0;d<4;d++){
    const da=(d/4)*Math.PI*0.8+0.1;
    ctx.beginPath(); ctx.arc(Math.cos(da)*h*0.3,-h*0.5-Math.sin(da)*h*0.2,h*0.07,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fill();
  }
  ctx.restore();
}

function drawCloudKingdom(ctx, W, H, camX, t) {
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#c8e6ff'); sky.addColorStop(0.5,'#e8d4ff'); sky.addColorStop(1,'#ffd8e8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.save();
  const rc=['#ff6b6b','#ffa94d','#ffe066','#69db7c','#74c0fc','#748ffc','#cc5de8'];
  for(let r=0;r<7;r++){
    ctx.beginPath(); ctx.arc(W*0.15,H*1.1,280+r*18,Math.PI*1.1,0,false);
    ctx.strokeStyle=rc[r]; ctx.lineWidth=12; ctx.globalAlpha=0.4; ctx.stroke();
  }
  ctx.globalAlpha=1; ctx.restore();
  ctx.save(); ctx.translate(-camX*0.15,0);
  for(let i=0;i<8;i++) drawFluffy(ctx,100+i*280,80+Math.sin(i*1.3)*60,70+i*10,'rgba(255,255,255,0.9)');
  ctx.restore();
  ctx.save(); ctx.translate(-camX*0.5,0);
  for(let i=-1;i<15;i++){
    drawFluffy(ctx,i*180,GROUND_Y,120,'#fff');
    drawFluffy(ctx,i*180+90,GROUND_Y-20,80,'rgba(240,230,255,0.9)');
  }
  ctx.restore();
  for(let i=0;i<25;i++){
    const sx=(i*137)%W, sy=(i*73)%(GROUND_Y*0.8);
    drawStar(ctx,sx,sy,6+Math.sin(i)*3);
  }
}

function drawFluffy(ctx,x,y,r,color){
  [0,[-0.5,0.1,0.7],[0.5,0.1,0.7],[-0.9,0.3,0.5],[0.9,0.3,0.5]].forEach((v,i)=>{
    if(i===0){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); }
    else {
      ctx.beginPath(); ctx.arc(x+v[0]*r,y+v[1]*r,v[2]*r,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    }
  });
}

function drawMedievalVillage(ctx, W, H, camX, t) {
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#87ceeb'); sky.addColorStop(0.7,'#ffd89b'); sky.addColorStop(1,'#ff9a44');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.translate(-camX*0.2,0);
  const blds=[
    {x:50,h:220,w:70,color:'#d4a574',roof:'#8b4513'},{x:160,h:280,w:60,color:'#c8956c',roof:'#722f15'},
    {x:270,h:200,w:80,color:'#ddb88a',roof:'#9b3e1a'},{x:400,h:320,w:55,color:'#b8845a',roof:'#6b2810'},
    {x:500,h:240,w:75,color:'#cc9966',roof:'#8b3a15'},{x:640,h:260,w:65,color:'#c47c52',roof:'#7a3012'},
    {x:760,h:200,w:90,color:'#d4956e',roof:'#8c4015'},{x:900,h:280,w:60,color:'#c0845a',roof:'#6e2c10'},
    {x:1020,h:230,w:70,color:'#cc8c64',roof:'#7b3313'},{x:1150,h:300,w:65,color:'#ba7850',roof:'#652a0e'},
    {x:1280,h:220,w:80,color:'#d09060',roof:'#843818'},{x:1420,h:260,w:55,color:'#c87848',roof:'#712c10'},
  ];
  blds.forEach(b=>{
    ctx.fillStyle=b.color; ctx.fillRect(b.x,GROUND_Y-b.h,b.w,b.h);
    ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; ctx.strokeRect(b.x,GROUND_Y-b.h,b.w,b.h);
    ctx.beginPath(); ctx.moveTo(b.x-8,GROUND_Y-b.h); ctx.lineTo(b.x+b.w/2,GROUND_Y-b.h-50); ctx.lineTo(b.x+b.w+8,GROUND_Y-b.h); ctx.closePath();
    ctx.fillStyle=b.roof; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(255,220,120,0.8)'; ctx.fillRect(b.x+10,GROUND_Y-b.h+30,16,18);
    if(b.w>60) ctx.fillRect(b.x+b.w-26,GROUND_Y-b.h+30,16,18);
    ctx.fillStyle='#5a3010'; ctx.beginPath(); ctx.arc(b.x+b.w/2,GROUND_Y-20,14,Math.PI,0); ctx.rect(b.x+b.w/2-14,GROUND_Y-20,28,20); ctx.fill();
  });
  ctx.restore();
  const grd=ctx.createLinearGradient(0,GROUND_Y,0,H);
  grd.addColorStop(0,'#b8a090'); grd.addColorStop(1,'#8a7060');
  ctx.fillStyle=grd; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
}

function drawNightRooftop(ctx, W, H, camX, t) {
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0a0a1a'); sky.addColorStop(0.5,'#0d1030'); sky.addColorStop(1,'#1a1535');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.beginPath(); ctx.arc(W*0.8,80,50,0,Math.PI*2);
  const mg=ctx.createRadialGradient(W*0.8,80,10,W*0.8,80,50);
  mg.addColorStop(0,'#fffde0'); mg.addColorStop(0.7,'#ffe8a0'); mg.addColorStop(1,'rgba(255,240,150,0)');
  ctx.fillStyle=mg; ctx.fill();
  for(let i=0;i<120;i++){
    const sx=(i*137)%W, sy=(i*97)%(GROUND_Y*0.85);
    const alpha=0.3+Math.sin(t*0.04+i)*0.3;
    ctx.beginPath(); ctx.arc(sx,sy,i%7===0?2:1.2,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,220,${alpha})`; ctx.fill();
  }
  ctx.save(); ctx.translate(-camX*0.15,0);
  [{x:-100,h:280,w:90},{x:50,h:350,w:70},{x:180,h:240,w:100},{x:340,h:400,w:60},
   {x:460,h:300,w:85},{x:610,h:360,w:75},{x:760,h:250,w:95},{x:920,h:320,w:65},
   {x:1060,h:380,w:80},{x:1210,h:270,w:90},{x:1380,h:340,w:70},{x:1530,h:300,w:85}
  ].forEach(b=>{
    ctx.fillStyle='#1a1a3a'; ctx.fillRect(b.x,GROUND_Y-b.h,b.w,b.h);
    for(let wy=GROUND_Y-b.h+15;wy<GROUND_Y-10;wy+=28){
      for(let wx=b.x+8;wx<b.x+b.w-14;wx+=22){
        if(Math.sin((wx+wy+t*0.001)*0.3)>0.2){
          ctx.fillStyle='rgba(255,240,150,0.7)'; ctx.fillRect(wx,wy,12,16);
        }
      }
    }
  });
  ctx.restore();
  const grd=ctx.createLinearGradient(0,GROUND_Y,0,H);
  grd.addColorStop(0,'#2a2840'); grd.addColorStop(1,'#1a1830');
  ctx.fillStyle=grd; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
  ctx.save(); ctx.translate(-camX*0.5,0);
  const bc=['#ffd700','#ff69b4','#87ceeb','#98fb98','#ffa500'];
  for(let s=0;s<8;s++){
    const lx=s*300;
    ctx.strokeStyle='rgba(100,100,100,.4)'; ctx.lineWidth=1;
    ctx.beginPath();
    for(let p=0;p<10;p++){
      const plx=lx+p*30, ply=GROUND_Y-40+Math.sin((p/9)*Math.PI)*15;
      p===0?ctx.moveTo(plx,ply):ctx.lineTo(plx,ply);
      const ba=0.5+Math.sin(t*0.06+p+s)*0.4;
      ctx.beginPath(); ctx.arc(plx,ply,4,0,Math.PI*2);
      let col=bc[(p+s)%bc.length];
      ctx.fillStyle=col; ctx.globalAlpha=ba; ctx.fill(); ctx.globalAlpha=1;
    }
    ctx.stroke();
  }
  ctx.restore();
}
