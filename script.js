const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let gameOver = false;
let frame = 0;

// Personagem
const player = {
  x: 50,
  y: 200,
  width: 40,     // Hitbox menor
  height: 40,    // Hitbox menor
  dy: 0,
  gravity: 0.6,  // Mais leve para pulo mais fluido
  jumpPower: -12, // Salto melhor
  isJumping: false,
  isDucking: false,
  sprite: new Image(),
};
player.sprite.src = "assets/1.png";

// Imagens do player
const playerRun = new Image();
playerRun.src = "assets/1.png";

const playerJump = new Image();
playerJump.src = "assets/2.png";

const playerDuck = new Image();
playerDuck.src = "assets/3.png";

// Fundo
const cityBg = new Image();
cityBg.src = "assets/city.png";

let bgX = 0;

// Obstáculos
let obstacles = [];

// Controles
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
    player.sprite = playerJump;
  }
  if (e.code === "ArrowDown" && !player.isJumping) {
    player.isDucking = true;
    player.height = 25;  // Altura abaixado menor
    player.sprite = playerDuck;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    player.isDucking = false;
    player.height = 40;  // Volta para altura normal
    player.sprite = playerRun;
  }
});

// Reiniciar
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  obstacles = [];
  player.y = 200;
  player.dy = 0;
  player.isJumping = false;
  player.isDucking = false;
  player.sprite = playerRun;
  gameOver = false;
  document.getElementById("restartBtn").style.display = "none";
  frame = 0;
  requestAnimationFrame(update);
});

// Fundo
function drawBackground() {
  bgX -= 2;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }
  ctx.drawImage(cityBg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(cityBg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

// Player
function drawPlayer() {
  ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
}

// Obstáculos
function drawBuilding(o) {
  ctx.fillStyle = "black";
  ctx.fillRect(o.x, o.y, o.width, o.height);

  ctx.fillStyle = "yellow";
  const rows = Math.floor(o.height / 20);
  const cols = Math.floor(o.width / 15);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(o.x + c * 15 + 3, o.y + r * 20 + 3, 8, 12);
    }
  }
}

function drawWeb(o) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(o.x + o.width / 2, o.y);
  ctx.lineTo(o.x + o.width, o.y + o.height / 2);
  ctx.lineTo(o.x + o.width / 2, o.y + o.height);
  ctx.lineTo(o.x, o.y + o.height / 2);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(o.x + o.width / 2, o.y);
  ctx.lineTo(o.x + o.width / 2, o.y + o.height);
  ctx.moveTo(o.x, o.y + o.height / 2);
  ctx.lineTo(o.x + o.width, o.y + o.height / 2);
  ctx.stroke();
}

function drawObstacles() {
  obstacles.forEach((o) => {
    if (o.type === "building") drawBuilding(o);
    else if (o.type === "web") drawWeb(o);
  });
}

function updateObstacles() {
  if (frame % 90 === 0) {
    const type = Math.random();
    if (type < 0.5) {
      obstacles.push({
        x: canvas.width,
        y: canvas.height - 60,
        width: 40 + Math.random() * 40,
        height: 50 + Math.random() * 50,
        type: "building",
      });
    } else {
      obstacles.push({
        x: canvas.width,
        y: 100 + Math.random() * 100,
        width: 40,
        height: 40,
        type: "web",
      });
    }
  }

  obstacles.forEach((o) => {
    o.x -= 6;
    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      gameOver = true;
      document.getElementById("restartBtn").style.display = "inline-block";
    }
  });

  obstacles = obstacles.filter((o) => o.x + o.width > 0);
}

// Loop do jogo
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  // Física do player
  player.y += player.dy;
  if (player.y + player.height < canvas.height) {
    player.dy += player.gravity;
  } else {
    player.dy = 0;
    player.isJumping = false;
    if (!player.isDucking) player.sprite = playerRun;
    player.y = canvas.height - player.height;
  }

  drawPlayer();
  updateObstacles();
  drawObstacles();

  // Pontuação
  score++;
  document.getElementById("score").innerText = "Pontuação: " + score;

  frame++;
  requestAnimationFrame(update);
}

update();
