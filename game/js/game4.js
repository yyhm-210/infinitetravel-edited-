/**
 * Author :        Yusuf Khan   Shuoheng Fu     Yucheng Wang
 * Student Number: 400565596    400590015       400585377
 * Date: 2025/04/16
 *
 * The game logic implecation. Player controlled by w,a,s,d,space. Avoid or defeat monsters and get coins as you move forward.
 */


window.addEventListener("load",function(event){

// === Canvas Setup ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// === Game State ===
let scrollOffset = 0;
let keys = {};
let score = 0;
let money = 0;
let isPaused = false;
let isGameOver = false;
let isEscapePressed = false;
let isSwordSwinging = false;
let canSwing = true;

// === Classes ===
class Entity {
    constructor(x, y, width, height, hp) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hp = hp;
        this.maxHp = hp;
        this.collisionActive = false;
    }

    drawHealthBar() {
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - scrollOffset, this.y - 10, barWidth, barHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(this.x - scrollOffset, this.y - 10, barWidth * healthPercent, barHeight);
    }

    draw() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x - scrollOffset, this.y, this.width, this.height);
        this.drawHealthBar();
    }
}

class Player extends Entity {
    constructor(x, y, width, height, selectedSkin) {
        super(x, y, width, height, 5);
        this.dy = 0;
        this.dx = 0;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.grounded = false;
        this.deadImage = new Image();
        this.deadImage.src = `images/skins/dead.png`;
        const speedUpgrade = localStorage.getItem("upgrade_speed") === "1";
        this.speed = speedUpgrade ? 9 : 5;
        const skinType =selectedSkin;
        this.frames = [];

        this.extraJumpUsed = false; // Double jump for exGolden skin
        this.allowDoubleJump = (selectedSkin === "exGolden");

        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `images/skins/${skinType}_${i}.png`;
            this.frames.push(img);
        }
        this.frameIndex = 0;
        this.frameTimer = 0;
    }

    update() {

        // Check if player is dead
        this.isDead = false;
        if (this.hp <= 0 && !this.isDead) {
            this.isDead = true;
            gameOver();
        }
        // 
        if (!this.grounded) this.dy += this.gravity;

        this.y += this.dy;
        this.x += this.dx;
        this.x += baseScrollSpeed;
        if (this.x > scrollOffset + 150 * 3) {
            this.x = scrollOffset + 150 * 3;
        }

        if (this.y + this.height >= canvas.height - 60) {
            this.y = canvas.height - 60 - this.height;
            this.dy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
        //double jump
        if ((keys["ArrowUp"] || keys["w"]) && !this.jumpPressed) {
            if (this.grounded) {
                this.dy = this.jumpStrength;
                this.grounded = false;
                this.extraJumpUsed = false; // double jump reset
            } else if (this.allowDoubleJump && !this.extraJumpUsed) {
                this.dy = this.jumpStrength;
                this.extraJumpUsed = true;
            }
            this.jumpPressed = true;
        }
        if (!(keys["ArrowUp"] || keys["w"])) {
            this.jumpPressed = false;
        }

        if (keys["ArrowLeft"] || keys["a"] && this.x > 0) {
            this.dx = -this.speed;
            if (this.x < scrollOffset + 100 && scrollOffset > 0) {
                scrollOffset += this.dx;
                this.dx = 0;
            }
        } else if (keys["ArrowRight"] || keys["d"]) {
            this.dx = this.speed;
            if (this.x > scrollOffset + canvas.width - 400) {
                scrollOffset += this.dx;
                this.dx = 0;
            }
        } else {
            this.dx = 0;
        }

    }

    draw() {
        if (this.isDead) {
            ctx.drawImage(this.deadImage, this.x - scrollOffset, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.frames[this.frameIndex], this.x - scrollOffset, this.y, this.width, this.height);

            this.frameTimer++;
            if (this.frameTimer >= frameSpeed) {
                this.frameIndex = (this.frameIndex + 1) % this.frames.length;
                this.frameTimer = 0;
            }
        }
        this.drawHealthBar();
    }
}

class Obstacle extends Entity {
    constructor(x, y, width, height, hp = 2) {
        const scale = 1 + score / 20000; // Scale HP based on score
        super(x, y, width, height, Math.floor(hp * scale));
        this.gold = Math.floor(Math.random() * 21) + 10;
        this.damage = 0.05 * scale;

        // Load enemy images
        this.images = [
            new Image(),
            new Image()
        ];
        this.images[0].src = "images/img/enemy1.png";
        this.images[1].src = "images/img/enemy2.png";

        this.frameIndex = 0; // Current frame index
        this.frameTimer = 0; // Timer to control frame switching
        this.frameSpeed = 20; // Speed of frame switching
    }

    update() {
        if (this.hp <= 0) {
            money += this.gold;
            return false;
        }
        return true;
    }

