"use strict";
console.log('loaded');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameOver = false;
let score = 0;
let lives = 3;
let gamepadConnected = false;

function displayScore() {
    ctx.font = '24px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
}

function displayLives() {
    for (let i = 0; i < lives; i++) {
        ctx.save();
        ctx.translate(20 + i * 30, canvas.height - 40);
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
    }
}

function displayGamepadStatus() {
    ctx.font = '16px sans-serif';
    ctx.fillStyle = gamepadConnected ? 'lime' : 'red';
    ctx.textAlign = 'left';
    ctx.fillText(gamepadConnected ? 'Gamepad connected' : 'No gamepad connected', 10, 20);
}

window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad);
    gamepadConnected = true;
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected:', e.gamepad);
    gamepadConnected = false;
});


class Spaceship {
    constructor() {
        this.x = canvas.width / 8;
        this.y = canvas.height / 8;
        this.angle = 0;
        this.speedX = 0; // Update the initial velocity
        this.speedY = 0;
        this.rotationSpeed = 5;
        this.acceleration = 0.1;
        this.mass = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x + Math.cos(this.angle) * 20, this.y + Math.sin(this.angle) * 20);
        ctx.lineTo(this.x + Math.cos(this.angle + Math.PI * 1.3) * 10, this.y + Math.sin(this.angle + Math.PI * 1.3) * 10);
        ctx.lineTo(this.x + Math.cos(this.angle + Math.PI * 1.7) * 10, this.y + Math.sin(this.angle + Math.PI * 1.7) * 10);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update() {
        this.speedX *= 0.99; // Apply friction
        this.speedY *= 0.99;

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap the spaceship around the canvas edges
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
}

class EnemySpaceship {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2;

