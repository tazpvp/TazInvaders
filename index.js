const canvas = document.getElementById("gameCanvas");
const playButton = document.getElementById("play-button");
const gameContainer = document.getElementById("game-container");
const menuContainer = document.getElementById("menu-container");
const backgroundCanvas = document.createElement("canvas");

const context = canvas.getContext("2d");
const backgroundContext = backgroundCanvas.getContext("2d");

backgroundCanvas.width = canvas.width;
backgroundCanvas.height = canvas.height;

const playerImage = new Image();
playerImage.src = "./assets/220space1.png";

const bulletImage = new Image();
bulletImage.src = "./assets/bullet1.png";

const enemyImage = new Image();
enemyImage.src = "./assets/220space2.png";

const backgroundImg = new Image();
backgroundImg.src = "./assets/smoke.png";

context.imageSmoothingEnabled = false;

let rightPressed = false;
let leftPressed = false;

function startGame() {
    menuContainer.style.display = "none";
    gameContainer.style.display = "block";

    gameLoop();
}

playButton.addEventListener("click", startGame);

function keyDownHandler(event) {
    if (event.key === "d" || event.key === "ArrowRight") {
        rightPressed = true;
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === "d" || event.key === "ArrowRight") {
        rightPressed = false;
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
        leftPressed = false;
    }
}

class Player {
    constructor() {
        this.speed = 10;

        let magicNumber = 220;
        
        this.width = magicNumber;
        this.height = magicNumber;

        this.x = canvas.width / 2 - (magicNumber / 2);
        this.y = canvas.height - magicNumber - 150;

        this.canShootBullet = true;

        this.bullets = [];
        this.recoilTime = 0;
    }

    shoot() {
        if (this.canShootBullet) {
            const bulletX = this.x + this.width / 2 - 2.5;
            const bulletY = this.y;
    
            const bullet = new Bullet(bulletX, bulletY, 10);
            this.bullets.push(bullet);
            this.canShootBullet = false;
    
            const recoilDistance = -30; // Invert the recoil direction
            const recoilDuration = 30; // Adjust the recoil duration in milliseconds
    
            const originalY = this.y; // Store the original y position
            const recoilStart = Date.now(); // Store the start time of recoil animation
    
            // Easing function for recoil (ease-out)
            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    
            // Easing function for return (ease-in)
            const easeIn = (t) => t * t;
    
            // Start the recoil animation
            const animateRecoil = () => {
                const currentTime = Date.now();
                const elapsedTime = currentTime - recoilStart;
    
                if (elapsedTime < recoilDuration) {
                    // Calculate the current position using ease-out easing
                    const progress = easeOut(elapsedTime / recoilDuration);
                    this.y = originalY - progress * recoilDistance;
                    requestAnimationFrame(animateRecoil);
                } else {
                    // Recoil animation completed, start return animation
                    const returnDuration = 200; // Adjust the return animation duration
                    const returnStart = Date.now();
    
                    const animateReturn = () => {
                        const currentTime = Date.now();
                        const elapsedTime = currentTime - returnStart;
    
                        if (elapsedTime < returnDuration) {
                            // Calculate the current position using ease-in easing
                            const progress = easeIn(elapsedTime / returnDuration);
                            this.y = originalY - recoilDistance + progress * recoilDistance;
                            requestAnimationFrame(animateReturn);
                        } else {
                            // Return animation completed, reset the player's position
                            this.y = originalY;
                            this.canShootBullet = true;
                        }
                    };
    
                    animateReturn(); // Start the return animation
                }
            };
            animateRecoil(); // Start the recoil animation
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
          const bullet = this.bullets[i];
          bullet.update();
    
          if (bullet.y < 0) {
            this.bullets.splice(i, 1);
          }
        }
    }

    drawBullets() {
        this.bullets.forEach((bullet) => {
          bullet.draw();
        });
    }

    draw() {
        context.drawImage(playerImage, this.x, this.y, this.width, this.height)
    }

    update() {
        if (rightPressed && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (leftPressed && this.x > 0) {
            this.x -= this.speed;
        }
    }
}

const player = new Player();

class Bullet {
    constructor(x, y, speed) {
        let width = 50;
        this.x = x - width / 2;
        this.y = y;
        this.speed = speed;
        this.width = width; 
        this.height = 100;
        this.damage = 50;
    }
  
    update() {
        this.y -= this.speed;
    }
  
    draw() {
        context.drawImage(bulletImage, this.x, this.y, this.width, this.height);
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
        backgroundContext.globalAlpha = 0.2;
        context.drawImage(backgroundCanvas, 0, 0); 
    }
}

const background = new Background(backgroundImg, 1);

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

    for (let enemy of enemies) {
        enemy.draw();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
canvas.addEventListener("click", () => {
    player.shoot();
});