import Player, {pressRight, pressLeft} from "/player.js";
const player = new Player();

const canvas = document.getElementById("gameCanvas");
const backgroundCanvas = document.createElement("canvas");
const foregroundCanvas = document.createElement("canvas");

const context = canvas.getContext("2d");
const backgroundContext = backgroundCanvas.getContext("2d");
const foregroundContext = foregroundCanvas.getContext("2d");

const gameContainer = document.getElementById("game-container");
const menuContainer = document.getElementById("menu-container");
const upgradeContainer = document.getElementById("upgrade-container");

const playButton = document.getElementById("play-button");
const upgradeMenuButton = document.getElementById("upgrade-menu-button");
const upgradeButton = document.getElementById("upgrade-bullet-button");
const menuButton = document.getElementById("menu-button");

backgroundCanvas.width = canvas.width;
backgroundCanvas.height = canvas.height;
foregroundCanvas.width = canvas.width;
foregroundCanvas.height = canvas.height;

const enemyImage = new Image();
enemyImage.src = "./assets/220space2.png";

const backgroundImg = new Image();
backgroundImg.src = "./assets/smoke.png";

const foregroundImg = new Image();
foregroundImg.src = "./assets/newSmoke.png";

context.imageSmoothingEnabled = false;

function startGame() {
    menuContainer.style.display = "none";
    gameContainer.style.display = "flex";

    gameLoop();
}

function openUpgradeMenu() {
    menuContainer.style.display = "none";
    upgradeContainer.style.display = "flex";
}

function openMenu() {
    menuContainer.style.display = "flex";
    upgradeContainer.style.display = "none";
}

function keyDownHandler(event) {
    if (event.key === "d" || event.key === "ArrowRight") {
        pressRight(true);
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
        pressLeft(true);
    }
}

function keyUpHandler(event) {
    if (event.key === "d" || event.key === "ArrowRight") {
        pressRight(false);
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
        pressLeft(false);
    }
}


class Background {
    constructor(image, speed, opacity) {
        this.image = image;
        this.speed = speed;
        this.opacity = opacity;
        this.y = 0;
    }

    update() {
        this.y += this.speed;

        if (this.y > canvas.height) {
            this.y = 0;
        }
    }

    draw() {
        backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        backgroundContext.globalAlpha = this.opacity;
        backgroundContext.drawImage(this.image, 0, this.y, backgroundCanvas.width, backgroundCanvas.height);
        backgroundContext.drawImage(this.image, 0, this.y - backgroundCanvas.height, backgroundCanvas.width, backgroundCanvas.height);
        backgroundContext.globalAlpha = 0.3;
        context.drawImage(backgroundCanvas, 0, 0); 
    }
}

const background = new Background(backgroundImg, 0.5);

class Foreground {
    constructor(image, speed, opacity) {
        this.image = image;
        this.speed = speed;
        this.opacity = opacity;
        this.y = 0;
    }

    update() {
        this.y += this.speed;

        if (this.y > canvas.height) {
            this.y = 0;
        }
    }

    draw() {
        foregroundContext.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);
        foregroundContext.globalAlpha = this.opacity;
        foregroundContext.drawImage(this.image, 0, this.y, foregroundCanvas.width, foregroundCanvas.height);
        foregroundContext.drawImage(this.image, 0, this.y - foregroundCanvas.height, foregroundCanvas.width, foregroundCanvas.height);
        foregroundContext.globalAlpha = 0.07;
        context.drawImage(foregroundCanvas, 0, 0); 
    }
}

const foreground = new Foreground(foregroundImg, 5);

class Enemy {
    constructor(x, y, speed, attackSpeed, health, width, height) {
        this.x = x - width / 2;
        this.y = y;
        this.speed = speed;
        this.attackSpeed = attackSpeed;
        this.width = width; 
        this.height = height;
        this.health = health;
        this.bullets = [];
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2.5;
        const bulletY = this.y;

        const bullet = new Bullet(bulletX, bulletY, -5);
        this.bullets.push(bullet);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
          const bullet = this.bullets[i];
          bullet.update();
    
          if (bullet.isOutOfBounds()) {
            this.bullets.splice(i, 1);
          }
        }
    }

    draw() {
        context.drawImage(enemyImage, this.x, this.y, this.width, this.height);
    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    background.update();
    background.draw();
    
    player.update();
    player.updateBullets();
    player.draw();
    player.drawBullets();

    foreground.update();
    foreground.draw();

    requestAnimationFrame(gameLoop);
}


document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
canvas.addEventListener("click", () => {
    player.shoot();
});

playButton.addEventListener("click", startGame);
upgradeMenuButton.addEventListener("click", openUpgradeMenu);
menuButton.addEventListener("click", openMenu);