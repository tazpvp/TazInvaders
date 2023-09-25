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

const playerImage = new Image();
playerImage.src = "./assets/220space1.png";

const bulletImage = new Image();
bulletImage.src = "./assets/bullet1.png";

const enemyImage = new Image();
enemyImage.src = "./assets/220space2.png";

const backgroundImg = new Image();
backgroundImg.src = "./assets/smoke.png";

const foregroundImg = new Image();
foregroundImg.src = "./assets/newSmoke.png";

context.imageSmoothingEnabled = false;

let rightPressed = false;
let leftPressed = false;

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

playButton.addEventListener("click", startGame);
upgradeMenuButton.addEventListener("click", openUpgradeMenu);
menuButton.addEventListener("click", openMenu);

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
        this.speed = 1; // Initial speed
        this.maxSpeed = 50; // Maximum speed
        this.acceleration = 1; // Acceleration rate

        let magicNumber = 220;
        
        this.width = magicNumber;
        this.height = magicNumber;

        this.x = canvas.width / 2 - (magicNumber / 2);
        this.y = canvas.height - magicNumber - 150;

        this.canShootBullet = true;

        this.bullets = [];
        this.recoilTime = 0;

        this.velocityX = 0; // Horizontal velocity
    }

    shoot() {
        if (this.canShootBullet) {
            const bulletX = this.x + this.width / 2 - 2.5;
            const bulletY = this.y;
    
            const bullet = new Bullet(bulletX, bulletY, 5);
            this.bullets.push(bullet);
            this.canShootBullet = false;
    
            const recoilDistance = -25; // Invert the recoil direction
            const recoilDuration = 25; // Adjust the recoil duration in milliseconds
    
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
                    const returnDuration = 140; // Adjust the return animation duration
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
        const angle = this.velocityX / this.maxSpeed; // Calculate the angle based on velocity

        const maxRotation = 0.4; // Adjust the maximum rotation angle in radians

        const rotation = angle * maxRotation; // Calculate the rotation angle

        context.save();

        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Apply rotation transformation
        context.rotate(rotation);

        // Draw the rotated player image
        context.drawImage(playerImage, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }

    update() {
        if (rightPressed) {
            // Accelerate to the right
            this.velocityX += this.acceleration;
        }
        if (leftPressed) {
            // Accelerate to the left
            this.velocityX -= this.acceleration;
        }
    
        // Update player's position based on velocity
        this.x += this.velocityX;
    
        // Apply friction to gradually slow down when no keys are pressed
        this.velocityX *= 0.95; // Adjust the friction factor (0.95 for example)
    
        // Ensure the player stays within the boundaries of the canvas
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0; // Stop moving left
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.velocityX = 0; // Stop moving right
        }
    }
}


const player = new Player();

class Bullet {
    constructor(x, y, initialSpeed) {
        let width = 50;
        this.x = x - width / 2;
        this.y = y;
        this.speed = initialSpeed; // Initial speed
        this.width = width;
        this.height = 100;
        this.damage = 50;
        this.velocityY = 0; // Vertical velocity
    }

    update() {
        // Accelerate the bullet
        this.velocityY += 0.3; // You can adjust the acceleration rate as needed
        this.y -= this.speed + this.velocityY;
    }

    draw() {
        context.drawImage(bulletImage, this.x, this.y, this.width, this.height);
    }

    isOutOfBounds() {
        return this.y + this.height < 0;
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