        this.targetPlayer = false;
        this.targetPlayerTimer = 0;
        this.mass = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x + Math.cos(this.angle) * 20, this.y + Math.sin(this.angle) * 20);
        ctx.lineTo(this.x + Math.cos(this.angle + Math.PI * 1.3) * 10, this.y + Math.sin(this.angle + Math.PI * 1.3) * 10);
        ctx.lineTo(this.x + Math.cos(this.angle + Math.PI * 1.7) * 10, this.y + Math.sin(this.angle + Math.PI * 1.7) * 10);
        ctx.closePath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update() {
        this.targetPlayerTimer++;

        // Approximately once every 20 seconds, toggle the enemy's targeting behavior
        if (this.targetPlayerTimer >= 20 * 60) {
            this.targetPlayer = !this.targetPlayer;
            this.targetPlayerTimer = 0;
        }

        if (this.targetPlayer) {
            // Turn towards the player
            const angleToPlayer = Math.atan2(spaceship.y - this.y, spaceship.x - this.x);
            this.angle = angleToPlayer;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
}

class Star {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 20;
        this.gravity = 0.005;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.radius = 5;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

const projectiles = [];

function fireProjectile() {
    const projectile = new Projectile(spaceship.x, spaceship.y, spaceship.angle);
    projectiles.push(projectile);
}

function checkProjectileCollision(projectile, enemySpaceship) {
    const distance = Math.sqrt((projectile.x - enemySpaceship.x) ** 2 + (projectile.y - enemySpaceship.y) ** 2);
    return distance < (projectile.radius + 20);
}

function applyGravity(obj, star) {
    const dx = star.x - obj.x;
    const dy = star.y - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = star.gravity * obj.mass;
    const angle = Math.atan2(dy, dx);

    obj.speedX += Math.cos(angle) * force;
    obj.speedY += Math.sin(angle) * force;
}

// function checkCollision(spaceship, enemy) {
//     const distance = Math.sqrt((spaceship.x - enemy.x) ** 2 + (spaceship.y - enemy.y) ** 2);
//     return distance < 30; // Check if distance is less than the sum of their radii
// }

function checkCollision(obj, star) {
    const distance = Math.sqrt((obj.x - star.x) ** 2 + (obj.y - star.y) ** 2);
    return distance < (star.radius + 20); // Check if distance is less than the sum of their radii
}

function checkSpaceshipCollision(spaceship1, spaceship2) {
    const distance = Math.sqrt((spaceship1.x - spaceship2.x) ** 2 + (spaceship1.y - spaceship2.y) ** 2);
    return distance < 40; // Check if distance is less than the sum of their approximate radii
}

function drawExplosion(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'orange';
    ctx.fill();
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
}

const spaceship = new Spaceship();
const enemySpaceship = new EnemySpaceship();
const star = new Star();

function respawnEnemy() {
    console.log('respawn enemy')
    let newX, newY, distanceToStar, distanceToPlayer;
    const minDistanceToStar = 100;
    const minDistanceToPlayer = 150;

    do {
        newX = Math.random() * canvas.width;
        newY = Math.random() * canvas.height;
        distanceToStar = Math.sqrt((newX - star.x) ** 2 + (newY - star.y) ** 2);
        distanceToPlayer = Math.sqrt((newX - spaceship.x) ** 2 + (newY - spaceship.y) ** 2);
    } while (distanceToStar < minDistanceToStar || distanceToPlayer < minDistanceToPlayer);

    enemySpaceship.x = newX;
    enemySpaceship.y = newY;
}

function respawnPlayer() {
    let newX, newY, distanceToStar, distanceToEnemy;
    const minDistanceToStar = 100;
    const minDistanceToEnemy = 150;

    do {
        newX = Math.random() * canvas.width;
        newY = Math.random() * canvas.height;
        distanceToStar = Math.sqrt((newX - star.x) ** 2 + (newY - star.y) ** 2);
        distanceToEnemy = Math.sqrt((newX - enemySpaceship.x) ** 2 + (newY - enemySpaceship.y) ** 2);
    } while (distanceToStar < minDistanceToStar || distanceToEnemy < minDistanceToEnemy);

    spaceship.x = newX;
    spaceship.y = newY;
}

function handleGamepadInput() {
    const gamepads = navigator.getGamepads();
    if (!gamepads[0]) return;

    const gamepad = gamepads[0];

    // Map gamepad buttons and axes to game actions
    const thrustButton = gamepad.buttons[0]; // Change the index to match your gamepad
    const shootButton = gamepad.buttons[1]; // Change the index to match your gamepad
    const rotationAxis = gamepad.axes[0]; // Change the index to match your gamepad

    // Handle thrust
    if (thrustButton.pressed) {
        spaceship.thrust();
    }

    // Handle rotation
    if (Math.abs(rotationAxis) > 0.1) {
        spaceship.rotate(rotationAxis);
    }

    // Handle shooting
    if (shootButton.pressed && !shootButton.lastPressed) {
        shootProjectile();
    }
    shootButton.lastPressed = shootButton.pressed;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyGravity(spaceship, star);
    applyGravity(enemySpaceship, star);

    displayGamepadStatus();
    handleGamepadInput();

    spaceship.update();
    spaceship.draw();

    enemySpaceship.update();
    enemySpaceship.draw();

    star.draw();

    displayScore();
    displayLives();

    projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();

        if (checkProjectileCollision(projectile, enemySpaceship)) {
            projectiles.splice(index, 1);
            drawExplosion(enemySpaceship.x, enemySpaceship.y);
            score++;
            respawnEnemy();
        }
    });

    if (checkCollision(spaceship, star)) {
        drawExplosion(spaceship.x, spaceship.y);
        lives--;
        if (lives > 0) {
            respawnPlayer();
        } else {
            gameOver = true;
        }
    } else if (checkCollision(enemySpaceship, star)) {
        drawExplosion(enemySpaceship.x, enemySpaceship.y);
        score++;
        respawnEnemy();
    } else if (checkSpaceshipCollision(spaceship, enemySpaceship)) {
        drawExplosion(spaceship.x, spaceship.y);
        lives--;
        if (lives > 0) {
            respawnPlayer();
        } else {
            gameOver = true;
        }
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        spaceship.speedX += Math.cos(spaceship.angle) * spaceship.acceleration;
        spaceship.speedY += Math.sin(spaceship.angle) * spaceship.acceleration;
    }
    if (e.key === 'ArrowLeft') spaceship.angle -= spaceship.rotationSpeed * (Math.PI / 180);
    if (e.key === 'ArrowRight') spaceship.angle += spaceship.rotationSpeed * (Math.PI / 180);
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        fireProjectile();
    }
});