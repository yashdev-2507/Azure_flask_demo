const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 720;

// Ship control (no heavy inertia)
let spaceship = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 70,
    speed: 6
};

let bullets = [];
let asteroids = [];
let stars = [];
let score = 0;
let gameOver = false;
let asteroidSpeed = 1.5;
let keys = {};
let fireMode = "single"; // "single", "double", "triple"
let fireTimer = 0;

// Key events
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Fire bullets
document.addEventListener("keydown", (e) => {
    if (e.key === " " && !gameOver) fireBullets();
});

function fireBullets() {
    if (fireMode === "single") {
        bullets.push({ x: spaceship.x, y: spaceship.y - 30, width: 5, height: 15 });
    } else if (fireMode === "double") {
        bullets.push({ x: spaceship.x - 12, y: spaceship.y - 30, width: 5, height: 15 });
        bullets.push({ x: spaceship.x + 12, y: spaceship.y - 30, width: 5, height: 15 });
    } else if (fireMode === "triple") {
        bullets.push({ x: spaceship.x, y: spaceship.y - 30, width: 5, height: 15 });
        bullets.push({ x: spaceship.x - 15, y: spaceship.y - 25, width: 5, height: 15 });
        bullets.push({ x: spaceship.x + 15, y: spaceship.y - 25, width: 5, height: 15 });
    }
}

// Stars
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 1 + 0.5
    });
}

// Spawn asteroids
function spawnAsteroid(big = false) {
    let radius = big ? Math.random() * 30 + 40 : Math.random() * 20 + 20;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    asteroids.push({
        x: x,
        y: -radius,
        radius: radius,
        speed: asteroidSpeed + Math.random() * 1.5,
        angle: Math.random() * Math.PI,
        rotation: Math.random() * 0.05 + 0.01,
        color: ["#888", "#777", "#555", "#a0522d"][Math.floor(Math.random() * 4)]
    });
}
setInterval(() => { if (!gameOver) spawnAsteroid(); }, 1500);

// Random chance to drop a power-up
function maybeDropPowerUp() {
    let chance = Math.random();
    if (chance < 0.1) { // 10% chance
        fireMode = "double";
        fireTimer = 600; // ~10s
    } else if (chance < 0.15) { // 5% chance
        fireMode = "triple";
        fireTimer = 480; // ~8s
    }
}

// Draw spaceship
function drawSpaceship() {
    ctx.save();
    ctx.translate(spaceship.x, spaceship.y);

    // Body
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.moveTo(0, -spaceship.height / 2);
    ctx.lineTo(-spaceship.width / 2, spaceship.height / 2);
    ctx.lineTo(spaceship.width / 2, spaceship.height / 2);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(0, -10, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw asteroid
function drawAsteroid(a) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillStyle = a.color;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
        let angle = (i / 7) * Math.PI * 2;
        let r = a.radius + Math.random() * 5;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Title
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("🚀 Space Blaster 🚀", canvas.width / 2 - 100, 30);

    if (!gameOver) {
        // Ship movement (no inertia glide)
        if (keys["ArrowLeft"]) spaceship.x -= spaceship.speed;
        if (keys["ArrowRight"]) spaceship.x += spaceship.speed;
        if (keys["ArrowUp"]) spaceship.y -= spaceship.speed;
        if (keys["ArrowDown"]) spaceship.y += spaceship.speed;

        // Boundaries
        spaceship.x = Math.max(spaceship.width / 2, Math.min(canvas.width - spaceship.width / 2, spaceship.x));
        spaceship.y = Math.max(spaceship.height / 2, Math.min(canvas.height - spaceship.height / 2, spaceship.y));

        // Draw ship
        drawSpaceship();

        // Bullets
        ctx.fillStyle = "yellow";
        bullets.forEach((b, i) => {
            b.y -= 8;
            ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
            if (b.y < 0) bullets.splice(i, 1);
        });

        // Asteroids
        asteroids.forEach((a, i) => {
            a.y += a.speed;
            a.angle += a.rotation;
            drawAsteroid(a);

            if (a.y - a.radius > canvas.height) asteroids.splice(i, 1);

            // Bullet collision
            bullets.forEach((b, j) => {
                if (b.x > a.x - a.radius &&
                    b.x < a.x + a.radius &&
                    b.y > a.y - a.radius &&
                    b.y < a.y + a.radius) {
                    bullets.splice(j, 1);
                    asteroids.splice(i, 1);
                    score += 10;

                    maybeDropPowerUp();

                    // Difficulty scaling
                    if (score % 200 === 0) asteroidSpeed += 0.3;
                    if (score % 100 === 0) spawnAsteroid(true);
                }
            });

            // Ship collision
            if (spaceship.x > a.x - a.radius &&
                spaceship.x < a.x + a.radius &&
                spaceship.y > a.y - a.radius &&
                spaceship.y < a.y + a.radius) {
                gameOver = true;
            }
        });

        // Fire mode timer
        if (fireMode !== "single") {
            fireTimer--;
            if (fireTimer <= 0) fireMode = "single";
        }

        // Score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 20, 60);

    } else {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.fillText("Press F5 to Restart", canvas.width / 2 - 110, canvas.height / 2 + 80);
    }

    requestAnimationFrame(gameLoop);
}
gameLoop();

