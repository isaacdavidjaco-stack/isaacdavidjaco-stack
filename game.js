const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const coinsEl = document.getElementById('coins');
const bombsEl = document.getElementById('bombs');
const employeesEl = document.getElementById('employees');
const messageEl = document.getElementById('message');
const buyEmployeeBtn = document.getElementById('buyEmployee');
const buyBombBtn = document.getElementById('buyBomb');
const buyWandBtn = document.getElementById('buyWand');
const buyBootsBtn = document.getElementById('buyBoots');
const buyArmorBtn = document.getElementById('buyArmor');
const buySwordBtn = document.getElementById('buySword');
const buyCarBtn = document.getElementById('buyCar');
const buyMissileBtn = document.getElementById('buyMissile');
const buyTankBtn = document.getElementById('buyTank');
const buyStateBtn = document.getElementById('buyState');

const state = {
  score: 0,
  health: 100,
  coins: 0,
  bombs: 0,
  employees: 0,
  dowers: 100,
  hasWand: false,
  hasBoots: false,
  hasArmor: false,
  hasSword: false,
  hasCar: false,
  hasMissiles: false,
  hasTank: false,
  hasState: false,
  hackMode: false,
  allies: [],
  mudPatches: [],
  inMud: false,
  jobKillCount: 0,
  jobTarget: 10,
  jobReward: 120,
  employeeTimer: 0,
  incomeInterval: 1000,
  enemyMissiles: [],
  gameOver: false,
  keys: {},
  bullets: [],
  enemies: [],
  enemyTimer: 0,
  enemyInterval: 1100,
  lastTime: 0,
};

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 90,
  width: 42,
  height: 64,
  baseSpeed: 6,
  speed: 6,
  fireCooldown: 0,
  wandCooldown: 0,
  swordCooldown: 0,
};

let messageTimeout = null;

function resetGame() {
  state.score = 0;
  state.health = 100;
  state.coins = 0;
  state.bombs = 0;
  state.employees = 0;
  state.dowers = 100;
  state.holtei = 0;
  state.sidey = 0;
  state.sidey = 0;
  state.hasWand = false;
  state.hasBoots = false;
  state.hasArmor = false;
  state.hasSword = false;
  state.hasCar = false;
  state.hasMissiles = false;
  state.hasTank = false;
  state.hasState = false;
  state.hackMode = false;
  state.allies.length = 0;
  state.mudPatches = generateMudPatches();
  state.inMud = false;
  state.jobKillCount = 0;
  state.employeeTimer = 0;
  state.enemyMissiles.length = 0;
  state.bullets.length = 0;
  state.enemies.length = 0;
  state.enemyTimer = 0;
  state.enemyInterval = 1100;
  state.gameOver = false;
  state.lastTime = 0;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 90;
  player.speed = player.baseSpeed;
  player.fireCooldown = 0;
  player.wandCooldown = 0;
  player.swordCooldown = 0;
  messageEl.classList.add('hidden');
  updateHUD();
  requestAnimationFrame(loop);
}

function updateHUD() {
  scoreEl.textContent = `Score: ${state.score}`;
  healthEl.textContent = `Health: ${state.health}`;
  coinsEl.textContent = `Coins: ${state.coins}`;
  bombsEl.textContent = `Bombs: ${state.bombs}`;
  employeesEl.textContent = `Employees: ${state.employees}`;
  document.getElementById('dowers').textContent = `Dowers: ${state.dowers}`;
  document.getElementById('holtei').textContent = `Holtei: ${state.holtei}`;
  document.getElementById('sidey').textContent = `Sidey: ${state.sidey}`;
  document.getElementById('allies').textContent = `Allies: ${state.allies.length}`;
  document.getElementById('jobProgress').textContent = `Job: ${state.jobKillCount}/${state.jobTarget}`;
  document.getElementById('carUpgrade').textContent = `Car upgrade: ${state.hasCar ? 'Yes' : 'No'}`;
  document.getElementById('missileUpgrade').textContent = `Missile guns: ${state.hasMissiles ? 'Yes' : 'No'}`;
  document.getElementById('wandStatus').textContent = `Wand: ${state.hasWand ? 'Yes' : 'No'}`;
  document.getElementById('bootsStatus').textContent = `Boots: ${state.hasBoots ? 'Yes' : 'No'}`;
  document.getElementById('armorStatus').textContent = `Armor: ${state.hasArmor ? 'Yes' : 'No'}`;
  document.getElementById('swordStatus').textContent = `Sword: ${state.hasSword ? 'Yes' : 'No'}`;
  document.getElementById('tankStatus').textContent = `Tank support: ${state.hasTank ? 'Yes' : 'No'}`;
  document.getElementById('stateStatus').textContent = `State HQ: ${state.hasState ? 'Yes' : 'No'}`;
  document.getElementById('hackStatus').textContent = `Hack: ${state.hackMode ? 'on' : 'off'}`;
  updateShopButtons();
}

