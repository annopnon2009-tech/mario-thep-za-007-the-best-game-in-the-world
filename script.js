// --- ส่วนที่ 1: ประกาศตัวแปรและตั้งค่าเสียง (ย้ายมาไว้บนสุด) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// โหลดรูปภาพ (แก้ให้ถูกต้องตามรายชื่อไฟล์ในเครื่องคุณ [6])
const marioImg = new Image();
marioImg.src = 'mario.jpg'; 

const goombaImg = new Image();
goombaImg.src = 'goomba.jpg'; // ใช้ชื่อไฟล์ตามที่ปรากฏในโฟลเดอร์ของคุณ [6]

// ตั้งค่าเสียง (แก้ตามชื่อไฟล์ที่มีนามสกุลซ้อนกันในเครื่องคุณ [6, 7])
const bgMusic = new Audio('bgm.mp3');
const jumpSound = new Audio('jump.mp3');
const hitSound = new Audio('hit.mp3');

bgMusic.loop = true;
bgMusic.volume = 0.5;

let score = 0;
let timeLeft = 60;
let lives = 3;
let gameActive = true;
let timerInterval;
let obstacles = [];

// ข้อมูลตัวละคร
let player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    dy: 0,
    jumpForce: 12,
    gravity: 0.6,
    isGrounded: false
};

// --- ส่วนที่ 2: ฟังก์ชันการทำงาน ---

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLeft--;
        if (timeLeft <= 0) {
            timeLeft = 0;
            handleGameOver();
        }
    }, 1000);
}

function handleCollision() {
    hitSound.play();
    lives--;
    if (lives <= 0) {
        lives = 0;
        handleGameOver();
    }
}

function handleGameOver() {
    gameActive = false;
    clearInterval(timerInterval);
    bgMusic.pause();
    alert("จบเกม! คะแนนของคุณคือ: " + score);
}

function spawnObstacle() {
    if (!gameActive) return;
    obstacles.push({
        x: canvas.width,
        y: 270, // ปรับตำแหน่งให้กูมบ้าที่ตัวสูงยืนบนพื้นพอดี
        width: 40,
        height: 80 // ปรับให้สูงขึ้นตามรูปหอคอยกูมบ้า [8]
    });
    setTimeout(spawnObstacle, Math.random() * 2000 + 1000);
}

function drawUI() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Time: " + timeLeft + "s", 20, 30);
    ctx.fillText("Score: " + score, 20, 60);
    ctx.fillStyle = "red";
    ctx.fillText("Lives: " + "❤️".repeat(lives), 20, 90);
}

function update() {
    if (!gameActive) return;

    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height > 350) {
        player.y = 350 - player.height;
        player.dy = 0;
        player.isGrounded = true;
    }

    obstacles.forEach((obs, index) => {
        obs.x -= 6;
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            obstacles.splice(index, 1);
            handleCollision();
        }
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาดพื้นดิน [5]
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 350, canvas.width, 50);

    // วาดมาริโอ้ (ใช้รูปภาพแทนสี่เหลี่ยม) [5]
    ctx.drawImage(marioImg, player.x, player.y, player.width, player.height);

    // วาดกูมบ้า (Goomba Tower) [5]
    obstacles.forEach(obs => {
        // ต้องใส่ goombaImg เป็นตัวแปรแรกใน drawImage เสมอเพื่อให้ภาพขึ้น
        ctx.drawImage(goombaImg, obs.x, obs.y, obs.width, obs.height);
    });

    drawUI();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- ส่วนที่ 3: ระบบควบคุม ---

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && player.isGrounded && gameActive) {
        player.dy = -player.jumpForce;
        player.isGrounded = false;
        jumpSound.play();
    }
    // คลิกหรือกดปุ่มครั้งแรกเพื่อให้เพลงเริ่มเล่น (ตามกฎเบราว์เซอร์)
    if (bgMusic.paused && gameActive) {
        bgMusic.play().catch(() => {});
    }
});

// เริ่มเกม
startTimer();
spawnObstacle();
gameLoop();