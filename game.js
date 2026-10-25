// Хранитель Искры — Web Port для GitHub Pages
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 600;

// --- ЗАГРУЗКА РЕСУРСОВ ---
const IMAGES = {};
const imageNames = [
  'cat_idle', 'cat_idle_left', 'cat_walk', 'cat_walk_left', 'cat_jump', 'cat_jump_left',
  'slime', 'bat', 'portal', 'spike', 'crystal', 'ground', 'platform_wide', 'bg',
  'heart_full', 'heart_empty', 'spark_bullet'
];

imageNames.forEach(name => {
  const img = new Image();
  img.src = `images/${name}.png`;
  IMAGES[name] = img;
});

// Аудио
const TRACKS = [
  new Audio('music/track1.mp3'),
  new Audio('music/track2.mp3'),
  new Audio('music/track3.mp3')
];
TRACKS.forEach(t => {
  t.loop = true;
  t.volume = 0.22;
});

const SOUNDS = {
  jump: new Audio('sounds/jump.mp3'),
  coin: new Audio('sounds/coin.mp3'),
  hit: new Audio('sounds/hit.mp3'),
  win: new Audio('sounds/win.mp3')
};
Object.values(SOUNDS).forEach(s => s.volume = 0.4);

function playSound(name) {
  if (isMuted || !SOUNDS[name]) return;
  const s = SOUNDS[name].cloneNode();
  s.volume = SOUNDS[name].volume;
  s.play().catch(() => {});
}

let currentTrackIdx = 0;
let isMuted = false;
let isAudioStarted = false;

function startMusic() {
  if (!isAudioStarted && !isMuted) {
    isAudioStarted = true;
    TRACKS[currentTrackIdx].play().catch(() => {});
  }
}

function switchTrack(idx) {
  TRACKS[currentTrackIdx].pause();
  TRACKS[currentTrackIdx].currentTime = 0;
  currentTrackIdx = idx % TRACKS.length;
  if (!isMuted && isAudioStarted) {
    TRACKS[currentTrackIdx].play().catch(() => {});
  }
  const label = document.getElementById('musicLabel');
  if (label) label.textContent = `Трек ${currentTrackIdx + 1}`;
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    TRACKS[currentTrackIdx].pause();
    document.getElementById('btnMute').textContent = '🔇';
  } else {
    document.getElementById('btnMute').textContent = '🔊';
    if (isAudioStarted) TRACKS[currentTrackIdx].play().catch(() => {});
  }
}

