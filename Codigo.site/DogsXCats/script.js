const ATTRS = [
  { key: 'chute', label: 'Chute' },
  { key: 'drible', label: 'Drible' },
  { key: 'passe', label: 'Passe' },
  { key: 'defesa', label: 'Defesa' },
  { key: 'velocidade', label: 'Velocidade' },
];

const TEAMS = {
  cat: {
    name: 'Gatos', emoji: '🐱', cls: 'cat',
    cards: [
      { nome: 'Bigode', pos: 'ATA', emoji: '🐈', chute: 90, drible: 94, passe: 78, defesa: 25, velocidade: 85, img: 'assets/cartas/bigode.png' },
      { nome: 'Faísca', pos: 'ATA', emoji: '😸', chute: 96, drible: 88, passe: 82, defesa: 30, velocidade: 88, img: 'assets/cartas/faisca.png' },
      { nome: 'Nitro', pos: 'MEI', emoji: '😺', chute: 88, drible: 84, passe: 93, defesa: 42, velocidade: 70, img: 'assets/cartas/nitro.png' },
      { nome: 'Shadow', pos: 'ZAG', emoji: '🦁', chute: 48, drible: 52, passe: 70, defesa: 94, velocidade: 72, img: 'assets/cartas/shadow.png' },
      { nome: 'Ravena', pos: 'GOL', emoji: '🧤', chute: 20, drible: 18, passe: 55, defesa: 97, velocidade: 50, img: 'assets/cartas/ravena.png' },
    ],
  },
  dog: {
    name: 'Cachorros', emoji: '🐶', cls: 'dog',
    cards: [
      { nome: 'Ragnarok', pos: 'ATA', emoji: '🐕‍🦺', chute: 95, drible: 90, passe: 70, defesa: 20, velocidade: 84, img: 'assets/cartas/ragnarok.png' },
      { nome: 'Snoot', pos: 'ATA', emoji: '🐕', chute: 89, drible: 85, passe: 78, defesa: 28, velocidade: 82, img: 'assets/cartas/snoot.png' },
      { nome: 'Bolt', pos: 'MEI', emoji: '⚡', chute: 86, drible: 88, passe: 90, defesa: 40, velocidade: 86, img: 'assets/cartas/bolt.png' },
      { nome: 'Brutus', pos: 'ZAG', emoji: '🌭', chute: 45, drible: 48, passe: 68, defesa: 93, velocidade: 68, img: 'assets/cartas/brutus.png' },
      { nome: 'Tormento', pos: 'GOL', emoji: '🐺', chute: 22, drible: 20, passe: 58, defesa: 96, velocidade: 48, img: 'assets/cartas/tormento.png' },
    ],
  },
};

const $ = id => document.getElementById(id);

/* ---------- Som (WebAudio, sem arquivos externos) ---------- */
let audioCtx = null, soundOn = true;

function tone(freq, dur = .12, type = 'sine', delay = 0, vol = .06) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    const t = audioCtx.currentTime + delay;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch (e) { /* sem áudio disponível */ }
}

$('sound-toggle').addEventListener('click', e => {
  soundOn = !soundOn;
  e.target.textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) tone(660, .1, 'triangle');
});

/* ---------- Cartas ---------- */
function overall(card) {
  return Math.round(ATTRS.reduce((s, a) => s + card[a.key], 0) / ATTRS.length);
}

function tierOf(card) {
  const o = overall(card);
  return o >= 72 ? 'gold' : o >= 62 ? 'silver' : 'bronze';
}

function cardHTML(card, teamCls, clickable) {
  const attrs = ATTRS.map(a =>
    `<div class="attr${clickable ? ' clickable' : ''}" data-attr="${a.key}"><span>${a.label}</span><span class="bar"><i style="width:${card[a.key]}%"></i></span><span class="av">${card[a.key]}</span></div>`
  ).join('');

  return `
    <div class="face back">${teamCls === 'cat' ? '🐾' : '🦴'}</div>
    <div class="face front">
      <span class="shine"></span>
      <div class="head"><span>${card.pos}</span><span class="ovr">${overall(card)}</span><span class="pos">#${card.num || ''}</span></div>
      ${card.img
        ? `<img class="card-art" src="${card.img}" alt="Arte da carta ${card.nome}" loading="lazy">`
        : `<div class="emoji">${card.emoji}</div>`}
      <div class="name">${card.nome}</div>
      <div class="attrs">${attrs}</div>
    </div>`;
}

/* ---------- Abas ---------- */
const TABS = ['home', 'howto', 'dogs', 'cats', 'bonus', 'creators', 'support'];

function showTab(tab) {
  document.querySelectorAll('#tabs button').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );

  TABS.forEach(t => {
    const el = $(`tab-${t}`);
    if (!el) return;
    el.classList.toggle('hidden', t !== tab);
    if (t === tab) {
      el.classList.remove('fade');
      void el.offsetWidth;
      el.classList.add('fade');
    }
  });

  tone(420, .06, 'triangle');
}

document.querySelectorAll('#tabs button').forEach(b =>
  b.addEventListener('click', () => showTab(b.dataset.tab))
);

document.querySelectorAll('[data-tab-link]').forEach(b =>
  b.addEventListener('click', () => showTab(b.dataset.tabLink))
);

/* ---------- Galerias dos times ---------- */
function renderGallery(teamKey, galleryId, summaryId) {
  const team = TEAMS[teamKey];
  const total = team.cards.reduce((s, c) => s + ATTRS.reduce((t, a) => t + c[a.key], 0), 0);
  const best = ATTRS.map(a => ({ a, v: team.cards.reduce((s, c) => s + c[a.key], 0) }))
    .sort((x, y) => y.v - x.v)[0].a.label;

  $(summaryId).textContent = `${team.cards.length} cartas — soma total de atributos: ${total} — ponto forte do elenco: ${best}.`;

  $(galleryId).innerHTML = team.cards.map((c, i) =>
    `<div class="card-wrap"><div class="card open ${team.cls} tier-${tierOf(c)}">${cardHTML({ ...c, num: i + 1 }, team.cls, false)}</div></div>`
  ).join('');
}

renderGallery('dog', 'dogs-gallery', 'dogs-summary');
renderGallery('cat', 'cats-gallery', 'cats-summary');

/* ---------- Suporte ---------- */
$('support-form').addEventListener('submit', e => {
  e.preventDefault();
  const nome = e.target.nome.value.trim();
  $('support-ok').textContent = `Obrigado, ${nome}! Sua mensagem foi registrada (simulação — nenhum dado é enviado).`;
  $('support-ok').classList.remove('hidden');
  e.target.reset();
});
