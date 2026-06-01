// ══════════════════════════════════════
//  NETWORK — PeerJS multiplayer
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

// The host registers as "rb-host-CODE"
// The guest connects to "rb-host-CODE"
// Simple, predictable, no timestamp

function createRoom() {
  roomCode = genCode();
  myRole = 'host';
  myChar = 'gf';
  setLobbyStatus('Connecting to server... 🔗', true);
  initHostPeer();
}

function initHostPeer() {
  if (peer) { try { peer.destroy(); } catch(e){} }

  peer = new Peer('rb-host-' + roomCode, {
    debug: 0,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }
  });

  peer.on('open', () => {
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    setLobbyStatus('Waiting for Ragebaiter... 🕊️', true);
  });

  peer.on('connection', (connection) => {
    conn = connection;
    setupConn();
  });

  peer.on('error', (err) => {
    console.warn('Host peer error:', err.type, err.message);
    if (err.type === 'unavailable-id') {
      // Code taken — generate new one
      roomCode = genCode();
      setLobbyStatus('Regenerating code... ⏳', true);
      setTimeout(initHostPeer, 800);
    } else {
      setLobbyStatus('⚠️ ' + err.type + ' — try refreshing the page', false);
    }
  });
}

function joinRoom() {
  const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) {
    document.getElementById('joinStatus').textContent = 'Please enter a 4-letter code!';
    return;
  }
  roomCode = code;
  myRole = 'guest';
  myChar = 'bf';
  document.getElementById('joinStatus').textContent = 'Connecting... 🔗';
  initGuestPeer(code);
}

function initGuestPeer(code) {
  if (peer) { try { peer.destroy(); } catch(e){} }

  peer = new Peer(undefined, {
    debug: 0,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }
  });

  peer.on('open', () => {
    document.getElementById('joinStatus').textContent = 'Finding room... 🔍';
    conn = peer.connect('rb-host-' + code, { reliable: true });
    setupConn();
  });

  peer.on('error', (err) => {
    console.warn('Guest peer error:', err.type, err.message);
    if (err.type === 'peer-unavailable') {
      document.getElementById('joinStatus').textContent = '❌ Room not found. Check the code!';
    } else if (err.type === 'network' || err.type === 'server-error') {
      document.getElementById('joinStatus').textContent = '⚠️ Server issue — try again in a moment';
    } else {
      document.getElementById('joinStatus').textContent = '⚠️ ' + err.type + ' — try refreshing';
    }
  });
}

function setupConn() {
  if (!conn) return;

  // Timeout guard
  const timeout = setTimeout(() => {
    if (!isConnected) {
      const el = document.getElementById('joinStatus') || document.getElementById('lobbyStatus');
      if (el) el.textContent = '⌛ Timed out. Make sure the other person has the room open!';
    }
  }, 15000);

  conn.on('open', () => {
    clearTimeout(timeout);
    isConnected = true;
    emitNet('connected', { role: myRole, char: myChar });
  });

  conn.on('data', (data) => { emitNet('data', data); });

  conn.on('close', () => {
    isConnected = false;
    emitNet('disconnected', {});
  });

  conn.on('error', (err) => {
    console.warn('Conn error:', err);
  });
}

function sendToPeer(payload) {
  if (conn && conn.open) conn.send(payload);
}

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
