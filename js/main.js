// ══════════════════════════════════════
//  MAIN — Screen flow & UI controller
// ══════════════════════════════════════

// ── Screen helper ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── Init title screen ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderStaticGf('titleDuckLeft', 0.85, false);  // gf faces RIGHT
  renderStaticBf('titleDuckRight', 0.85, true);   // bf faces LEFT (toward gf)
  spawnFloatingHearts();
  showScreen('screen-title');
  // Resize canvas to fit window
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
});

function spawnFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;
  setInterval(() => {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.textContent = ['💕','💗','🌸','✨','💖'][Math.floor(Math.random() * 5)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.bottom = '0';
    h.style.animationDuration = (3 + Math.random() * 4) + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 7000);
  }, 600);
}

function resizeCanvas() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const maxW = Math.min(window.innerWidth, 1200);
  canvas.style.width = maxW + 'px';
  canvas.style.height = (maxW * (CANVAS_H / CANVAS_W)) + 'px';
}

// ── Lobby: create room flow ────────────────────────────────
function showScreen_lobby() {
  showScreen('screen-lobby');
  renderStaticGf('lobbyDuck', 0.75);
  setLobbyStatus('Connecting...', true);
  document.getElementById('roomCodeDisplay').textContent = '- - - -';
  createRoom();
}

// Override showScreen to handle lobby init
const _showScreen = showScreen;
window.showScreen = function(id) {
  _showScreen(id);
  if (id === 'screen-lobby') {
    renderStaticGf('lobbyDuck', 0.75);
    setLobbyStatus('Connecting...', true);
    document.getElementById('roomCodeDisplay').textContent = '- - - -';
    createRoom();
  }
  if (id === 'screen-join') {
    renderStaticBf('joinDuck', 0.75);
  }
};

// ── Network event handlers ─────────────────────────────────
onNet('connected', ({ role, char }) => {
  if (role === 'host') {
    setLobbyStatus('🎉 Ragebaiter connected! Starting game...', false);
    document.getElementById('waitingAnim').style.display = 'none';
    setTimeout(() => {
      GS = makeGameState();
      sendToPeer({ type: 'startRound', round: 0 });
      loadRound(0);
    }, 1200);
  } else {
    document.getElementById('joinStatus').textContent = '🎉 Connected! Get ready...';
    GS = makeGameState();
  }
});

onNet('data', (data) => {
  if (data.type === 'startRound') {
    GS = GS || makeGameState();
    loadRound(data.round);
  } else {
    handleNetData(data);
  }
});

onNet('disconnected', () => {
  stopGameLoop();
  showScreen('screen-disconnected');
});

// ── Round loading ──────────────────────────────────────────
function loadRound(roundIndex) {
  if (!GS) GS = makeGameState();
  GS.round = roundIndex;
  GS.phase = 'intro';
  GS.gf = makeDuck('gf');
  GS.bf = makeDuck('bf');
  GS.projectiles = [];
  GS.particles   = [];
  GS.pickups     = spawnPickups();
  GS.camX        = 0;
  GS.tick        = 0;

  // Update HUD
  document.getElementById('hudRound').textContent  = 'Round ' + (roundIndex + 1);
  document.getElementById('hudGfScore').textContent = GS.scores.gf;
  document.getElementById('hudBfScore').textContent = GS.scores.bf;

  // Show intro
  document.getElementById('roundNumber').textContent   = 'Round ' + (roundIndex + 1) + ' of 5';
  document.getElementById('roundLocation').textContent  = LEVELS[roundIndex].name;
  document.getElementById('gfScore').textContent        = GS.scores.gf;
  document.getElementById('bfScore').textContent        = GS.scores.bf;

  renderStaticGf('introGfDuck', 0.6);
  renderStaticBf('introBfDuck', 0.6);
  renderStaticGf('hudGfDuck', 0.4);
  renderStaticBf('hudBfDuck', 0.4);

  showScreen('screen-game');
  startGameLoop();

  // Countdown overlay
  let count = 3;
  const el = document.getElementById('countdownText');

  // Show countdown as overlay on game screen
  showCountdownOverlay(count);

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      showCountdownOverlay(count);
    } else if (count === 0) {
      showCountdownOverlay('GO! 🦆');
    } else {
      clearInterval(interval);
      hideCountdownOverlay();
      GS.phase = 'running';
    }
  }, 900);
}

