const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const playerImage = new Image();
playerImage.src = "./assets/newspace1.png";
context.imageSmoothingEnabled = false;


let rightPressed = false;
let leftPressed = false;

function keyDownHandler(event) {
    if (event.key === "d") {
        rightPressed = true;
    } else if (event.key === "a") {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === "d") {
        rightPressed = false;
    } else if (event.key === "a") {
        leftPressed = false;
    }
}

class Player {
    constructor() {
        this.speed = 10;
        
        this.width = 25;
        this.height = 25;

        this.x = canvas.width / 2 - (25 / 2);
        this.y = canvas.height - 25;

        this.bullets = [];
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2.5;
        const bulletY = this.y;
    
        const bullet = new Bullet(bulletX, bulletY, 5);
        this.bullets.push(bullet);
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
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.width = 5; 
      this.height = 10;
    }
  
    update() {
      this.y -= this.speed;
    }
  
    draw() {
      context.fillStyle = "#f00";
      context.fillRect(this.x, this.y, this.width, this.height);
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