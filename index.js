const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerImage = new Image();
playerImage.src = "./assets/220space1.png";

const bulletImage = new Image();
bulletImage.src = "./assets/bullet1.png";

context.imageSmoothingEnabled = false;

let rightPressed = false;
let leftPressed = false;

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
    }
  
    update() {
        this.y -= this.speed;
    }
  
    draw() {
        context.fillStyle = "#f00";
        context.drawImage(bulletImage, this.x, this.y, this.width, this.height);

    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.updateBullets();
    player.draw();
    player.drawBullets();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
canvas.addEventListener("click", () => {
    player.shoot();
});

playerImage.onload = () => {
    console.log("image loaded");
    gameLoop();
};