// ── Countdown overlay ──────────────────────────────────────
function showCountdownOverlay(text) {
  let el = document.getElementById('countdown-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'countdown-overlay';
    el.style.cssText = `
      position:fixed; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; pointer-events:none;
      z-index:100;
    `;
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div style="
      background:rgba(0,0,0,0.55); border-radius:24px;
      padding:16px 48px; text-align:center;
    ">
      <div style="font-family:'Fredoka One',cursive; font-size:1rem;
        color:rgba(255,255,255,0.7); letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;">
        ${LEVELS[GS.round].name}
      </div>
      <div style="font-family:'Fredoka One',cursive; font-size:5rem; color:#ffb7c5;
        text-shadow:0 0 30px rgba(255,183,197,0.8);">
        ${text}
      </div>
    </div>
  `;
}

function hideCountdownOverlay() {
  const el = document.getElementById('countdown-overlay');
  if (el) el.remove();
}

// ── Round end ──────────────────────────────────────────────
function showRoundEnd(winnerChar) {
  stopGameLoop();
  stopScene();

  const isGfWin = winnerChar === 'gf';
  const msgs = {
    gf: [
      'she said CATCH ME IF YOU CAN bestie 💅💨',
      'ragebaiter got LEFT IN THE DUST lmaoo 😂',
      "she runs fast when she's unhinged fr 😤",
      'ms. short fuse said NOT TODAY SIR 🏃‍♀️',
      'he tried. he failed. she ate. 👏',
    ],
    bf: [
      'CAUGHT HER IN 4K 🎯😏',
      "the rizz was too strong she couldn't escape 💫",
      "ragebaiter said tag you're it bestie 🧢",
      "she ran, he ran faster, it's JOEVER 💀",
      'GOTCHA!! no escape from the ragebaiter 😈',
    ],
  };

  showScreen('screen-round-end');

  // Launch animated canvas scene as full background
  const screen = document.getElementById('screen-round-end');
  screen.style.background = 'none';
  showRoundEndScene(winnerChar, screen);

  // Scoreboard sits on top
  const content2 = document.querySelector('.round-end-content');
  content2.style.position = 'relative';
  content2.style.zIndex = '10';

  document.getElementById('winnerAnnouncement').textContent =
    isGfWin ? '🔥 Ms. Short Fuse Escapes!' : '😎 Ragebaiter Catches Her!';
  document.getElementById('roundEndMsg').textContent =
    msgs[winnerChar][GS.round % msgs[winnerChar].length];
  document.getElementById('reGfScore').textContent = GS.scores.gf;
  document.getElementById('reBfScore').textContent = GS.scores.bf;

  renderStaticGf('reGfDuck', 0.5);
  renderStaticBf('reBfDuck', 0.5);
  document.getElementById('roundEndCanvas').style.display = 'none';

  const maxScore = Math.ceil(5 / 2);
  if (GS.scores.gf >= maxScore || GS.scores.bf >= maxScore || GS.round >= 4) {
    document.getElementById('nextRoundBtn').textContent = 'See Final Result! 🎊';
    document.getElementById('nextRoundBtn').onclick = () => {
      stopScene();
      const finalWinner = GS.scores.gf > GS.scores.bf ? 'gf'
        : GS.scores.bf > GS.scores.gf ? 'bf' : 'tie';
      showGameOver(finalWinner);
      if (isHost()) sendToPeer({ type: 'gameOver', winner: finalWinner });
    };
  } else {
    document.getElementById('nextRoundBtn').textContent = 'Next Round →';
    document.getElementById('nextRoundBtn').onclick = () => { stopScene(); startNextRound(); };
  }
}

function startNextRound() {
  const next = GS.round + 1;
  if (next >= 5) {
    const finalWinner = GS.scores.gf > GS.scores.bf ? 'gf'
      : GS.scores.bf > GS.scores.gf ? 'bf' : 'tie';
    showGameOver(finalWinner);
    if (isHost()) sendToPeer({ type: 'gameOver', winner: finalWinner });
    return;
  }
  if (isHost()) sendToPeer({ type: 'startRound', round: next });
  loadRound(next);
}

// ── Game over ──────────────────────────────────────────────
function showGameOver(winnerChar) {
  stopGameLoop();
  stopScene();
  showScreen('screen-gameover');

  const screen = document.getElementById('screen-gameover');
  screen.style.background = 'none';

  // Hide old elements — scene takes over full screen
  document.getElementById('gameoverCanvas').style.display = 'none';
  document.getElementById('gameoverTitle').style.display = 'none';
  document.getElementById('gameoverMsg').style.display = 'none';
  const old = document.getElementById('gameover-scene');
  if (old) old.remove();

  if (winnerChar === 'gf') {
    // Step 1: beating scene — player presses space 5 times
    showBeatingScene(screen, () => {
      // Step 2: after beating, wedding scene
      stopScene();
      screen.innerHTML = '';
      showWeddingScene(screen);
      addGameOverUI(screen, '🏆 Ms. Short Fuse WINS! 🏆',
        '...and then they got married anyway 💒🥹');
    });
    addBeatingUI(screen);
  } else if (winnerChar === 'bf') {
    showWeddingScene(screen);
    addGameOverUI(screen, '🏆 The Ragebaiter WINS! 🏆',
      'he caught his girl!! time for the wedding 🎊💒');
  } else {
    showWeddingScene(screen);
    addGameOverUI(screen, "💕 It's a TIE! 💕",
      "they're BOTH getting married 💕🦆🦆");
  }
}

function addBeatingUI(screen) {
  // Title shown during beating
  const title = document.createElement('div');
  title.id = 'beating-title';
  title.style.cssText = `
    position:absolute; top:24px; left:50%; transform:translateX(-50%);
    font-family:'Fredoka One',cursive; font-size:clamp(1.8rem,4vw,3rem);
    color:#ff4400; text-shadow:0 0 30px rgba(255,100,0,1),2px 2px 0 #000;
    text-align:center; z-index:20; white-space:nowrap;
  `;
  title.textContent = '🏆 Ms. Short Fuse WINS! 🏆';
  screen.appendChild(title);
}

function addGameOverUI(screen, titleText, msgText) {
  const ui = document.createElement('div');
  ui.style.cssText = `
    position:absolute; bottom:0; left:0; right:0;
    padding:28px 24px 48px;
    background:linear-gradient(to top, rgba(255,255,255,0.95) 60%, rgba(255,255,255,0.6) 85%, transparent 100%);
    display:flex; flex-direction:column; align-items:center; gap:14px;
    z-index:20;
  `;
  ui.innerHTML = `
    <div style="font-family:'Fredoka One',cursive;font-size:clamp(1.8rem,4vw,3rem);color:#3a2a2a;text-align:center;">
      ${titleText}
    </div>
    <div style="font-size:1.1rem;font-weight:800;color:#ff8fab;text-align:center;max-width:500px;">
      ${msgText}
    </div>
    <button class="btn btn-primary" onclick="restartGame()" style="margin-top:8px;">Play Again 💕</button>
  `;
  screen.appendChild(ui);
}


function restartGame() {
  GS = makeGameState();
  sendToPeer({ type: 'startRound', round: 0 });
  loadRound(0);
}