// --- ДАННЫЕ 6 УРОВНЕЙ ---
const LEVELS_DATA = [
  {
    name: "Уровень 1: Зачарованный лес",
    cat_start: [80, 480],
    platforms: [[160, 440], [330, 360], [480, 280], [710, 220]],
    spikes: [[290, 512], [326, 512]],
    slimes: [{x: 450, y: 508, vx: 1.2, min_x: 380, max_x: 560}],
    bats: [{x: 480, y: 170, vy: 1.0, min_y: 130, max_y: 210}],
    crystals: [[160, 380], [330, 300], [480, 110], [420, 485], [640, 160]],
    portal: [710, 168]
  },
  {
    name: "Уровень 2: Кристальный каньон",
    cat_start: [80, 480],
    platforms: [[180, 430], [340, 370], [200, 280], [360, 210], [550, 220], [710, 280]],
    spikes: [[240, 512], [276, 512], [480, 512], [516, 512]],
    slimes: [{x: 380, y: 508, vx: 1.2, min_x: 320, max_x: 440}],
    bats: [{x: 360, y: 120, vy: 1.1, min_y: 80, max_y: 150}],
    crystals: [[180, 370], [340, 310], [200, 220], [550, 160], [710, 220]],
    portal: [710, 228]
  },
  {
    name: "Уровень 3: Ночные шпили",
    cat_start: [70, 480],
    platforms: [[150, 440], [290, 390], [440, 350], [590, 300], [720, 240]],
    spikes: [[360, 512], [396, 512], [500, 512]],
    slimes: [{x: 220, y: 508, vx: 1.2, min_x: 160, max_x: 280}],
    bats: [
      {x: 440, y: 180, vy: 1.1, min_y: 130, max_y: 230},
      {x: 660, y: 130, vy: 1.0, min_y: 90, max_y: 170}
    ],
    crystals: [[150, 380], [290, 330], [440, 120], [590, 240], [720, 180]],
    portal: [720, 188]
  },
  {
    name: "Уровень 4: Шипастая долина",
    cat_start: [80, 480],
    platforms: [[160, 430], [300, 370], [440, 310], [580, 260], [710, 210]],
    spikes: [
      [210, 512], [246, 512], [282, 512], [318, 512],
      [410, 512], [446, 512], [482, 512], [518, 512]
    ],
    slimes: [{x: 650, y: 508, vx: 1.2, min_x: 600, max_x: 730}],
    bats: [
      {x: 300, y: 190, vy: 1.0, min_y: 140, max_y: 240},
      {x: 580, y: 130, vy: 1.1, min_y: 80, max_y: 170}
    ],
    crystals: [[160, 370], [300, 130], [440, 250], [580, 80], [710, 150]],
    portal: [710, 158]
  },
  {
    name: "Уровень 5: Небесная башня",
    cat_start: [70, 480],
    platforms: [[160, 450], [310, 400], [170, 320], [330, 250], [500, 200], [680, 160]],
    spikes: [[220, 512], [256, 512], [380, 512], [416, 512]],
    slimes: [{x: 480, y: 508, vx: 1.3, min_x: 430, max_x: 540}],
    bats: [
      {x: 170, y: 160, vy: 1.0, min_y: 110, max_y: 200},
      {x: 500, y: 100, vy: 1.1, min_y: 60, max_y: 140}
    ],
    crystals: [[160, 390], [310, 340], [170, 100], [330, 190], [680, 100]],
    portal: [680, 108]
  },
  {
    name: "Уровень 6: Сердце Тьмы (ФИНАЛ)",
    cat_start: [70, 480],
    platforms: [[150, 440], [290, 380], [430, 330], [570, 270], [710, 210]],
    spikes: [[210, 512], [246, 512], [350, 512], [386, 512], [490, 512]],
    slimes: [
      {x: 300, y: 508, vx: 1.4, min_x: 260, max_x: 340},
      {x: 620, y: 508, vx: 1.4, min_x: 560, max_x: 700}
    ],
    bats: [
      {x: 290, y: 180, vy: 1.1, min_y: 130, max_y: 230},
      {x: 570, y: 120, vy: 1.2, min_y: 70, max_y: 160}
    ],
    crystals: [[150, 380], [290, 120], [430, 270], [570, 70], [710, 150]],
    portal: [710, 158]
  }
];

// --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
const MAX_LIVES = 3;
let lives = MAX_LIVES;
let score = 0;
let crystalsFound = 0;
let currentLevelIdx = 0;
let gameState = "play"; // "play", "win", "game_over"
let invulnerableTimer = 0;
let gameTick = 0;
let levelBannerTimer = 90;
let shootCooldown = 0;

let popups = [];
let bullets = [];

// Кот
const cat = {
  x: 80,
  y: 480,
  w: 48,
  h: 48,
  vx: 0,
  vy: 0,
  onGround: false,
  canDoubleJump: true,
  facingRight: true,
  imageName: 'cat_idle'
};

// Элементы уровня
let platforms = [];
let spikes = [];
let slimes = [];
let bats = [];
let crystals = [];
let portal = {x: 710, y: 168, w: 48, h: 80};

// Нижний пол (земля)
const groundBlocks = [];
for (let x = 18; x <= 800 + 36; x += 36) {
  groundBlocks.push({x: x, y: 542, w: 36, h: 36, type: 'ground'});
}

