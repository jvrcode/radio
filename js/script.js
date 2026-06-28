const N = 16;
const wrap = document.getElementById('eq-bars');
const bars = [];
for (let i = 0; i < N; i++) {
  const b = document.createElement('div');
  b.className = 'eq-bar flat';
  const lo = (3 + Math.random() * 8).toFixed(1) + 'px';
  const hi = (28 + Math.random() * 32).toFixed(1) + 'px';
  const dur = (0.35 + Math.random() * 0.55).toFixed(2) + 's';
  const del = (Math.random() * 0.4).toFixed(2) + 's';
  b.style.cssText = `--lo:${lo};--hi:${hi};animation-duration:${dur};animation-delay:${del};height:${lo}`;
  wrap.appendChild(b);
  bars.push(b);
}

function setEQ(on) { bars.forEach(b => b.classList.toggle('flat', !on)); }

function setTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-lbl').textContent = isDark ? 'Light' : 'Dark';
  document.getElementById('theme-chk').checked = isDark;
}

const audio = document.getElementById('audio');
let playing = false;
let userStopped = false;

function onUrlChange() {
  const v = document.getElementById('stream-url').value.trim();
  try {
    const u = new URL(v);
    document.getElementById('play-host').textContent = u.hostname + (u.port ? ':' + u.port : '');
  } catch { document.getElementById('play-host').textContent = '—'; }
}

function toggleStream() {
  const url = document.getElementById('stream-url').value.trim();
  if (!url) { setStatus('error', 'No stream URL'); return; }
  playing ? stop() : start(url);
}

function start(url) {
  userStopped = false;
  setStatus('buffering', 'Connecting…');
  audio.src = url;
  audio.volume = document.getElementById('vol-range').value / 100;
  audio.play().catch(e => { setStatus('error', e.message.slice(0, 40)); setEQ(false); });
}

function stop() {
  userStopped = true;
  audio.pause(); audio.src = '';
  playing = false; btnOff();
  setStatus('off', 'Stream stopped · Click ▶ to listen'); setEQ(false);
}

audio.addEventListener('playing', () => {
  playing = true; btnOn();
  setStatus('live', 'On Air'); setEQ(true);
});
audio.addEventListener('waiting', () => setStatus('buffering', 'Buffering…'));
audio.addEventListener('error', () => {
  if (userStopped) { userStopped = false; return; }
  playing = false; btnOff();
  setStatus('off', 'Stream stopped · Click ▶ — Radio is Live'); setEQ(false);
});

function btnOn() {
  const b = document.getElementById('btn-play');
  b.classList.add('on');
  document.getElementById('ico-play').style.display = 'none';
  document.getElementById('ico-stop').style.display = 'block';
}

function btnOff() {
  const b = document.getElementById('btn-play');
  b.classList.remove('on');
  document.getElementById('ico-play').style.display = 'block';
  document.getElementById('ico-stop').style.display = 'none';
}

function setStatus(type, msg) {
  const c = document.getElementById('chip');
  c.className = 'status-chip' + (type === 'live' ? ' live' : type === 'buffering' ? ' buffering' : type === 'error' ? ' error' : '');
  document.getElementById('chip-txt').textContent = msg;
}

function setVol(v) {
  audio.volume = v / 100;
  document.getElementById('vol-val').textContent = v + '%';
}

async function pasteUrl() {
  try {
    const t = await navigator.clipboard.readText();
    if (t.startsWith('http')) {
      document.getElementById('stream-url').value = t;
      onUrlChange();
    }
  } catch {}
}

const _chk = document.getElementById('theme-chk');
const _isDark = document.documentElement.getAttribute('data-theme') === 'dark';
_chk.checked = _isDark;
document.getElementById('theme-lbl').textContent = _isDark ? 'Light' : 'Dark';
_chk.onchange = function() { setTheme(this.checked); };

function toggleChat() {
  const widget = document.getElementById('chat-widget');
  const textEl = document.querySelector('.chat-btn-text');
  const isOpen = widget.style.display === 'block';
  widget.style.display = isOpen ? 'none' : 'block';
  if (textEl) textEl.textContent = isOpen ? 'Live Chat' : '✕ Close';
}

document.getElementById('btn-play').addEventListener('click', toggleStream);
document.getElementById('vol-range').addEventListener('input', function () { setVol(this.value); });
document.getElementById('chat-btn').addEventListener('click', toggleChat);
