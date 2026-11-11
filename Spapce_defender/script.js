const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const playAgainBtn = document.getElementById('playAgain');

const backgroundMusic = document.getElementById('backgroundMusic');

backgroundMusic.volume = 0.15;

function startBackgroundMusic() {
    backgroundMusic.play().catch(error => {
        console.log("Music playback requires user interaction.");
    });
}

document.addEventListener('click', startBackgroundMusic, { once: true });
document.addEventListener('keydown', startBackgroundMusic, { once: true });

let score = 0;
let lives = 3;
let gameOver = false;

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 30,
    speed: 6,
    dx: 0
};

const lasers = [];
const invaders = [];

const invaderRows = 3;
const invaderCols = 7;
const invaderWidth = 40;
const invaderHeight = 25;
let invaderSpeed = 2;
let invaderDirection = 1;

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

function createInvaders() {
    for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
            invaders.push({
                x: col * (invaderWidth + 20) + 50,
                y: row * (invaderHeight + 20) + 50,
                width: invaderWidth,
                height: invaderHeight,
                alive: true
            });
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;

    if (e.code === 'Space' && !keys.Space) {
        keys.Space = true;
        fireLaser();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

function fireLaser() {
    if (gameOver) return;

    lasers.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 12
    });
}

function update() {
    if (gameOver) return;

    if (keys.ArrowLeft) player.dx = -player.speed;
    else if (keys.ArrowRight) player.dx = player.speed;
    else player.dx = 0;

    player.x += player.dx;

    if (player.x < 0) player.x = 0;

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].y -= lasers[i].speed;

        if (lasers[i].y < 0) {
            lasers.splice(i, 1);
        }
    }

    let hitWall = false;

    invaders.forEach(invader => {
        if (!invader.alive) return;

        invader.x += invaderSpeed * invaderDirection;

        if (
            invader.x + invader.width > canvas.width ||
            invader.x < 0
        ) {
            hitWall = true;
        }
    });

    if (hitWall) {
        invaderDirection *= -1;

        invaders.forEach(invader => {
            if (invader.alive) invader.y += 15;
        });
    }

    lasers.forEach((laser, lIdx) => {
        invaders.forEach((invader) => {
            if (
                invader.alive &&
                laser.x < invader.x + invader.width &&
                laser.x + laser.width > invader.x &&
                laser.y < invader.y + invader.height &&
                laser.y + laser.height > invader.y
            ) {
                invader.alive = false;
                lasers.splice(lIdx, 1);
                score += 10;
                scoreEl.innerText = score;
            }
        });
    });

    if (
        invaders.length > 0 &&
        invaders.every(inv => !inv.alive)
    ) {
        invaderSpeed += 0.5;
        createInvaders();
    }

    invaders.forEach(invader => {
        if (
            invader.alive &&
            invader.y + invader.height >= player.y
        ) {
            gameOver = true;
            playAgainBtn.disabled = false;
            playAgainBtn.innerText = "PLAY AGAIN";
        }
    });
}

function resetGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    invaderSpeed = 1;
    invaderDirection = 1;

    player.x = canvas.width / 2 - player.width / 2;

    lasers.length = 0;
    invaders.length = 0;

    scoreEl.innerText = score;
    livesEl.innerText = lives;

    createInvaders();

    playAgainBtn.disabled = true;
    playAgainBtn.innerText = "PLAY";

    playAgainBtn.blur();
}

playAgainBtn.addEventListener('click', () => {
    if (gameOver) resetGame();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = '#ff3333';
        ctx.font = '40px Courier New';
        ctx.textAlign = 'center';

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = '20px Courier New';

        ctx.fillText(
            "Click Play Again to restart",
            canvas.width / 2,
            canvas.height / 2 + 40
        );

        return;
    }

    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();

    ctx.moveTo(
        player.x + player.width / 2,
        player.y
    );

    ctx.lineTo(
        player.x,
        player.y + player.height
    );

    ctx.lineTo(
        player.x + player.width,
        player.y + player.height
    );

    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff3366';

    lasers.forEach(laser => {
        ctx.fillRect(
            laser.x,
            laser.y,
            laser.width,
            laser.height
        );
    });

    ctx.fillStyle = '#ffcc00';

    invaders.forEach(invader => {
        if (!invader.alive) return;

        ctx.fillRect(
            invader.x,
            invader.y,
            invader.width,
            invader.height
        );

        ctx.fillStyle = '#000';

        ctx.fillRect(
            invader.x + 8,
            invader.y + 6,
            6,
            6
        );

        ctx.fillRect(
            invader.x + invader.width - 14,
            invader.y + 6,
            6,
            6
        );

        ctx.fillStyle = '#ffcc00';
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

createInvaders();
loop();