function loadLevel(idx) {
  currentLevelIdx = idx;
  const lvl = LEVELS_DATA[idx];

  cat.x = lvl.cat_start[0];
  cat.y = lvl.cat_start[1];
  cat.vx = 0;
  cat.vy = 0;
  cat.onGround = false;
  cat.canDoubleJump = true;
  invulnerableTimer = 0;
  levelBannerTimer = 90;
  bullets = [];

  // Платформы
  platforms = [...groundBlocks];
  lvl.platforms.forEach(p => {
    platforms.push({x: p[0], y: p[1], w: 108, h: 28, type: 'platform_wide'});
  });

  // Шипы
  spikes = lvl.spikes.map(s => ({x: s[0], y: s[1], w: 36, h: 24}));

  // Слизни
  slimes = lvl.slimes.map(s => ({
    x: s.x, y: s.y, w: 48, h: 48,
    vx: s.vx, min_x: s.min_x, max_x: s.max_x
  }));

  // Мыши
  bats = lvl.bats.map(b => ({
    x: b.x, y: b.y, w: 48, h: 48,
    vy: b.vy, min_y: b.min_y, max_y: b.max_y
  }));

  // Кристаллы
  crystals = lvl.crystals.map(c => ({
    baseX: c[0], baseY: c[1],
    x: c[0], y: c[1], w: 36, h: 36, active: true
  }));

  portal.x = lvl.portal[0];
  portal.y = lvl.portal[1];
}

loadLevel(0);

// --- ВВОД (КЛАВИАТУРА И ТАЧ) ---
const keys = {};

window.addEventListener('keydown', e => {
  startMusic();
  keys[e.code] = true;

  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault();
    handleJump();
  }
  if (['KeyF', 'KeyJ'].includes(e.code)) {
    e.preventDefault();
    handleFire();
  }
  if (e.code === 'Digit1') switchTrack(0);
  if (e.code === 'Digit2') switchTrack(1);
  if (e.code === 'Digit3') switchTrack(2);
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'KeyR') handleRestart();
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function handleJump() {
  if (cat.onGround) {
    cat.vy = -12.5;
    playSound('jump');
  } else if (cat.canDoubleJump) {
    cat.vy = -11.0;
    cat.canDoubleJump = false;
    playSound('jump');
    popups.push({text: 'ДВОЙНОЙ ПРЫЖОК!', x: cat.x, y: cat.y - 20, timer: 20});
  }
}

function handleFire() {
  if (shootCooldown === 0) {
    shootCooldown = 16;
    const bx = cat.x + (cat.facingRight ? 20 : -20);
    const bvx = cat.facingRight ? 9.0 : -9.0;
    bullets.push({x: bx, y: cat.y, w: 16, h: 16, vx: bvx});
    playSound('jump');
  }
}

function handleRestart() {
  if (gameState === 'game_over') {
    lives = MAX_LIVES;
    gameState = 'play';
    loadLevel(currentLevelIdx);
  } else if (gameState === 'win') {
    lives = MAX_LIVES;
    score = 0;
    crystalsFound = 0;
    gameState = 'play';
    loadLevel(0);
  }
}

// Тач-кнопки
function setupTouchButton(id, onStart, onEnd) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = (e) => {
    e.preventDefault();
    startMusic();
    el.classList.add('pressed');
    if (onStart) onStart();
  };
  const end = (e) => {
    e.preventDefault();
    el.classList.remove('pressed');
    if (onEnd) onEnd();
  };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointerleave', end);
  el.addEventListener('pointercancel', end);
}

setupTouchButton('touchLeft', () => keys['KeyA'] = true, () => keys['KeyA'] = false);
setupTouchButton('touchRight', () => keys['KeyD'] = true, () => keys['KeyD'] = false);
setupTouchButton('touchJump', () => handleJump());
setupTouchButton('touchFire', () => handleFire());

// Кнопки интерфейса
document.getElementById('btnMusic').addEventListener('click', () => switchTrack(currentTrackIdx + 1));
document.getElementById('btnMute').addEventListener('click', toggleMute);
document.getElementById('btnRestart').addEventListener('click', handleRestart);
document.getElementById('btnPlay').addEventListener('click', () => {
  document.getElementById('startOverlay').classList.add('hidden');
  startMusic();
});

