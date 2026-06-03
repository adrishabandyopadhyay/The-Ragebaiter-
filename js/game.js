// ══════════════════════════════════════
//  GAME ENGINE
// ══════════════════════════════════════

const CANVAS_W = 1200;
const CANVAS_H = 500;
const WORLD_W  = 2400; // total scroll width per level
const FLOOR_Y  = GROUND_Y; // from levels.js = 400

// ── Game State ─────────────────────────────────────────────
let GS = null;

function makeGameState() {
  return {
    round: 0,       // 0-4
    scores: { gf: 0, bf: 0 },
    phase: 'intro', // intro | running | roundEnd | gameOver
    winner: null,
    tick: 0,
    camX: 0,

    gf: makeDuck('gf'),
    bf: makeDuck('bf'),

    projectiles: [],
    pickups: [],
    particles: [],

    finishX: WORLD_W - 150,
  };
}

function makeDuck(who) {
  const isGf = who === 'gf';
  return {
    who,
    x: isGf ? 300 : 80,
    y: FLOOR_Y - 50,
    vx: 0,
    vy: 0,
    speed: isGf ? 3.8 : 3.4,
    facing: isGf ? 1 : 1,
    state: 'idle',  // idle | run | hit | angry
    slowTimer: 0,   // ticks remaining of slow effect
    stunTimer: 0,   // ticks remaining of stun
    throwCooldown: 0,
    anim: 0,
    onGround: true,
    weapon: null,   // current held weapon type
    hearts: 0,
  };
}

// ── PICKUP definitions ─────────────────────────────────────
const WEAPON_TYPES = ['fryingPan', 'rollingPin', 'flowerPot'];
const GIFT_TYPES   = ['heart', 'star', 'flower'];

function spawnPickups() {
  const pickups = [];
  const spacing = WORLD_W / 18;
  for (let i = 1; i < 17; i++) {
    const px = spacing * i + (Math.random() - 0.5) * 80;
    const isWeapon = i % 2 === 0;
    pickups.push({
      id: i,
      x: px,
      y: FLOOR_Y - 45,
      type: isWeapon
        ? WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)]
        : GIFT_TYPES[Math.floor(Math.random() * GIFT_TYPES.length)],
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }
  return pickups;
}

// ── Input ──────────────────────────────────────────────────
const KEYS = {};
window.addEventListener('keydown', e => { KEYS[e.code] = true; });
window.addEventListener('keyup',   e => { KEYS[e.code] = false; });

function getGfInput()  {
  return {
    left:  KEYS['ArrowLeft'],
    right: KEYS['ArrowRight'],
    throw: KEYS['Space'],
  };
}
function getBfInput() {
  return {
    left:  KEYS['KeyA'],
    right: KEYS['KeyD'],
    throw: KEYS['KeyF'],
  };
}

// ── Game loop ──────────────────────────────────────────────
let gameRAF = null;
let lastSentTick = -1;

function startGameLoop() {
  if (gameRAF) cancelAnimationFrame(gameRAF);
  function loop() {
    gameRAF = requestAnimationFrame(loop);
    updateGame();
    renderGame();
  }
  loop();
}

function stopGameLoop() {
  if (gameRAF) { cancelAnimationFrame(gameRAF); gameRAF = null; }
}

// ── Update ─────────────────────────────────────────────────
function updateGame() {
  if (!GS || GS.phase !== 'running') return;
  GS.tick++;

  // Always apply gf input to gf duck, bf input to bf duck
  // getMyChar() tells us which one is LOCAL (for network sync)
  // but both ducks always respond to their keys regardless
  applyInput(GS.gf, getGfInput(), 'gf');
  applyInput(GS.bf, getBfInput(), 'bf');

  // My character (for network sync + camera)
  const myC = getMyChar() || 'gf';

  // Send my duck state to peer (every 2 ticks)
  if (myC && GS.tick !== lastSentTick && GS.tick % 2 === 0) {
    lastSentTick = GS.tick;
    sendToPeer({
      type: 'duckState',
      who: myC,
      x: GS[myC].x,
      y: GS[myC].y,
      vx: GS[myC].vx,
      vy: GS[myC].vy,
      state: GS[myC].state,
      facing: GS[myC].facing,
      anim: GS[myC].anim,
      slowTimer: GS[myC].slowTimer,
      stunTimer: GS[myC].stunTimer,
      weapon: GS[myC].weapon,
    });
  }

  // Update both ducks physics
  updateDuck(GS.gf);
  updateDuck(GS.bf);

  // Pickups
  updatePickups();

  // Projectiles
  updateProjectiles();

  // Particles
  GS.particles = GS.particles.filter(p => { p.life--; p.x += p.vx; p.y += p.vy; p.vy += 0.3; return p.life > 0; });

  // Camera follows YOUR duck — keep at 25% from left edge
  const myDuck = GS[myC];
  const targetCam = myDuck.x - CANVAS_W * 0.25;
  GS.camX += (targetCam - GS.camX) * 0.15;
  GS.camX = Math.max(0, Math.min(WORLD_W - CANVAS_W, GS.camX));
  if (GS.tick % 60 === 0) console.log('myC:', myC, 'duck.x:', myDuck.x, 'camX:', GS.camX);

  // Win condition
  checkWinCondition();
}

