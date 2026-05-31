// ══════════════════════════════════════
//  NETWORK — PeerJS multiplayer layer
// ══════════════════════════════════════

let peer = null;
let conn = null;
let myRole = null;
let myChar = null;
let isConnected = false;
let roomCode = null;

const NET_EVENTS = {};
function onNet(event, fn) { NET_EVENTS[event] = fn; }
function emitNet(event, data) { if (NET_EVENTS[event]) NET_EVENTS[event](data); }

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function createRoom() {
  roomCode = genCode();
  myRole = 'host';
  myChar = 'gf';
  setLobbyStatus('Connecting to server...', false);
  peer = new Peer('ragebaiter-' + roomCode, { debug: 0 });
  peer.on('open', () => {
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    setLobbyStatus('Waiting for Ragebaiter to join... 🕊️', true);
  });
  peer.on('connection', (connection) => { conn = connection; setupConn(); });
  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') { peer.destroy(); createRoom(); }
    else setLobbyStatus('Error: ' + err.message, false);
  });
}

function joinRoom() {
  const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) { document.getElementById('joinStatus').textContent = 'Please enter a 4-letter code!'; return; }
  roomCode = code; myRole = 'guest'; myChar = 'bf';
  document.getElementById('joinStatus').textContent = 'Connecting... 🔗';
  peer = new Peer(undefined, { debug: 0 });
  peer.on('open', () => {
    conn = peer.connect('ragebaiter-' + code, { reliable: true });
    setupConn();
  });
  peer.on('error', () => { document.getElementById('joinStatus').textContent = 'Could not connect. Check the code!'; });
}

function setupConn() {
  conn.on('open', () => { isConnected = true; emitNet('connected', { role: myRole, char: myChar }); });
  conn.on('data', (data) => { emitNet('data', data); });
  conn.on('close', () => { isConnected = false; emitNet('disconnected', {}); });
  conn.on('error', (err) => { console.warn('Connection error:', err); });
}

function sendToPeer(payload) { if (conn && conn.open) conn.send(payload); }

function setLobbyStatus(msg, showDots) {
  const el = document.getElementById('lobbyStatus');
  const dots = document.getElementById('waitingAnim');
  if (el) el.textContent = msg;
  if (dots) dots.style.display = showDots ? 'flex' : 'none';
}

function copyRoomCode() {
  if (!roomCode) return;
  navigator.clipboard.writeText(roomCode).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied! ✓';
    setTimeout(() => btn.textContent = 'Copy Code', 2000);
  });
}

function isHost() { return myRole === 'host'; }
function isGuest() { return myRole === 'guest'; }
function getMyChar() { return myChar; }