document.getElementById('btnFullscreen').addEventListener('click', () => {
  const container = document.getElementById('canvasContainer');
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// --- КОЛЛИЗИИ ---
function collides(r1, r2) {
  return !(
    r1.x + r1.w/2 < r2.x - r2.w/2 ||
    r1.x - r1.w/2 > r2.x + r2.w/2 ||
    r1.y + r1.h/2 < r2.y - r2.h/2 ||
    r1.y - r1.h/2 > r2.y + r2.h/2
  );
}

function takeDamage() {
  lives--;
  playSound('hit');
  if (lives <= 0) {
    gameState = 'game_over';
  } else {
    invulnerableTimer = 50;
    cat.vy = -6;
    cat.x -= cat.facingRight ? 30 : -30;
    if (cat.x < 40) cat.x = 40;
  }
}

// --- ИГРОВОЙ ЦИКЛ (UPDATE) ---
function update() {
  gameTick++;

  if (levelBannerTimer > 0) levelBannerTimer--;
  if (shootCooldown > 0) shootCooldown--;

  // Попапы
  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].y -= 1;
    popups[i].timer -= 1;
    if (popups[i].timer <= 0) popups.splice(i, 1);
  }

  if (gameState !== 'play') return;

  if (invulnerableTimer > 0) invulnerableTimer--;

  // Выстрелы
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    if (b.x < 0 || b.x > WIDTH) {
      bullets.splice(i, 1);
      continue;
    }

    let hit = false;
    for (let s = slimes.length - 1; s >= 0; s--) {
      if (collides(b, slimes[s])) {
        const sl = slimes[s];
        slimes.splice(s, 1);
        popups.push({text: '+20 РАЗРЯД!', x: sl.x, y: sl.y - 15, timer: 25});
        score += 20;
        playSound('coin');
        hit = true;
        break;
      }
    }
    if (!hit) {
      for (let bt = bats.length - 1; bt >= 0; bt--) {
        if (collides(b, bats[bt])) {
          const bObj = bats[bt];
          bats.splice(bt, 1);
          popups.push({text: '+25 СБИТА!', x: bObj.x, y: bObj.y - 15, timer: 25});
          score += 25;
          playSound('coin');
          hit = true;
          break;
        }
      }
    }
    if (hit) bullets.splice(i, 1);
  }

  // Перемещение кота (как в Python)
  let moving = false;
  const moveSpeed = 4.5;
  if (keys['ArrowLeft'] || keys['KeyA']) {
    cat.x -= moveSpeed;
    cat.facingRight = false;
    moving = true;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    cat.x += moveSpeed;
    cat.facingRight = true;
    moving = true;
  }

  // Смена спрайта кота
  const suffix = !cat.facingRight ? '_left' : '';
  if (!cat.onGround) {
    cat.imageName = `cat_jump${suffix}`;
  } else if (moving) {
    cat.imageName = `cat_walk${suffix}`;
  } else {
    cat.imageName = `cat_idle${suffix}`;
  }

  // Гравитация (как в Python)
  cat.vy += 0.55;
  cat.y += cat.vy;
  cat.onGround = false;

  // Платформы
  for (let plat of platforms) {
    if (collides(cat, plat) && cat.vy >= 0) {
      const catBottom = cat.y + cat.h / 2;
      const platTop = plat.y - plat.h / 2;
      if (catBottom - cat.vy <= platTop + 14) {
        cat.y = platTop - cat.h / 2 + 1;
        cat.vy = 0;
        cat.onGround = true;
        cat.canDoubleJump = true;
        break;
      }
    }
  }

  // Границы
  if (cat.x - cat.w/2 < 0) cat.x = cat.w/2;
  if (cat.x + cat.w/2 > WIDTH) cat.x = WIDTH - cat.w/2;
  if (cat.y - cat.h/2 > HEIGHT) takeDamage();

  // Враги
  slimes.forEach(sl => {
    sl.x += sl.vx;
    if (sl.x > sl.max_x || sl.x < sl.min_x) sl.vx = -sl.vx;
  });

  bats.forEach(bt => {
    bt.y += bt.vy;
    if (bt.y > bt.max_y || bt.y < bt.min_y) bt.vy = -bt.vy;
  });

  // Кристаллы
  crystals.forEach(c => {
    if (c.active) {
      c.y = c.baseY + Math.sin(gameTick * 0.08 + c.baseX) * 5;
      if (collides(cat, c)) {
        popups.push({text: '+10', x: c.x, y: c.y - 10, timer: 25});
        c.active = false;
        score += 10;
        crystalsFound++;
        playSound('coin');
      }
    }
  });

  // Растаптывание и урон
  for (let s = slimes.length - 1; s >= 0; s--) {
    const sl = slimes[s];
    if (collides(cat, sl)) {
      if (cat.vy > 0 && (cat.y + cat.h/2) <= sl.y + 14) {
        slimes.splice(s, 1);
        cat.vy = -10.5;
        cat.canDoubleJump = true;
        score += 20;
        playSound('coin');
        popups.push({text: '+20 РАСТОПТАН!', x: sl.x, y: sl.y - 15, timer: 30});
      } else if (invulnerableTimer === 0) {
        takeDamage();
        break;
      }
    }
  }

  for (let b = bats.length - 1; b >= 0; b--) {
    const bt = bats[b];
    if (collides(cat, bt)) {
      if (cat.vy > 0 && (cat.y + cat.h/2) <= bt.y + 12) {
        bats.splice(b, 1);
        cat.vy = -11.0;
        cat.canDoubleJump = true;
        score += 25;
        playSound('coin');
        popups.push({text: '+25 СБИТА!', x: bt.x, y: bt.y - 15, timer: 30});
      } else if (invulnerableTimer === 0) {
        takeDamage();
        break;
      }
    }
  }

  // Шипы
  if (invulnerableTimer === 0) {
    for (let sp of spikes) {
      if (collides(cat, sp) && (cat.y + cat.h/2) >= sp.y - sp.h/2 + 8) {
        takeDamage();
        break;
      }
    }
  }

  // Портал
  if (collides(cat, portal)) {
    playSound('win');
    if (currentLevelIdx < LEVELS_DATA.length - 1) {
      loadLevel(currentLevelIdx + 1);
    } else {
      gameState = 'win';
    }
  }
}