function applyInput(duck, input, who) {
  if (duck.stunTimer > 0) { duck.stunTimer--; return; }

  const spd = duck.slowTimer > 0 ? duck.speed * 0.4 : duck.speed;

  if (input.left)  { duck.vx = -spd; duck.facing = -1; duck.state = 'run'; }
  else if (input.right) { duck.vx = spd; duck.facing = 1; duck.state = 'run'; }
  else { duck.vx *= 0.7; duck.state = 'idle'; }

  // Throw
  if (input.throw && duck.throwCooldown <= 0) {
    tryThrow(duck, who);
    duck.throwCooldown = 60;
  }
  if (duck.throwCooldown > 0) duck.throwCooldown--;
  if (duck.slowTimer > 0) duck.slowTimer--;

  duck.anim += Math.abs(duck.vx) * 0.5;
}

function updateDuck(duck) {
  duck.x += duck.vx;
  duck.y += duck.vy;
  duck.vy += 0.6; // gravity

  // Floor collision
  if (duck.y >= FLOOR_Y - 50) {
    duck.y = FLOOR_Y - 50;
    duck.vy = 0;
    duck.onGround = true;
  }

  // World bounds
  duck.x = Math.max(30, Math.min(WORLD_W - 30, duck.x));
}

function tryThrow(duck, who) {
  if (who === 'gf') {
    // She throws weapons
    const wtype = duck.weapon || WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
    GS.projectiles.push({
      who: 'gf',
      type: wtype,
      x: duck.x,
      y: duck.y - 10,
      vx: -9, // always throw LEFT back at bf who is behind her
      vy: -4,
      angle: 0,
      life: 120,
    });
    duck.weapon = null;
    spawnParticles(duck.x, duck.y - 20, '#ff8fab', 8);
    sendToPeer({ type: 'throw', who: 'gf', proj: GS.projectiles[GS.projectiles.length - 1] });
  } else {
    // He throws gifts
    const gtype = GIFT_TYPES[Math.floor(Math.random() * GIFT_TYPES.length)];
    GS.projectiles.push({
      who: 'bf',
      type: gtype,
      x: duck.x,
      y: duck.y - 10,
      vx: 7, // always throw RIGHT toward gf who is ahead
      vy: -3,
      angle: 0,
      life: 120,
    });
    sendToPeer({ type: 'throw', who: 'bf', proj: GS.projectiles[GS.projectiles.length - 1] });
  }
}

function updatePickups() {
  GS.pickups.forEach(p => {
    if (p.collected) return;
    const isWeapon = WEAPON_TYPES.includes(p.type);

    // Gf can pick up weapons, bf can pick up gifts
    const collector = isWeapon ? GS.gf : GS.bf;
    const dist = Math.abs(collector.x - p.x);
    if (dist < 35) {
      p.collected = true;
      if (isWeapon) {
        GS.gf.weapon = p.type;
        showNotif('💥 ' + weaponName(p.type) + '!');
      } else {
        // Gift slows gf
        GS.gf.slowTimer = 180;
        showNotif('💐 ' + giftName(p.type) + ' — Ms. Short Fuse slowed!');
      }
      spawnParticles(p.x, p.y, isWeapon ? '#ff4757' : '#ffe066', 12);
    }
  });
}

