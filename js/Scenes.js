// ══════════════════════════════════════
//  SCENES — Animated cinematic screens
// ══════════════════════════════════════

let sceneRAF = null;
let sceneTick = 0;

function stopScene() {
  if (sceneRAF) { cancelAnimationFrame(sceneRAF); sceneRAF = null; }
  sceneTick = 0;
}

// ══════════════════════════════════════
//  ROUND END SCENE
// ══════════════════════════════════════

function showRoundEndScene(winnerChar, containerEl) {
  stopScene();
  const isGfWin = winnerChar === 'gf';
  containerEl.innerHTML = '';

  // Full-screen canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  containerEl.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function loop() {
    sceneRAF = requestAnimationFrame(loop);
    sceneTick++;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    if (isGfWin) drawChaosScene(ctx, canvas.width, canvas.height, sceneTick);
    else          drawCoolScene(ctx,  canvas.width, canvas.height, sceneTick);
  }
  loop();
}

// ─── GF WINS: FIRE CHAOS EXPLOSION ────────────────────────
function drawChaosScene(ctx, W, H, t) {
  // Dark fiery sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0000');
  sky.addColorStop(0.3, '#2a0800');
  sky.addColorStop(0.6, '#8b1a00');
  sky.addColorStop(1, '#cc3300');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Volcano in background
  drawVolcano(ctx, W, H, t);

  // Flying sparks/embers
  drawEmbers(ctx, W, H, t);

  // Ground lava
  drawLavaGround(ctx, W, H, t);

  // Smoke clouds
  drawSmokeClouds(ctx, W, H, t);
}

function drawVolcano(ctx, W, H, t) {
  const vx = W * 0.5, vy = H * 0.85;
  const vw = W * 0.7;

  // Volcano body
  ctx.beginPath();
  ctx.moveTo(vx - vw / 2, H);
  ctx.lineTo(vx - vw * 0.15, vy - H * 0.35);
  ctx.lineTo(vx + vw * 0.15, vy - H * 0.35);
  ctx.lineTo(vx + vw / 2, H);
  ctx.closePath();
  const vgrad = ctx.createLinearGradient(vx - vw/2, 0, vx + vw/2, 0);
  vgrad.addColorStop(0, '#3a1a00');
  vgrad.addColorStop(0.5, '#5a2a00');
  vgrad.addColorStop(1, '#3a1a00');
  ctx.fillStyle = vgrad;
  ctx.fill();

  // Crater rim
  ctx.beginPath();
  ctx.ellipse(vx, vy - H * 0.35, vw * 0.18, vw * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2a0a00';
  ctx.fill();

  // Lava eruption from crater
  for (let i = 0; i < 12; i++) {
    const angle = -Math.PI / 2 + (Math.sin(t * 0.04 + i) * 0.6);
    const speed = 3 + Math.sin(t * 0.06 + i * 0.7) * 2;
    const life = ((t * speed * 0.5 + i * 40) % 120) / 120;
    const px = vx + Math.cos(angle) * (life * vw * 0.4);
    const py = vy - H * 0.35 - life * H * 0.5 + life * life * H * 0.3;
    const size = (1 - life) * 18 + 4;
    const alpha = 1 - life * 0.7;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    const lc = ctx.createRadialGradient(px, py, 0, px, py, size);
    lc.addColorStop(0, `rgba(255,255,100,${alpha})`);
    lc.addColorStop(0.4, `rgba(255,120,0,${alpha})`);
    lc.addColorStop(1, `rgba(200,40,0,0)`);
    ctx.fillStyle = lc;
    ctx.fill();
  }

  // Lava rivers down volcano sides
  for (let side = -1; side <= 1; side += 2) {
    const offset = ((t * 0.8) % 60);
    for (let seg = 0; seg < 5; seg++) {
      const progress = (offset / 60 + seg / 5) % 1;
      const lx = vx + side * vw * 0.08 * (1 + progress * 2);
      const ly = vy - H * 0.35 + progress * H * 0.35;
      const lr = 8 - progress * 5;
      if (lr <= 0) continue;
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      const lg2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
      lg2.addColorStop(0, 'rgba(255,200,50,0.9)');
      lg2.addColorStop(0.5, 'rgba(255,80,0,0.7)');
      lg2.addColorStop(1, 'rgba(180,20,0,0)');
      ctx.fillStyle = lg2; ctx.fill();
    }
  }
}

function drawEmbers(ctx, W, H, t) {
  for (let i = 0; i < 50; i++) {
    const seed = i * 137.5;
    const x = (seed % W + t * (1 + (i % 3)) * 0.8) % W;
    const y = H - ((seed * 0.7 + t * (2 + (i % 4))) % H);
    const size = 2 + (i % 4);
    const alpha = 0.4 + Math.sin(t * 0.1 + i) * 0.4;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${100 + (i % 155)},0,${alpha})`;
    ctx.fill();
  }
}

function drawLavaGround(ctx, W, H, t) {
  const gy = H * 0.82;
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= W; x += 20) {
    const wave = Math.sin(x * 0.02 + t * 0.05) * 8;
    ctx.lineTo(x, gy + wave);
  }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  const lg = ctx.createLinearGradient(0, gy, 0, H);
  lg.addColorStop(0, '#ff6600');
  lg.addColorStop(0.3, '#cc2200');
  lg.addColorStop(1, '#660000');
  ctx.fillStyle = lg; ctx.fill();

  // Lava glow
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= W; x += 20) {
    ctx.lineTo(x, gy + Math.sin(x * 0.02 + t * 0.05) * 8);
  }
  ctx.lineTo(W, gy); ctx.closePath();
  ctx.strokeStyle = 'rgba(255,200,50,0.6)'; ctx.lineWidth = 3; ctx.stroke();
}

function drawSmokeClouds(ctx, W, H, t) {
  for (let i = 0; i < 8; i++) {
    const cx = (i * 180 + t * 0.3) % (W + 200) - 100;
    const cy = 80 + Math.sin(i * 1.3 + t * 0.02) * 40;
    const r = 60 + i * 15;
    const alpha = 0.15 + Math.sin(t * 0.02 + i) * 0.05;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40,20,10,${alpha})`; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - r * 0.4, cy + r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40,20,10,${alpha})`; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.4, cy + r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40,20,10,${alpha})`; ctx.fill();
  }
}