    draw() {
        // Cycle through images
        this.frameTimer++;
        if (this.frameTimer >= this.frameSpeed) {
            this.frameIndex = (this.frameIndex + 1) % this.images.length;
            this.frameTimer = 0;
        }

        // Draw the current image
        ctx.drawImage(
            this.images[this.frameIndex],
            this.x - scrollOffset,
            this.y,
            this.width,
            this.height
        );

        this.drawHealthBar();
    }
}

class Coin {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.gold = Math.floor(Math.random() * 11) + 5;

        // Load the coin image
        this.image = new Image();
        this.image.src = "images/img/coin.png";
    }

    update() {
        return (this.x - scrollOffset + this.size > 0);
    }

    draw() {
        // Draw the coin image
        ctx.drawImage(
            this.image,
            this.x - scrollOffset,
            this.y,
            this.size,
            this.size
        );
    }
}

class Boss extends Entity {
    constructor(x, y) {
        const scale = 1 + score / 10000; // Scale HP and damage based on score
        super(x, y, 120, 160, Math.floor(30 * scale));
        this.gold = 100;
        this.attackCooldown = 0;
        this.damage = 0.1 * scale; // Increase damage over time

        // Load boss images
        this.images = [
            new Image(),
            new Image()
        ];
        this.images[0].src = "images/img/boss1.png";
        this.images[1].src = "images/img/boss2.png";

        this.frameIndex = 0; // Current frame index
        this.frameTimer = 0; // Timer to control frame switching
        this.frameSpeed = 20; // Speed of frame switching
    }

    update() {

        if (this.hp <= 0) {
            money += this.gold;
            return false;
        }
        return true;
    }

    draw() {
        // Cycle through images
        this.frameTimer++;
        if (this.frameTimer >= this.frameSpeed) {
            this.frameIndex = (this.frameIndex + 1) % this.images.length;
            this.frameTimer = 0;
        }

        // Draw the current image
        ctx.drawImage(
            this.images[this.frameIndex],
            this.x - scrollOffset,
            this.y,
            this.width,
            this.height
        );

        this.drawHealthBar();
    }
}
// === Game Initialization ===
async function loadSkin() {
    const url = "server/loadSkin.php";
    try {
        const response = await fetch(url);
        const data = await response.text();
        if (data !== "failed") {
            return data;
        } else {
            console.log("Failed to load skin. Default skin will be used.");
            return "default";
        }
    } catch (error) {
        console.log(error);
        return "default";
    }
}
async function initGame() {

    let selectedSkin = await loadSkin();


    swordImg = new Image();
    swordImg.src = `images/img/attack_${selectedSkin}.png`;
    const skinMusicMap = {
        default: "main.mp3",
        golden: "main.mp3",
        exGolden: "main.mp3",
        what: "about.mp3",
        big: "big.mp3"
    };
    const musicFile = skinMusicMap[selectedSkin];
    if (musicFile) {
        bgm = new Audio(`music/${musicFile}`);
        bgm.loop = true;
        bgm.volume = 0.5;
        bgm.play().catch(e => {
            console.warn("Music autoplay was blocked by browser:", e);
        });
    }

    player = new Player(100, canvas.height - 30, 50, 50, selectedSkin);

    startGame();
}
let swordImg = null;
let bgm = null;

const baseScrollSpeed = 2;

let frameIndex = 0;
let frameTimer = 0;
const frameSpeed = 10;

// === Game Entities ===
let player ;
const obstacles = [];
const coins = [];
const bosses = [];

// === Game Initialization ===
initGame();


const scoreDisplay = document.getElementById("scoreDisplay");
const moneyDisplay = document.getElementById("moneyDisplay");
const messageDiv = document.getElementById("message");
const goBack = document.getElementById("goBack");

// === Input Events ===
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if ((e.key === " " || e.key === "Spacebar") && canSwing) swordAttack();
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// === Sword Mechanics ===

function swordAttack() {
    if (!canSwing) return;
    isSwordSwinging = true;
    canSwing = false;
    setTimeout(() => (isSwordSwinging = false), 200);
    setTimeout(() => (canSwing = true), 500);
}

function checkSwordCollision(entity) {
    const swordRange = 50;
    const swordX = player.x + player.width;
    const swordY = player.y;
    const swordWidth = swordRange;
    const swordHeight = player.height;

    const isColliding = (
        isSwordSwinging &&
        swordX < entity.x + entity.width &&
        swordX + swordWidth > entity.x &&
        swordY < entity.y + entity.height &&
        swordY + swordHeight > entity.y
    );

    if (isColliding && !entity.collisionActive) {
        entity.hp -= swordDamage; // Apply sword damage
        entity.collisionActive = true; // Mark collision as active
    } else if (!isColliding) {
        entity.collisionActive = false; // Reset collision flag when no collision
    }
}

const swordDamage = 1; // Amount of damage the sword deals