function updateProjectiles() {
  GS.projectiles = GS.projectiles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.25;
    p.angle += 0.15;
    p.life--;

    if (p.y > FLOOR_Y) return false;
    if (p.life <= 0) return false;

    // Hit detection
    if (p.who === 'gf') {
      // Her weapons hit bf
      if (Math.abs(p.x - GS.bf.x) < 40 && Math.abs(p.y - GS.bf.y) < 50) {
        GS.bf.stunTimer = 90;
        GS.bf.state = 'hit';
        spawnParticles(GS.bf.x, GS.bf.y - 20, '#ff4757', 15);
        showNotif('💥 BONK! Ragebaiter stunned!');
        sendToPeer({ type: 'hit', who: 'bf' });
        return false;
      }
    } else {
      // His gifts hit gf
      if (Math.abs(p.x - GS.gf.x) < 40 && Math.abs(p.y - GS.gf.y) < 50) {
        GS.gf.slowTimer = 200;
        GS.gf.state = 'angry';
        spawnParticles(GS.gf.x, GS.gf.y - 20, '#ff69b4', 15);
        showNotif('💕 Gifted! Ms. Short Fuse is slower!');
        sendToPeer({ type: 'hit', who: 'gf' });
        return false;
      }
    }
    return true;
  });
}

function checkWinCondition() {
  const finX = GS.finishX;
  // Bf catches gf: bf within 55px of gf AND bf has chased (past x=200) AND gf hasn't finished
  const bfCaught = Math.abs(GS.bf.x - GS.gf.x) < 55
    && GS.bf.x > 200
    && GS.gf.x < finX;
  // Gf reaches finish line
  const gfFinished = GS.gf.x >= finX;

  if (bfCaught) endRound('bf');
  else if (gfFinished) endRound('gf');
}

function endRound(winnerChar) {
  if (GS.phase !== 'running') return;
  GS.phase = 'roundEnd';
  GS.winner = winnerChar;
  GS.scores[winnerChar]++;

  sendToPeer({ type: 'roundEnd', winner: winnerChar, scores: GS.scores });
  showRoundEnd(winnerChar);
}

// ── Render ─────────────────────────────────────────────────
function renderGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas || !GS) return;
  // Render in both 'running' and 'intro' so canvas is never blank
  if (GS.phase !== 'running' && GS.phase !== 'intro') return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.save();
  ctx.translate(-GS.camX, 0);

  // Background
  const level = LEVELS[GS.round];
  level.drawBg(ctx, WORLD_W, CANVAS_H, GS.camX, GS.tick);

  // Finish line
  drawFinishLine(ctx, GS.finishX);

  // Pickups
  GS.pickups.forEach(p => {
    if (p.collected) return;
    const bob = Math.sin(GS.tick * 0.07 + p.bobOffset) * 6;
    if (WEAPON_TYPES.includes(p.type)) {
      if (p.type === 'fryingPan')  drawFryingPan(ctx,  p.x, p.y + bob, GS.tick * 0.03);
      if (p.type === 'rollingPin') drawRollingPin(ctx, p.x, p.y + bob, 0.3);
      if (p.type === 'flowerPot')  drawFlowerPot(ctx,  p.x, p.y + bob, 0);
    } else {
      if (p.type === 'heart')  drawHeart(ctx,  p.x, p.y + bob, 16);
      if (p.type === 'star')   drawStar(ctx,   p.x, p.y + bob, 14);
      if (p.type === 'flower') drawFlower(ctx, p.x, p.y + bob, 14);
    }
    // Pickup label
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.font = '11px Nunito';
    ctx.textAlign = 'center';
    const label = WEAPON_TYPES.includes(p.type) ? '⚔️' : '💐';
    ctx.fillText(label, p.x, p.y + bob - 28);
  });

  // Projectiles
  GS.projectiles.forEach(p => {
    if (p.type === 'fryingPan')  drawFryingPan(ctx,  p.x, p.y, p.angle);
    if (p.type === 'rollingPin') drawRollingPin(ctx, p.x, p.y, p.angle);
    if (p.type === 'flowerPot')  drawFlowerPot(ctx,  p.x, p.y, p.angle);
    if (p.type === 'heart')  drawHeart(ctx,  p.x, p.y, 14);
    if (p.type === 'star')   drawStar(ctx,   p.x, p.y, 12);
    if (p.type === 'flower') drawFlower(ctx, p.x, p.y, 12);
  });

  // Particles
  GS.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Ducks
  const gfBob = Math.abs(GS.gf.vx) > 0.5 ? walkBob(GS.tick, 1.4) : 0;
  const bfBob = Math.abs(GS.bf.vx) > 0.5 ? walkBob(GS.tick, 1.4) : 0;

  // gf faces RIGHT (away from bf, toward finish) unless moving left
  // bf faces RIGHT (toward gf who is ahead) unless moving left
  drawGfDuck(ctx, GS.gf.x, GS.gf.y + gfBob, 0.9, GS.gf.anim, GS.gf.facing < 0, GS.gf.state);
  drawBfDuck(ctx, GS.bf.x, GS.bf.y + bfBob, 0.9, GS.bf.anim, GS.bf.facing < 0, GS.bf.state);

  // Slow effect
  if (GS.gf.slowTimer > 0 && GS.gf.slowTimer % 8 < 4) {
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(GS.gf.x, GS.gf.y - 20, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 3; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (GS.bf.stunTimer > 0 && GS.bf.stunTimer % 6 < 3) {
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(GS.bf.x, GS.bf.y - 20, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff4757'; ctx.lineWidth = 3; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Name labels
  drawLabel(ctx, GS.gf.x, GS.gf.y - 65, 'Ms. Short Fuse', '#ff8fab');
  drawLabel(ctx, GS.bf.x, GS.bf.y - 65, 'Ragebaiter',     '#5b8dee');

  // Distance indicator above gf
  const distToFinish = Math.max(0, GS.finishX - GS.gf.x);
  if (distToFinish > 0) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 12px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText(`🏁 ${Math.round(distToFinish / 20)}m`, GS.gf.x, GS.gf.y - 82);
  }

  ctx.restore();
}

function drawFinishLine(ctx, x) {
  // Checkered pattern
  const h = CANVAS_H;
  const sqSize = 20;
  for (let i = 0; i < h / sqSize; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#111' : '#fff';
    ctx.fillRect(x, i * sqSize, sqSize, sqSize);
    ctx.fillStyle = i % 2 === 0 ? '#fff' : '#111';
    ctx.fillRect(x + sqSize, i * sqSize, sqSize, sqSize);
  }
  // Pole
  ctx.fillStyle = '#cc3333';
  ctx.fillRect(x - 4, 0, 8, h);
  // Flag
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(x - 4, 30);
  ctx.lineTo(x + 40, 50);
  ctx.lineTo(x - 4, 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Nunito';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH', x + 20, 90);
}

function drawLabel(ctx, x, y, text, color) {
  ctx.font = 'bold 13px Nunito';
  ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - 14, w, 20, 8);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// ── Particles helper ───────────────────────────────────────
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    GS.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 1.5) * 6,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      size: 3 + Math.random() * 4,
      color,
    });
  }
}

