const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreboard = document.getElementById("scoreboard");

let basket = { x: 180, y: 550, width: 60, height: 30, targetX: 180 };
let blocks = [];
let score = 0;
let level = 1;
let blockSpeed = 1;
let lives = 5;
const maxLives = 5;

let moveLeft = false;
let moveRight = false;
let gameOver = false;

// Generate random blocks
function spawnBlock() {
    if (!gameOver) {
        let type = Math.random() < 0.7 ? 'green' : 'red';
        let x = Math.random() * (canvas.width - 30);
        blocks.push({ x: x, y: -30, width: 30, height: 30, type: type });
    }
}
setInterval(spawnBlock, 1000);

// Draw basket as U-shape
function drawBasket() {
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    ctx.clearRect(basket.x + 5, basket.y, basket.width - 10, 5);
}

// Draw blocks
function drawBlocks() {
    blocks.forEach(b => {
        ctx.fillStyle = b.type === 'green' ? 'lime' : 'red';
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
}

// Draw lives using emoji
function drawLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    let heartString = '';
    for (let i = 0; i < lives; i++) heartString += '❤️ ';
    ctx.fillText(heartString, 10, 30);
}

// Update blocks
function updateBlocks() {
    if (gameOver) return;

    blocks.forEach((b, index) => {
        b.y += blockSpeed;

        // Collision with basket
        if(b.y + b.height > basket.y && b.y < basket.y + basket.height &&
           b.x + b.width > basket.x && b.x < basket.x + basket.width) {
            if(b.type === 'green') score += 10;
            else {
                score -= 5;
                lives--;
                if(lives <= 0){
                    gameOver = true;
                }
            }
            blocks.splice(index, 1);
        }

        // Remove blocks that fall out
        if(b.y > canvas.height) blocks.splice(index, 1);
    });

    // Gradual speed increase: +0.2 per 100 points
    blockSpeed = 1 + Math.floor(score / 100) * 0.2;

    level = Math.floor(score / 100) + 1;

    // Update scoreboard below canvas
    scoreboard.innerText = `Score: ${score} | Level: ${level}`;
}

// Smooth basket movement
function updateBasket() {
    if(moveLeft && basket.x > 0) basket.targetX -= 5;
    if(moveRight && basket.x + basket.width < canvas.width) basket.targetX += 5;

    basket.x += (basket.targetX - basket.x) * 0.2;
}

// Draw Game Over screen
function drawGameOver() {
    // Dark semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rounded box
    const boxX = 50, boxY = 200, boxWidth = 300, boxHeight = 200, radius = 20;
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxWidth - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
    ctx.lineTo(boxX + radius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Game Over text
    ctx.font = '28px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('💥 GAME OVER 💥', canvas.width / 2, boxY + 60);

    // Final score
    ctx.font = '22px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, boxY + 110);

    // Play Again button
    const btnX = boxX + 70, btnY = boxY + 140, btnWidth = 160, btnHeight = 40;
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Play Again', canvas.width / 2, btnY + 27);
}


// Check click for Play Again button
canvas.addEventListener('click', function(e){
    if(gameOver){
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if(clickX >= 120 && clickX <= 280 && clickY >= 350 && clickY <= 390){
            // Reset game
            gameOver = false;
            score = 0;
            lives = maxLives;
            blocks = [];
            blockSpeed = 1;
        }
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();
    drawBlocks();
    updateBlocks();
    updateBasket();
    drawLives();

    if(gameOver) drawGameOver();

    requestAnimationFrame(gameLoop);
}

// Key controls
document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") moveLeft = true;
    if(e.key === "ArrowRight") moveRight = true;
});
document.addEventListener("keyup", (e) => {
    if(e.key === "ArrowLeft") moveLeft = false;
    if(e.key === "ArrowRight") moveRight = false;
});

gameLoop();