function updateShopButtons() {
  buyEmployeeBtn.disabled = state.coins < 100;
  buyBombBtn.disabled = state.coins < 50;
  buyWandBtn.disabled = state.hasWand || state.coins < 120;
  buyBootsBtn.disabled = state.hasBoots || state.coins < 130;
  buyArmorBtn.disabled = state.hasArmor || state.coins < 180;
  buySwordBtn.disabled = state.hasSword || state.coins < 140;
  buyCarBtn.disabled = state.hasCar || state.coins < 200;
  buyMissileBtn.disabled = state.hasMissiles || state.coins < 150;
  buyTankBtn.disabled = state.hasTank || state.coins < 260;
  buyStateBtn.disabled = state.hasState || state.coins < 500;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnEnemy() {
  const typeRoll = Math.random();
  let type = 'jet';
  if (typeRoll > 0.85) type = 'monster';
  else if (typeRoll > 0.55) type = 'tank';

  const width = type === 'tank' ? 90 : type === 'monster' ? 60 : randomRange(36, 56);
  const height = type === 'tank' ? 42 : type === 'monster' ? 60 : width * 0.7;
  const x = randomRange(20, canvas.width - width - 20);
  const speed = type === 'tank' ? randomRange(1.2, 2.2) : type === 'monster' ? randomRange(2.6, 3.6) : randomRange(2.4, 4.0);
  const color = type === 'tank' ? '#ff9f45' : type === 'monster' ? '#9d4edd' : `hsl(${randomRange(210, 260)}, 90%, 70%)`;
  const hp = type === 'tank' ? 3 : type === 'monster' ? 2 : 1;

  state.enemies.push({
    x,
    y: -height - 20,
    width,
    height,
    speed,
    color,
    type,
    hp,
    missileTimer: 0,
    missileInterval: randomRange(1800, 3200),
    destroyed: false,
  });
}

function drawPlayer() {
  const { x, y, width, height } = player;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.fillStyle = '#7de3ff';
  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(width / 2, height / 2);
  ctx.lineTo(0, height / 4);
  ctx.lineTo(-width / 2, height / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#005f7f';
  ctx.beginPath();
  ctx.moveTo(0, -height / 2 + 10);
  ctx.lineTo(10, height / 5);
  ctx.lineTo(-10, height / 5);
  ctx.closePath();
  ctx.fill();

  if (state.hasArmor) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
  }
  if (state.hasTank) {
    ctx.strokeStyle = '#ffce7b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2 - 10, -height / 2 - 10, width + 20, height + 20);
  }
  ctx.restore();
}

function drawBullet(bullet) {
  ctx.fillStyle = bullet.color;
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawEnemy(enemy) {
  if (enemy.type === 'tank') {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y + enemy.height * 0.2, enemy.width, enemy.height * 0.7);
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x + 8, enemy.y + enemy.height * 0.3, enemy.width - 16, enemy.height * 0.2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(enemy.x + enemy.width / 2 - 10, enemy.y + enemy.height * 0.05, 20, enemy.height * 0.4);
  } else if (enemy.type === 'monster') {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.fillRect(enemy.x + enemy.width * 0.25, enemy.y + enemy.height * 0.3, enemy.width * 0.5, 6);
  } else {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
    ctx.lineTo(enemy.x + enemy.width * 0.9, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width * 0.1, enemy.y + enemy.height);
    ctx.closePath();
    ctx.fill();
  }
  if (enemy.hp > 1) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(enemy.x, enemy.y - 6, enemy.width * (enemy.hp / (enemy.type === 'tank' ? 3 : 2)), 4);
  }
}