// ── Notification ───────────────────────────────────────────
function showNotif(msg) {
  const el = document.createElement('div');
  el.className = 'game-notif';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ── Names ─────────────────────────────────────────────────
function weaponName(t) {
  return { fryingPan: 'Frying Pan', rollingPin: 'Rolling Pin', flowerPot: 'Flower Pot' }[t] || t;
}
function giftName(t) {
  return { heart: 'Heart', star: 'Star', flower: 'Flower' }[t] || t;
}

// ── Network state sync ─────────────────────────────────────
function handleNetData(data) {
  if (!GS) return;

  if (data.type === 'duckState') {
    const duck = GS[data.who];
    if (!duck) return;
    // Lerp remote duck position
    duck.x      = duck.x * 0.3 + data.x * 0.7;
    duck.y      = duck.y * 0.3 + data.y * 0.7;
    duck.vx     = data.vx;
    duck.vy     = data.vy;
    duck.state  = data.state;
    duck.facing = data.facing;
    duck.anim   = data.anim;
    duck.slowTimer  = data.slowTimer;
    duck.stunTimer  = data.stunTimer;
    duck.weapon     = data.weapon;
  }

  if (data.type === 'throw') {
    GS.projectiles.push({ ...data.proj });
  }

  if (data.type === 'hit') {
    const duck = GS[data.who];
    if (!duck) return;
    if (data.who === 'bf') { duck.stunTimer = 90; duck.state = 'hit'; }
    else { duck.slowTimer = 200; duck.state = 'angry'; }
  }

  if (data.type === 'roundEnd') {
    if (GS.phase !== 'running') return;
    GS.phase   = 'roundEnd';
    GS.winner  = data.winner;
    GS.scores  = data.scores;
    showRoundEnd(data.winner);
  }

  if (data.type === 'startRound') {
    loadRound(data.round);
  }

  if (data.type === 'gameOver') {
    showGameOver(data.winner);
  }
}