// === Game Logic ===
function update() {
    // Calculate the player's forward movement
    const playerMovement = player.dx + baseScrollSpeed;

    // Update score only if the player is moving forward
    if (playerMovement > 0) {
        score += playerMovement; // Increase score based on forward movement
    }

    // Update the scroll offset
    scrollOffset += baseScrollSpeed;

    // Update the player
    player.update();

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (!obstacles[i].update()) {
            obstacles.splice(i, 1);
        } else {
            checkSwordCollision(obstacles[i]); // Check sword collision
            if (checkCollision(player, obstacles[i])) {
                if (!player.collisionActive) {
                    player.hp -= obstacles[i].damage;
                    player.collisionActive = true; // Mark collision as active
                }
            } else {
                player.collisionActive = false; // Reset collision flag when no collision
            }
        }
    }

    // Update coins
    for (let i = coins.length - 1; i >= 0; i--) {
        if (
            player.x < coins[i].x + coins[i].size &&
            player.x + player.width > coins[i].x - coins[i].size &&
            player.y < coins[i].y + coins[i].size &&
            player.y + player.height > coins[i].y - coins[i].size
        ) {
            money += coins[i].gold;
            coins.splice(i, 1);
        }
    }

    // Update bosses
    for (let i = bosses.length - 1; i >= 0; i--) {
        if (!bosses[i].update()) {
            bosses.splice(i, 1);
        } else {
            checkSwordCollision(bosses[i]); // Check sword collision
            if (checkCollision(player, bosses[i])) {
                if (!player.collisionActive) {
                    player.hp -= bosses[i].damage;
                    player.collisionActive = true; // Mark collision as active
                }
            } else {
                player.collisionActive = false; // Reset collision flag when no collision
                bosses[i].collisionActive = false; // Reset collision flag for the boss
            }
        }
    }
}

const backgroundImage = new Image();
backgroundImage.src = "images/background/background.png";

function drawBackground() {
    // Calculate the starting x position based on the scroll offset
    const startX = -(scrollOffset % canvas.width);

    // Draw the background image twice to cover the entire canvas
    ctx.drawImage(backgroundImage, startX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, startX + canvas.width, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background first
    drawBackground();

    // Draw the player and other game elements
    player.draw();
    for (const o of obstacles) o.draw();
    for (const c of coins) c.draw();
    for (const b of bosses) b.draw();

    // Draw the sword if swinging
    if (isSwordSwinging) {
        const swordX = player.x + player.width - scrollOffset;
        const swordY = player.y;
        const swordWidth = 50;
        const swordHeight = player.height;

        ctx.drawImage(swordImg, swordX, swordY, swordWidth, swordHeight);
    }

    // Draw the shadow
    drawShadow();
}

function drawShadow() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(player.x - scrollOffset + player.width / 2, canvas.height - 55, player.width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateServerData() {
    url = "server/updateData.php?" + "bestScore=" + score + "&gold=" + money;
    fetch(url).catch((error) => console.log(error));
}

function gameOver() {
    isPaused = true;
    isGameOver = true;
    messageDiv.innerText = `Game Over! Your score: ${score}`;
    messageDiv.style.color = "red";
    messageDiv.style.fontSize = "30px";
    goBack.style.display = "block"
    messageDiv.style.opacity = 1;

    keys = {};
    if (bgm && !bgm.paused) {
        bgm.pause();
        bgm.currentTime = 0;
    }


    updateServerData();

}

function gameLoop() {
    // console.log("x: " + player.x);
    // console.log("so: " + scrollOffset);
   

    if (!isGameOver) {
        if (keys["Escape"] && !isEscapePressed) {
            isPaused = !isPaused;
            messageDiv.innerText = isPaused ? "Game Paused" : "";
            isEscapePressed = true;
        } else if (!keys["Escape"]){
            isEscapePressed = false;
            
        } 
        if(isPaused || isGameOver){
            messageDiv.style.opacity = 1;
            goBack.style.display = "block"

        }
        else{
            messageDiv.style.opacity = 0;
            goBack.style.display = "none"
    
        }
        

        if (!isPaused) {
            update();   
            draw();
            scoreDisplay.innerText = `Score: ${score}`;
            moneyDisplay.innerText = `Gold: ${money}`;
        }
    }
}

function startGame() {

    setInterval(() => {
        if (!isPaused) {
            const height = Math.random() * 50 + 20;
            const width = Math.random() * 30 + 20;
            const y = canvas.height - height - 60;
            const x = player.x + canvas.width + Math.random() * 200;
            obstacles.push(new Obstacle(x, y, width, height));
        }
    }, 2000);
    
    setInterval(() => {
        if (!isPaused) {
            const size = Math.random() * 20 + 20;
            const x = player.x + canvas.width + Math.random() * 300;
            const y = canvas.height - Math.random() * 100 - size - 60;
            coins.push(new Coin(x, y, size));
        }
    }, 3000);

    setInterval(() => {
        if (!isPaused) {
            const x = player.x + canvas.width + Math.random() * 500;
            const y = canvas.height - 220; // Fixed position for the boss
            bosses.push(new Boss(x, y));
        }
    }, 15000);
    
    setInterval(gameLoop, 16);
}



});