// ─── BF WINS: COOL CALM NIGHT OCEAN ───────────────────────
function drawCoolScene(ctx, W, H, t) {
  // Deep blue sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#020818');
  sky.addColorStop(0.5, '#051530');
  sky.addColorStop(1, '#0a2a5a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 80; i++) {
    const sx = (i * 137) % W, sy = (i * 97) % (H * 0.6);
    const alpha = 0.3 + Math.sin(t * 0.05 + i) * 0.4;
    ctx.beginPath(); ctx.arc(sx, sy, i % 5 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${alpha})`; ctx.fill();
  }

  // Moon
  ctx.beginPath(); ctx.arc(W * 0.75, H * 0.18, 55, 0, Math.PI * 2);
  const mg = ctx.createRadialGradient(W*0.75, H*0.18, 5, W*0.75, H*0.18, 55);
  mg.addColorStop(0, '#e8f4ff'); mg.addColorStop(0.7, '#b0d4ff'); mg.addColorStop(1, 'rgba(100,160,255,0)');
  ctx.fillStyle = mg; ctx.fill();

  // Moon glow
  ctx.beginPath(); ctx.arc(W * 0.75, H * 0.18, 90, 0, Math.PI * 2);
  const mglow = ctx.createRadialGradient(W*0.75, H*0.18, 55, W*0.75, H*0.18, 90);
  mglow.addColorStop(0, 'rgba(100,180,255,0.12)'); mglow.addColorStop(1, 'transparent');
  ctx.fillStyle = mglow; ctx.fill();

  // Ocean
  const oceanY = H * 0.6;
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath(); ctx.moveTo(0, oceanY + layer * 20);
    for (let x = 0; x <= W; x += 15) {
      const wave = Math.sin(x * 0.015 + t * (0.03 + layer * 0.01) + layer) * (8 - layer * 2);
      ctx.lineTo(x, oceanY + layer * 20 + wave);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const og = ctx.createLinearGradient(0, oceanY, 0, H);
    const alphas = ['0.9', '0.95', '1'];
    og.addColorStop(0, `rgba(5,30,80,${alphas[layer]})`);
    og.addColorStop(1, `rgba(2,15,40,1)`);
    ctx.fillStyle = og; ctx.fill();
  }

  // Moon reflection on water
  const reflX = W * 0.75;
  for (let i = 0; i < 8; i++) {
    const ry = oceanY + i * 18 + Math.sin(t * 0.04 + i) * 5;
    const rw = (30 - i * 2) * (1 + Math.sin(t * 0.08) * 0.3);
    ctx.beginPath();
    ctx.ellipse(reflX + Math.sin(t * 0.06 + i) * 15, ry, rw, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,220,255,${0.4 - i * 0.04})`; ctx.fill();
  }

  // Floating lanterns
  for (let i = 0; i < 6; i++) {
    const lx = (i * 200 + t * 0.4) % (W + 100);
    const ly = H * 0.15 + Math.sin(t * 0.03 + i) * 30 + i * 25;
    const la = 0.5 + Math.sin(t * 0.07 + i) * 0.3;
    // Lantern body
    ctx.beginPath();
    ctx.ellipse(lx, ly, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,100,${la * 0.9})`; ctx.fill();
    // Lantern glow
    ctx.beginPath(); ctx.arc(lx, ly, 25, 0, Math.PI * 2);
    const lg = ctx.createRadialGradient(lx, ly, 5, lx, ly, 25);
    lg.addColorStop(0, `rgba(255,200,80,${la * 0.4})`);
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg; ctx.fill();
    // String
    ctx.beginPath(); ctx.moveTo(lx, ly + 16); ctx.lineTo(lx, ly + 28);
    ctx.strokeStyle = `rgba(200,180,100,${la * 0.6})`; ctx.lineWidth = 1; ctx.stroke();
  }

  // Floating petals on water
  for (let i = 0; i < 15; i++) {
    const px = (i * 97 + t * 0.6) % W;
    const py = oceanY + 10 + Math.sin(t * 0.04 + i) * 6;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * 0.02 + i);
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,180,255,${0.4 + Math.sin(i) * 0.2})`; ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════
//  GAME OVER — BEATING SCENE
// ══════════════════════════════════════

let bonkCount = 0;
let bonkCallback = null;
let bonkAnimRAF = null;
let bonkTick = 0;

function showBeatingScene(containerEl, onComplete) {
  stopScene();
  bonkCount = 0;
  bonkCallback = onComplete;
  bonkTick = 0;
  containerEl.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.id = 'beating-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:pointer;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  containerEl.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Instruction overlay
  const hint = document.createElement('div');
  hint.id = 'bonk-hint';
  hint.style.cssText = `
    position:absolute; bottom:120px; left:50%; transform:translateX(-50%);
    font-family:'Fredoka One',cursive; font-size:1.8rem;
    color:#fff; text-shadow: 0 0 20px rgba(255,100,0,0.8), 2px 2px 0 rgba(0,0,0,0.5);
    text-align:center; pointer-events:none; z-index:10;
    animation: pulse 0.8s ease-in-out infinite;
  `;
  hint.textContent = 'Press SPACE to BONK him! (0/5)';
  containerEl.appendChild(hint);

  // Bonk counter
  const counter = document.createElement('div');
  counter.id = 'bonk-counter';
  counter.style.cssText = `
    position:absolute; top:30px; left:50%; transform:translateX(-50%);
    font-family:'Fredoka One',cursive; font-size:3rem;
    color:#ff4400; text-shadow: 0 0 30px rgba(255,100,0,1), 2px 2px 0 #000;
    z-index:10; letter-spacing:4px;
  `;
  counter.textContent = '💢 0 / 5 💢';
  containerEl.appendChild(counter);

  let lastBonk = -1;

  function bonkLoop() {
    bonkAnimRAF = requestAnimationFrame(bonkLoop);
    bonkTick++;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawBeatingBg(ctx, canvas.width, canvas.height, bonkTick);
    drawBeatingDucks(ctx, canvas.width, canvas.height, bonkTick, lastBonk, bonkCount);
  }
  bonkLoop();

  // Space key handler
  function onSpace(e) {
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (bonkCount >= 5) return;
    bonkCount++;
    lastBonk = bonkTick;
    // Update UI
    document.getElementById('bonk-hint').textContent = bonkCount < 5
      ? `Press SPACE to BONK him! (${bonkCount}/5)`
      : 'JUSTICE SERVED!! 😤👊';
    document.getElementById('bonk-counter').textContent = `💢 ${bonkCount} / 5 💢`;
    if (bonkCount >= 5) {
      window.removeEventListener('keydown', onSpace);
      setTimeout(() => {
        cancelAnimationFrame(bonkAnimRAF);
        if (bonkCallback) bonkCallback();
      }, 1500);
    }
  }
  window.addEventListener('keydown', onSpace);
}

function drawBeatingBg(ctx, W, H, t) {
  // Red chaos background
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1a0000');
  sky.addColorStop(0.5, '#3a0500');
  sky.addColorStop(1, '#660800');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Angry speed lines radiating from center
  const cx = W * 0.5, cy = H * 0.45;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + t * 0.005;
    const len = 200 + Math.sin(t * 0.1 + i) * 80;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
    ctx.lineTo(cx + Math.cos(angle) * (60 + len), cy + Math.sin(angle) * (60 + len));
    ctx.strokeStyle = `rgba(255,${50 + i * 5},0,0.08)`;
    ctx.lineWidth = 8 + Math.sin(i) * 4; ctx.stroke();
  }

  // Impact flash
  if (bonkCount > 0) {
    const flashAge = bonkTick - (bonkTick - ((bonkTick) % 30));
    const flashAlpha = Math.max(0, 0.3 - flashAge * 0.03);
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,200,0,${flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

function drawBeatingDucks(ctx, W, H, t, lastBonk, bonkCount) {
  const cx = W * 0.5, cy = H * 0.5;

  // Bf duck shaking/recoiling
  const bfShake = lastBonk > 0 ? Math.sin((t - lastBonk) * 0.8) * Math.max(0, 15 - (t - lastBonk) * 0.5) : 0;
  const bfY = cy + 30 + bfShake;

  drawBfDuck(ctx, cx + 80 + bfShake * 2, bfY, 1.4, t, false, bonkCount > 0 ? 'hit' : 'idle');

  // Stars around bf head when bonked
  if (lastBonk > 0 && t - lastBonk < 40) {
    const starAge = t - lastBonk;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + starAge * 0.15;
      const r = 50 + starAge * 0.5;
      drawStar(ctx, cx + 80 + Math.cos(a) * r, bfY - 60 + Math.sin(a) * 30, 10);
    }
    // BONK text
    ctx.font = `bold ${40 + starAge}px 'Fredoka One', cursive`;
    ctx.fillStyle = `rgba(255,220,0,${Math.max(0, 1 - starAge * 0.04)})`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
    ctx.strokeText('BONK!!', cx + 80, bfY - 80 - starAge * 0.5);
    ctx.fillText('BONK!!', cx + 80, bfY - 80 - starAge * 0.5);
  }

  // Gf duck swinging pan
  const swingAngle = lastBonk > 0
    ? Math.max(-0.8, -1.5 + (t - lastBonk) * 0.08)
    : Math.sin(t * 0.05) * 0.3 - 0.4;
  drawGfDuck(ctx, cx - 80, cy + 30, 1.4, t, false, 'angry');
  drawFryingPan(ctx, cx - 10, cy - 10, swingAngle);

  // Rage text
  ctx.font = `bold 1.2rem 'Fredoka One', cursive`;
  ctx.fillStyle = '#ff4400';
  ctx.textAlign = 'center';
  const rageTexts = ['😤', '💢', '👊', '🔥'];
  for (let i = 0; i < bonkCount; i++) {
    ctx.fillText(rageTexts[i % rageTexts.length], cx - 120 + (i % 3) * 25, cy - 60 - Math.floor(i / 3) * 25);
  }
}

// ══════════════════════════════════════
//  GAME OVER — WEDDING SCENE
// ══════════════════════════════════════

function showWeddingScene(containerEl) {
  stopScene();
  containerEl.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  containerEl.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let wTick = 0;
  function loop() {
    sceneRAF = requestAnimationFrame(loop);
    wTick++;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawWeddingBg(ctx, canvas.width, canvas.height, wTick);
    drawWeddingDucks(ctx, canvas.width, canvas.height, wTick);
    drawConfetti(ctx, canvas.width, canvas.height, wTick);
  }
  loop();
}

function drawWeddingBg(ctx, W, H, t) {
  // Soft pastel sunset sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#ffe4f0');
  sky.addColorStop(0.4, '#ffd4e8');
  sky.addColorStop(0.7, '#e8d4ff');
  sky.addColorStop(1, '#c8e8ff');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Soft glowing sun/moon
  ctx.beginPath(); ctx.arc(W * 0.5, H * 0.22, 60, 0, Math.PI * 2);
  const sg = ctx.createRadialGradient(W*0.5, H*0.22, 0, W*0.5, H*0.22, 60);
  sg.addColorStop(0, 'rgba(255,240,200,1)');
  sg.addColorStop(0.6, 'rgba(255,200,150,0.8)');
  sg.addColorStop(1, 'rgba(255,180,120,0)');
  ctx.fillStyle = sg; ctx.fill();

  // Gentle water at bottom
  const waterY = H * 0.72;
  ctx.beginPath(); ctx.moveTo(0, waterY);
  for (let x = 0; x <= W; x += 12) {
    ctx.lineTo(x, waterY + Math.sin(x * 0.02 + t * 0.025) * 6);
  }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  const wg = ctx.createLinearGradient(0, waterY, 0, H);
  wg.addColorStop(0, 'rgba(180,220,255,0.85)');
  wg.addColorStop(1, 'rgba(120,180,255,0.95)');
  ctx.fillStyle = wg; ctx.fill();

  // Water shimmer
  for (let i = 0; i < 12; i++) {
    const sx = (i * 140 + t * 0.8) % W;
    const sy = waterY + 15 + Math.sin(t * 0.03 + i) * 8;
    ctx.beginPath(); ctx.ellipse(sx, sy, 20 + Math.sin(i) * 10, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(t * 0.06 + i) * 0.2})`; ctx.fill();
  }

  // Floating cherry blossom petals
  for (let i = 0; i < 25; i++) {
    const px = (i * 137 + t * 0.5) % W;
    const py = (i * 73 + t * 0.3) % (H * 0.7);
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * 0.02 + i);
    ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,180,210,${0.5 + Math.sin(i) * 0.3})`; ctx.fill();
    ctx.restore();
  }

  // Wedding arch
  drawWeddingArch(ctx, W, H, t);
}

function drawWeddingArch(ctx, W, H, t) {
  const ax = W * 0.5, ay = H * 0.65;
  const aw = Math.min(W * 0.45, 320);
  const ah = H * 0.38;

  // Arch posts
  ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  // Left post
  ctx.beginPath();
  ctx.moveTo(ax - aw / 2, ay);
  ctx.lineTo(ax - aw / 2, ay - ah);
  ctx.stroke();
  // Right post
  ctx.beginPath();
  ctx.moveTo(ax + aw / 2, ay);
  ctx.lineTo(ax + aw / 2, ay - ah);
  ctx.stroke();
  // Arch curve
  ctx.beginPath();
  ctx.arc(ax, ay - ah, aw / 2, Math.PI, 0);
  ctx.stroke();

  // Flower decorations on arch
  const flowerPositions = [
    [ax - aw/2, ay - ah * 0.3],
    [ax - aw/2, ay - ah * 0.7],
    [ax - aw/2 + aw*0.15, ay - ah - aw*0.3],
    [ax, ay - ah - aw/2 + 10],
    [ax + aw/2 - aw*0.15, ay - ah - aw*0.3],
    [ax + aw/2, ay - ah * 0.7],
    [ax + aw/2, ay - ah * 0.3],
  ];
  flowerPositions.forEach(([fx, fy]) => {
    drawFlower(ctx, fx, fy, 14 + Math.sin(t * 0.04) * 2);
  });

  // Hanging ribbons
  for (let i = 0; i < 5; i++) {
    const rx = ax - aw/2 + (i+0.5) * (aw/5);
    const ry = ay - ah + Math.sin(rx * 0.02 + 0.5) * (aw/2 - Math.abs(rx - ax));
    const swing = Math.sin(t * 0.03 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + swing, ry + 25, rx + swing * 0.5, ry + 45);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,180,200,0.8)' : 'rgba(200,180,255,0.8)';
    ctx.lineWidth = 2.5; ctx.stroke();
    // Ribbon bow
    ctx.beginPath(); ctx.arc(rx + swing * 0.5, ry + 45, 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#ffb7c5' : '#d4b8f0'; ctx.fill();
  }
}

function drawWeddingDucks(ctx, W, H, t) {
  const ax = W * 0.5, ay = H * 0.65;
  const bob = Math.sin(t * 0.04) * 4;

  // Gf in wedding veil
  drawGfDuck(ctx, ax - 70, ay - 5 + bob, 1.2, t, false, 'idle');
  // Wedding veil on gf
  ctx.save();
  ctx.translate(ax - 70, ay - 65 + bob);
  // Veil
  ctx.beginPath();
  ctx.moveTo(-8, -15);
  ctx.bezierCurveTo(-30, 10, -35, 40, -20, 70);
  ctx.bezierCurveTo(-5, 90, 5, 90, 20, 70);
  ctx.bezierCurveTo(35, 40, 30, 10, 8, -15);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,240,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
  // Veil crown
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-8 + i * 4, -20, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe066'; ctx.fill();
  }
  ctx.restore();

  // Bf in tiny bow tie
  drawBfDuck(ctx, ax + 70, ay - 5 + bob, 1.2, t, true, 'idle');
  // Bow tie on bf
  ctx.save();
  ctx.translate(ax + 70, ay - 25 + bob);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-12, -8, -16, 8, 0, 0);
  ctx.bezierCurveTo(12, -8, 16, 8, 0, 0);
  ctx.fillStyle = '#cc3333'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#aa1111'; ctx.fill();
  ctx.restore();

  // Heart between them
  const heartBob = Math.sin(t * 0.06) * 5;
  drawHeart(ctx, ax, ay - 60 + heartBob, 14 + Math.sin(t * 0.08) * 3);

  // Ring exchange animation
  if (t % 120 < 60) {
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💍', ax - 20, ay - 80 + bob);
    ctx.fillText('💍', ax + 20, ay - 80 + bob);
  }
}

function drawConfetti(ctx, W, H, t) {
  const colors = ['#ff8fab','#ffe066','#a8d8f0','#d4b8f0','#b5e8a0','#ffb7c5'];
  for (let i = 0; i < 60; i++) {
    const x = (i * 137 + t * (1 + i % 3) * 0.4) % W;
    const y = (i * 73  + t * (2 + i % 4) * 0.3) % H;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.05 + i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.7;
    if (i % 3 === 0) {
      ctx.fillRect(-4, -4, 8, 8);
    } else if (i % 3 === 1) {
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -6); ctx.lineTo(3, 0); ctx.lineTo(0, 6); ctx.lineTo(-3, 0);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}