// --- ОТРИСОВКА (DRAW) ---
function drawSprite(name, x, y, w, h) {
  const img = IMAGES[name];
  if (img && img.complete) {
    ctx.drawImage(img, x - w/2, y - h/2, w, h);
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Фон
  if (IMAGES['bg'] && IMAGES['bg'].complete) {
    ctx.drawImage(IMAGES['bg'], 0, 0, WIDTH, HEIGHT);
  }

  // Платформы
  platforms.forEach(p => drawSprite(p.type, p.x, p.y, p.w, p.h));

  // Шипы
  spikes.forEach(s => drawSprite('spike', s.x, s.y, s.w, s.h));

  // Портал
  drawSprite('portal', portal.x, portal.y, portal.w, portal.h);

  // Кристаллы
  crystals.forEach(c => {
    if (c.active) drawSprite('crystal', c.x, c.y, c.w, c.h);
  });

  // Пули
  bullets.forEach(b => drawSprite('spark_bullet', b.x, b.y, b.w, b.h));

  // Враги
  slimes.forEach(s => drawSprite('slime', s.x, s.y, s.w, s.h));
  bats.forEach(b => drawSprite('bat', b.x, b.y, b.w, b.h));

  // Кот (мигает при уроне)
  if (invulnerableTimer % 4 < 2) {
    drawSprite(cat.imageName, cat.x, cat.y, cat.w, cat.h);
  }

  // Всплывающие надписи
  ctx.font = 'bold 18px Rubik, sans-serif';
  ctx.textAlign = 'center';
  popups.forEach(p => {
    ctx.fillStyle = '#FFE600';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
  });

  // --- ВЕРХНИЙ HUD ---
  ctx.fillStyle = 'rgba(14, 12, 28, 0.9)';
  ctx.fillRect(0, 0, WIDTH, 48);
  ctx.strokeStyle = 'rgba(65, 55, 110, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(WIDTH, 48);
  ctx.stroke();

  // Номер уровня
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00FFF0';
  ctx.fillText(`LVL ${currentLevelIdx + 1}/6`, 16, 32);

  // Сердечки
  for (let i = 0; i < MAX_LIVES; i++) {
    const hName = i < lives ? 'heart_full' : 'heart_empty';
    drawSprite(hName, 175 + i * 28, 24, 28, 28);
  }

  // Очки
  drawSprite('crystal', 275, 24, 28, 28);
  ctx.fillStyle = '#FFDF00';
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.fillText(`${score}`, 296, 31);

  // Подсказка управления
  ctx.fillStyle = '#80FFB0';
  ctx.font = '14px Rubik, sans-serif';
  ctx.fillText('Пробел x2: Двойной прыжок  |  F: Выстрел', 430, 30);

  // Баннер уровня
  if (levelBannerTimer > 0 && gameState === 'play') {
    const lvlName = LEVELS_DATA[currentLevelIdx].name;
    ctx.fillStyle = 'rgba(15, 12, 35, 0.9)';
    ctx.strokeStyle = '#6450B4';
    ctx.lineWidth = 2;
    ctx.fillRect(160, 80, 480, 50);
    ctx.strokeRect(160, 80, 480, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lvlName, 400, 112);
  }

  // Экраны победы / поражения
  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(18, 35, 25, 0.95)';
    ctx.strokeStyle = '#00FF96';
    ctx.lineWidth = 3;
    ctx.fillRect(110, 140, 580, 300);
    ctx.strokeRect(110, 140, 580, 300);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFE600';
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillText('ПОЛНАЯ ПОБЕДА!', 400, 190);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Rubik, sans-serif';
    ctx.fillText('Вы прошли ВСЕ 6 уровней и спасли Великое Древо!', 400, 235);

    const rank = score >= 450 ? 'S+ (ЛЕГЕНДАРНЫЙ КОТ!)' : score >= 350 ? 'A (ХРАНИТЕЛЬ СВЕТА)' : 'B (ИСКАТЕЛЬ)';
    ctx.fillStyle = '#00FFF0';
    ctx.font = 'bold 22px Rubik, sans-serif';
    ctx.fillText(`Итоговый счет: ${score} очков`, 400, 280);

    ctx.fillStyle = '#FFDF00';
    ctx.font = '18px Rubik, sans-serif';
    ctx.fillText(`Собрано кристаллов: ${crystalsFound} из 30`, 400, 318);

    ctx.fillStyle = '#FFE600';
    ctx.fillText(`Ранг: ${rank}`, 400, 350);

    ctx.fillStyle = '#80FFB0';
    ctx.font = '16px Rubik, sans-serif';
    ctx.fillText('Нажмите [ R ] или кнопку на экране чтобы начать сначала', 400, 405);
  } else if (gameState === 'game_over') {
    ctx.fillStyle = 'rgba(35, 15, 20, 0.95)';
    ctx.strokeStyle = '#FF3C50';
    ctx.lineWidth = 3;
    ctx.fillRect(140, 170, 520, 250);
    ctx.strokeRect(140, 170, 520, 250);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF4055';
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillText('ТЬМА ПОГЛОТИЛА ИСКРУ', 400, 225);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Rubik, sans-serif';
    ctx.fillText(`Уровень ${currentLevelIdx + 1} провален. Очки: ${score}`, 400, 280);

    ctx.fillStyle = '#FFAAA0';
    ctx.fillText('Нажмите [ R ] чтобы повторить этот уровень', 400, 350);
  }
}

// --- ЖЕСТКИЙ ЛОК НА 30 FPS (КАК В PYTHON) ---
const TARGET_FPS = 30;
const STEP = 1000 / TARGET_FPS; // 33.33 мс на кадр
let lastTime = performance.now();
let accumulator = 0;

function loop(currentTime) {
  requestAnimationFrame(loop);

  const dt = currentTime - lastTime;
  lastTime = currentTime;

  accumulator += Math.min(dt, 100);

  // Ровно 30 тиков в секунду, без ускорения
  while (accumulator >= STEP) {
    update();
    accumulator -= STEP;
  }

  draw();
}

requestAnimationFrame((t) => {
  lastTime = t;
  loop(t);
});
