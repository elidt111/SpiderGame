const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gravity = 0.6;
let jumpPower = -12;
let isJumping = false;
let isDucking = false;

const player = {
  x: 50,
  y: 200,
  width: 40,
  height: 50,
  dy: 0
};

let obstacles = [];
let frame = 0;
let gameOver = false;
let score = 0;
let scoreInterval;

const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBuilding(o) {
  ctx.fillStyle = "black";
  ctx.fillRect(o.x, o.y, o.width, o.height);

  // desenhar janelas amarelas
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

  // cruz interna
  ctx.beginPath();
  ctx.moveTo(o.x + o.width / 2, o.y);
  ctx.lineTo(o.x + o.width / 2, o.y + o.height);
  ctx.moveTo(o.x, o.y + o.height / 2);
  ctx.lineTo(o.x + o.width, o.y + o.height / 2);
  ctx.stroke();
}

function drawObstacles() {
  obstacles.forEach(o => {
    if (o.type === "building") {
      drawBuilding(o);
    } else if (o.type === "web") {
      drawWeb(o);
    }
  });
}

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Física do jogador
  player.y += player.dy;
  player.dy += gravity;

  if (player.y + player.height >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.height;
    player.dy = 0;
    isJumping = false;
  }

  // Ducking
  if (isDucking) {
    player.height = 30;
  } else {
    player.height = 50;
  }

  // Criar obstáculos
  if (frame % 90 === 0) {
    const type = Math.random();

    if (type < 0.5) {
      obstacles.push({
        x: canvas.width,
        y: canvas.height - 70,
        width: 40 + Math.random() * 40,
        height: 50 + Math.random() * 60,
        type: "building"
      });
    } else {
      obstacles.push({
        x: canvas.width,
        y: 100 + Math.random() * 100,
        width: 40,
        height: 40,
        type: "web"
      });
    }
  }

  obstacles.forEach(o => {
    o.x -= 6;

    // Colisão
    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      endGame();
    }
  });

  // Remove obstáculos fora da tela
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  drawPlayer();
  drawObstacles();

  frame++;
  requestAnimationFrame(update);
}

function startGame() {
  obstacles = [];
  frame = 0;
  gameOver = false;
  score = 0;
  scoreElement.textContent = "Pontuação: 0";
  restartBtn.style.display = "none";
  update();

  // atualizar pontuação
  clearInterval(scoreInterval);
  scoreInterval = setInterval(() => {
    if (!gameOver) {
      score++;
      scoreElement.textContent = "Pontuação: " + score;
    }
  }, 100);
}

function endGame() {
  gameOver = true;
  restartBtn.style.display = "inline-block";
  clearInterval(scoreInterval);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !isJumping) {
    player.dy = jumpPower;
    isJumping = true;
  }
  if (e.code === "ArrowDown") {
    isDucking = true;
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowDown") {
    isDucking = false;
  }
});

restartBtn.addEventListener("click", () => {
  startGame();
});

// iniciar jogo
startGame();