function drawEnemyMissile(missile) {
  ctx.fillStyle = '#ff7a7a';
  ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#08142d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 20; i += 1) {
    const x = i * 50 + ((i % 2) * 25);
    const height = 60 + (i % 3) * 18;
    ctx.fillStyle = 'rgba(102, 132, 238, 0.16)';
    ctx.fillRect(x, canvas.height - height - 120, 32, height);
  }
  ctx.fillStyle = '#0b1d40';
  ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
  ctx.fillStyle = '#1f3b66';
  for (let lane = 0; lane < 3; lane += 1) {
    const y = canvas.height - 120 + lane * 34 + 8;
    ctx.fillRect(0, y, canvas.width, 16);
  }

  ctx.fillStyle = '#6a4f2a';
  state.mudPatches.forEach((patch) => {
    ctx.fillRect(patch.x, patch.y, patch.width, patch.height);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(patch.x + 8, patch.y + 6, patch.width - 16, patch.height - 12);
    ctx.fillStyle = '#6a4f2a';
  });
}

function generateMudPatches() {
  return Array.from({ length: 5 }, () => {
    const width = randomRange(100, 180);
    const height = randomRange(26, 42);
    const y = randomRange(canvas.height - 110, canvas.height - 60);
    return { x: randomRange(30, canvas.width - width - 30), y, width, height };
  });
}

function checkCollision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function showMessage(text, duration = 1200) {
  if (state.gameOver) return;
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    if (!state.gameOver) messageEl.classList.add('hidden');
  }, duration);
}

function update(delta) {
  if (state.gameOver) return;

  const inMud = state.mudPatches.some((patch) => checkCollision(
    { x: player.x, y: player.y, width: player.width, height: player.height },
    patch,
  ));
  const mudFactor = inMud ? 0.5 : 1;
  if (inMud && !state.inMud) {
    state.inMud = true;
    showMessage('Mud slows you down!');
  } else if (!inMud) {
    state.inMud = false;
  }

  if (state.keys.ArrowLeft || state.keys.KeyA) player.x -= player.speed * mudFactor;
  if (state.keys.ArrowRight || state.keys.KeyD) player.x += player.speed * mudFactor;
  if (state.keys.ArrowUp || state.keys.KeyW) player.y -= player.speed * mudFactor;
  if (state.keys.ArrowDown) player.y += player.speed * mudFactor;

  player.x = Math.max(10, Math.min(player.x, canvas.width - player.width - 10));
  player.y = Math.max(10, Math.min(player.y, canvas.height - player.height - 10));

  if (state.keys.Space && player.fireCooldown <= 0) {
    const damage = state.hasMissiles ? 2 : 1;
    const width = state.hasMissiles ? 6 : 4;
    const height = state.hasMissiles ? 18 : 12;
    const color = state.hasMissiles ? '#ffeb7a' : '#ffe066';
    state.bullets.push({ x: player.x + player.width / 2 - width / 2, y: player.y - height, width, height, speed: 12, damage, color });
    player.fireCooldown = 14;
  }

  if (state.keys.KeyQ && state.hasWand && player.wandCooldown <= 0) {
    state.bullets.push({ x: player.x + player.width / 2 - 12, y: player.y - 28, width: 24, height: 24, speed: 10, damage: 2, color: '#c27bff', type: 'magic' });
    player.wandCooldown = 30;
    showMessage('Wand magic!');
  }

  if (state.keys.KeyX && state.hasSword && player.swordCooldown <= 0) {
    state.bullets.push({ x: player.x + player.width / 2 - 24, y: player.y - 40, width: 48, height: 48, speed: 0, damage: 3, color: '#fff66f', type: 'sword', life: 8 });
    player.swordCooldown = 50;
    showMessage('Sword slash!');
  }

  if (player.fireCooldown > 0) player.fireCooldown -= 1;
  if (player.wandCooldown > 0) player.wandCooldown -= 1;
  if (player.swordCooldown > 0) player.swordCooldown -= 1;

  player.speed = player.baseSpeed + (state.hasBoots ? 2 : 0) + (state.hasCar ? 1 : 0);

  state.bullets = state.bullets.filter((bullet) => {
    if (bullet.type === 'sword') {
      bullet.life -= 1;
      return bullet.life > 0;
    }
    bullet.y -= bullet.speed;
    return bullet.y + bullet.height > 0 && !bullet.destroyed;
  });

  state.enemyTimer += delta;
  if (state.enemyTimer > state.enemyInterval) {
    state.enemyTimer = 0;
    spawnEnemy();
    if (state.enemyInterval > 550) state.enemyInterval -= 12;
  }

  state.enemies = state.enemies.filter((enemy) => {
    const speedModifier = state.hackMode ? 0.6 : 1;
    enemy.y += enemy.speed * speedModifier;

    if (enemy.type === 'tank') {
      enemy.x += Math.sin(enemy.y * 0.03) * 0.7;
      enemy.x = Math.max(10, Math.min(enemy.x, canvas.width - enemy.width - 10));
    }
    if (enemy.type === 'monster') {
      enemy.x += Math.sin(enemy.y * 0.05) * 1.2;
      enemy.x = Math.max(10, Math.min(enemy.x, canvas.width - enemy.width - 10));
    }

    if (enemy.type !== 'jet' && enemy.y > canvas.height - 90 && Math.random() < 0.02) {
      state.enemyMissiles.push({ x: enemy.x + enemy.width / 2 - 5, y: enemy.y + enemy.height, width: 10, height: 18, speed: 4 });
    }

    if (enemy.y > canvas.height) {
      state.health -= enemy.type === 'tank' ? 20 : 10;
      return false;
    }

    if (checkCollision({ x: player.x, y: player.y, width: player.width, height: player.height }, enemy)) {
      state.health -= state.hasArmor ? 10 : enemy.type === 'tank' ? 30 : 20;
      return false;
    }

    for (const bullet of state.bullets) {
      if (!bullet.destroyed && checkCollision({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, enemy)) {
        enemy.hp -= bullet.damage;
        bullet.destroyed = true;
        if (enemy.hp <= 0) {
          enemy.destroyed = true;
          const reward = enemy.type === 'tank' ? 45 : enemy.type === 'monster' ? 35 : 20;
          state.score += reward;
          state.coins += reward;
          if (enemy.type === 'jet') {
            state.jobKillCount += 1;
            if (state.jobKillCount >= state.jobTarget) {
              state.coins += state.jobReward;
              showMessage(`Job reward +${state.jobReward}`);
              state.jobKillCount = 0;
            }
          }
        }
      }
    }

    return !enemy.destroyed;
  });

  state.enemyMissiles = state.enemyMissiles.filter((missile) => {
    missile.y += missile.speed * (state.hackMode ? 0.8 : 1);
    if (missile.y > canvas.height) return false;
    if (checkCollision({ x: player.x, y: player.y, width: player.width, height: player.height }, missile)) {
      state.health -= state.hasArmor ? 10 : 15;
      return false;
    }
    return true;
  });

  state.allies.forEach((ally) => {
    ally.y -= ally.speed;
    if (ally.y < -ally.height) {
      ally.y = canvas.height + 10;
      ally.x = randomRange(40, canvas.width - 60);
    }
  });

  state.allies = state.allies.filter((ally) => {
    state.enemies.forEach((enemy) => {
      if (!enemy.destroyed && checkCollision({ x: ally.x, y: ally.y, width: ally.width, height: ally.height }, enemy)) {
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          enemy.destroyed = true;
          state.score += 8;
          state.coins += 8;
        }
      }
    });
    return true;
  });

  state.employeeTimer += delta;
  if (state.employeeTimer > state.incomeInterval) {
    state.employeeTimer -= state.incomeInterval;
    state.coins += state.employees * 5;
  }

  if (state.hasState && Math.random() < 0.01) {
    state.coins += 2;
  }

  if (state.health <= 0) {
    state.health = 0;
    endGame();
  }

  updateHUD();
}

