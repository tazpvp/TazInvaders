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
    } else if (event.key === "a" || event.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === "d" || event.key === "ArrowRight") {
        rightPressed = false;
    } else if (event.key === "a" || event.key === "ArrowLeft") {
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
    }

    shoot() {
        if (this.canShootBullet) {
            const bulletX = this.x + this.width / 2 - 2.5;
            const bulletY = this.y;
        
            const bullet = new Bullet(bulletX, bulletY, 10);
            this.bullets.push(bullet);
            this.canShootBullet = false;

            setTimeout(() => this.canShootBullet = true, 100);
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
        } else if (leftPressed && this.x > 0) {
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