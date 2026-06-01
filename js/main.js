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
  renderStaticGf('titleDuckLeft', 0.85);
  renderStaticBf('titleDuckRight', 0.85);
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

  showScreen('screen-round-intro');
  startGameLoop();

  // Countdown
  let count = 3;
  const el = document.getElementById('countdownText');
  el.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      el.textContent = count;
    } else if (count === 0) {
      el.textContent = 'GO! 🦆';
    } else {
      clearInterval(interval);
      showScreen('screen-game');
      GS.phase = 'running';
    }
  }, 900);
}

// ── Round end ──────────────────────────────────────────────
function showRoundEnd(winnerChar) {
  stopGameLoop();

  const isGfWin = winnerChar === 'gf';
  const msgs = {
    gf: [
      'She ESCAPED! Ms. Short Fuse wins! 🏃‍♀️💨',
      'Ragebaiter couldn\'t catch her LOL 😂',
      'She runs FAST when she\'s angry! 💅',
      'Ms. Short Fuse is UNSTOPPABLE! 😤',
      'He tried, he failed, she\'s iconic 👏',
    ],
    bf: [
      'CAUGHT! Ragebaiter wins! 🎯',
      'He got her! Ragebaiter is TOO smooth 😏',
      'She couldn\'t outrun the rizz! 💫',
      'Ragebaiter catches feelings AND ducks 🧢',
      'GOTCHA! He wins this round! 🎉',
    ],
  };
  const msgArr = msgs[winnerChar];

  document.getElementById('winnerAnnouncement').textContent =
    isGfWin ? '🏁 Ms. Short Fuse Escapes!' : '🎯 Ragebaiter Catches Her!';

  document.getElementById('roundEndMsg').textContent =
    msgArr[GS.round % msgArr.length];

  document.getElementById('reGfScore').textContent = GS.scores.gf;
  document.getElementById('reBfScore').textContent = GS.scores.bf;

  renderStaticGf('reGfDuck', 0.5);
  renderStaticBf('reBfDuck', 0.5);

  // Draw round end animation
  const c = document.getElementById('roundEndCanvas');
  const ctx = c.getContext('2d');
  let frame = 0;
  const anim = setInterval(() => {
    if (isGfWin) {
      drawWeddingScene(ctx, c.width, c.height); // preview wedding
    } else {
      drawBeatingScene(ctx, c.width, c.height, frame);
    }
    frame++;
  }, 50);
  setTimeout(() => clearInterval(anim), 3000);

  // Check if game over
  const maxScore = Math.ceil(5 / 2); // first to 3 wins
  if (GS.scores.gf >= maxScore || GS.scores.bf >= maxScore || GS.round >= 4) {
    document.getElementById('nextRoundBtn').textContent =
      (GS.round >= 4) ? 'See Final Result! 🎊' : 'Final Result! 🎊';
    document.getElementById('nextRoundBtn').onclick = () => {
      const finalWinner = GS.scores.gf > GS.scores.bf ? 'gf'
        : GS.scores.bf > GS.scores.gf ? 'bf' : 'tie';
      showGameOver(finalWinner);
      if (isHost()) sendToPeer({ type: 'gameOver', winner: finalWinner });
    };
  } else {
    document.getElementById('nextRoundBtn').textContent = 'Next Round →';
    document.getElementById('nextRoundBtn').onclick = startNextRound;
  }

  showScreen('screen-round-end');
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
  showScreen('screen-gameover');

  const c = document.getElementById('gameoverCanvas');
  const ctx = c.getContext('2d');
  let frame = 0;

  const titles = {
    gf:  '🏆 Ms. Short Fuse WINS! 🏆',
    bf:  '🏆 The Ragebaiter WINS! 🏆',
    tie: '💕 It\'s a TIE! 💕',
  };
  const msgs = {
    gf: 'She escaped AND she\'s getting married! He\'s about to catch these hands first... then the bouquet! 💐👊💒',
    bf: 'The Ragebaiter caught his girl! Time for the wedding! 🎊💒🦆🦆',
    tie: 'They\'re BOTH winners. And they\'re BOTH getting married! 💕🦆🦆',
  };

  document.getElementById('gameoverTitle').textContent = titles[winnerChar] || titles.tie;
  document.getElementById('gameoverMsg').textContent   = msgs[winnerChar]   || msgs.tie;

  const anim = setInterval(() => {
    if (winnerChar === 'gf') {
      drawBeatingScene(ctx, c.width, c.height, frame);
    } else {
      drawWeddingScene(ctx, c.width, c.height);
    }
    frame++;
  }, 50);

  // After beating, show wedding
  if (winnerChar === 'gf') {
    setTimeout(() => {
      clearInterval(anim);
      let wf = 0;
      setInterval(() => { drawWeddingScene(ctx, c.width, c.height); wf++; }, 60);
      document.getElementById('gameoverMsg').textContent = '...and then they got married anyway 💒🦆🦆';
    }, 3500);
  }
}

function restartGame() {
  GS = makeGameState();
  sendToPeer({ type: 'startRound', round: 0 });
  loadRound(0);
}