function draw() {
  drawBackground();
  state.bullets.forEach((bullet) => {
    if (bullet.type === 'magic') {
      ctx.strokeStyle = bullet.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width, 0, Math.PI * 2);
      ctx.stroke();
    } else if (bullet.type === 'sword') {
      ctx.strokeStyle = bullet.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      drawBullet(bullet);
    }
  });
  state.enemies.forEach(drawEnemy);
  state.enemyMissiles.forEach(drawEnemyMissile);
  state.allies.forEach((ally) => {
    ctx.fillStyle = ally.color;
    ctx.beginPath();
    ctx.arc(ally.x + ally.width / 2, ally.y + ally.height / 2, ally.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  drawPlayer();
}

function endGame() {
  state.gameOver = true;
  messageEl.textContent = `Game Over — Final Score: ${state.score}. Press Enter to restart.`;
  messageEl.classList.remove('hidden');
}

function loop(timestamp) {
  const delta = timestamp - state.lastTime;
  state.lastTime = timestamp;
  update(delta);
  draw();
  if (!state.gameOver) requestAnimationFrame(loop);
}

function useBomb() {
  if (state.bombs <= 0 || state.gameOver) return;
  state.bombs -= 1;
  const count = state.enemies.length;
  state.enemies.length = 0;
  state.enemyMissiles.length = 0;
  state.score += count * 5;
  state.coins += count * 3;
  showMessage('Bomb exploded!');
  updateHUD();
}

function buyEmployee() {
  if (state.coins < 100) return;
  state.coins -= 100;
  state.employees += 1;
  showMessage('Employee hired!');
  updateHUD();
}

function buyBomb() {
  if (state.coins < 50) return;
  state.coins -= 50;
  state.bombs += 1;
  showMessage('Bomb purchased!');
  updateHUD();
}

function buyWand() {
  if (state.coins < 120 || state.hasWand) return;
  state.coins -= 120;
  state.hasWand = true;
  showMessage('Wand bought! Press Q to cast.');
  updateHUD();
}

function buyBoots() {
  if (state.coins < 130 || state.hasBoots) return;
  state.coins -= 130;
  state.hasBoots = true;
  showMessage('Boots bought! Move faster.');
  updateHUD();
}

function buyArmor() {
  if (state.coins < 180 || state.hasArmor) return;
  state.coins -= 180;
  state.hasArmor = true;
  state.health = Math.min(state.health + 40, 280);
  showMessage('Armor equipped!');
  updateHUD();
}

function buySword() {
  if (state.coins < 140 || state.hasSword) return;
  state.coins -= 140;
  state.hasSword = true;
  showMessage('Sword bought! Press X to slash.');
  updateHUD();
}

function buyCar() {
  if (state.coins < 200 || state.hasCar) return;
  state.coins -= 200;
  state.hasCar = true;
  state.health = Math.min(state.health + 30, 280);
  showMessage('Car upgrade installed!');
  updateHUD();
}

function buyMissile() {
  if (state.coins < 150 || state.hasMissiles) return;
  state.coins -= 150;
  state.hasMissiles = true;
  showMessage('Missile guns ready!');
  updateHUD();
}

function buyTank() {
  if (state.coins < 260 || state.hasTank) return;
  state.coins -= 260;
  state.hasTank = true;
  state.health = Math.min(state.health + 50, 300);
  showMessage('Tank support arrived!');
  updateHUD();
}

function buyState() {
  if (state.coins < 500 || state.hasState) return;
  state.coins -= 500;
  state.hasState = true;
  state.allies.push({ x: 80, y: canvas.height + 30, width: 24, height: 24, speed: 1.5, color: '#7dffab' });
  state.allies.push({ x: canvas.width - 110, y: canvas.height + 30, width: 24, height: 24, speed: 1.5, color: '#7dffab' });
  showMessage('State HQ purchased! Allies join.');
  updateHUD();
}

function toggleHack() {
  state.hackMode = !state.hackMode;
  showMessage(`Hacks ${state.hackMode ? 'ON' : 'OFF'}`);
  updateHUD();
}

buyEmployeeBtn.addEventListener('click', buyEmployee);
buyBombBtn.addEventListener('click', buyBomb);
buyWandBtn.addEventListener('click', buyWand);
buyBootsBtn.addEventListener('click', buyBoots);
buyArmorBtn.addEventListener('click', buyArmor);
buySwordBtn.addEventListener('click', buySword);
buyCarBtn.addEventListener('click', buyCar);
buyMissileBtn.addEventListener('click', buyMissile);
buyTankBtn.addEventListener('click', buyTank);
buyStateBtn.addEventListener('click', buyState);

// Mobile / touch controls setup
function setupMobileControls() {
  const container = document.getElementById('mobileControls');
  if (!container) return;
  const buttons = container.querySelectorAll('.m-btn');
  buttons.forEach((btn) => {
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    const onDown = (e) => {
      e.preventDefault();
      if (action) {
        if (action === 'bomb') useBomb();
        if (action === 'hack') toggleHack();
        if (action === 'restart' && state.gameOver) resetGame();
      } else if (key) {
        state.keys[key] = true;
      }
    };
    const onUp = (e) => {
      e && e.preventDefault();
      if (key) state.keys[key] = false;
    };
    btn.addEventListener('touchstart', onDown, { passive: false });
    btn.addEventListener('touchend', onUp);
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('dragstart', (ev) => ev.preventDefault());
  });
  // Prevent scrolling when interacting with canvas on touch devices
  canvas.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
}

setupMobileControls();

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    state.keys.Space = true;
    event.preventDefault();
  }
  if (event.code === 'KeyB') useBomb();
  if (event.code === 'KeyS') toggleHack();
  if (event.code === 'Enter' && state.gameOver) resetGame();
  state.keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  state.keys[event.code] = false;
});

resetGame();
