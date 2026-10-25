const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const playerImage = new Image();
playerImage.src = "little-guy/Player.png";

let damageCooldown = 0;
let shooting = false;
let score = 0;
let startTime = 0;
let elapsedTime = 0;
let finalTime = 0;
let bestTime = Number(localStorage.getItem("littleGuyBestTime")) || 0;
let newRecord = false;
const gravity = 0.5;
const maxVelocityY = 10;
const acceleration = 0.4;
const maxSpeed = 5;
const friction = 0.78;

const groundY = 390;
const worldWidth = 2400;


const player = {
    x: 60,
    y: groundY - 35,
    width: 25,
    height: 35,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    health: 100
};

    const Shot = {
        x: player.x,
        y: player.y,
        width: 5,
        height: 2,
        speedX: 15,
        speedY: 0,
        active: false,
        startX: player.x,
        Damage: 10
    }

const keys = {
    left: false,
    right: false
};

let jumpQueued = false;
let cameraX = 0;
let gameState = "menu";

// Buttons drawn inside the canvas
const playButton = {
    x: 350,
    y: 245,
    width: 200,
    height: 60,
    text: "PLAY"
};

const platforms = [
    { x: 0, y: groundY, width: 620, height: 60 },
    { x: 700, y: groundY, width: 380, height: 60 },
    { x: 1160, y: groundY, width: 450, height: 60 },
    { x: 1690, y: groundY, width: 710, height: 60 },

    { x: 300, y: 315, width: 120, height: 30 },
    { x: 500, y: 260, width: 120, height: 18 },
    { x: 790, y: 320, width: 130, height: 18 },
    { x: 990, y: 270, width: 120, height: 18 },
    { x: 1280, y: 310, width: 140, height: 18 },
    { x: 1480, y: 245, width: 120, height: 18 },
    { x: 1780, y: 315, width: 130, height: 18 },
    { x: 1980, y: 270, width: 140, height: 18 }
];

const hazards = [
    { x: 450, y: groundY - 25, width: 30, height: 25 },
    { x: 850, y: groundY - 25, width: 30, height: 25 },
    { x: 1350, y: groundY - 25, width: 30, height: 25 },
    { x: 1850, y: groundY - 25, width: 30, height: 25 }
];

const targets = [
    { x: 500, y: 300, width: 30, height: 30, active: true },
    { x: 800, y: 250, width: 30, height: 30, active: true },
    { x: 1100, y: 320, width: 30, height: 30, active: true },
    { x: 1450, y: 200, width: 30, height: 30, active: true },
    { x: 1800, y: 200, width: 30, height: 30, active: true }
];



// Keyboard controls
document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) {
        event.preventDefault();
    }

    if(key === "r"){
        startGame();
    }

    if (key === "backspace" && !event.repeat) {
    shooting = true;

    Shot.x = player.x + player.width;
    Shot.y = player.y + player.height / 2;
    Shot.startX = Shot.x;
    Shot.active = true;
    }

    if (key === "a" || key === "arrowleft") {
        keys.left = true;
    }

    if (key === "d" || key === "arrowright") {
        keys.right = true;
    }

    if (
        (key === "w" || key === "arrowup" || key === " ") &&
        !event.repeat
    ) {
        jumpQueued = true;
    }

    if (key === "enter" && gameState === "menu") {
        startGame();
    }
});

document.addEventListener("keyup", function(event) {
    const key = event.key.toLowerCase();

    if (key === "a" || key === "arrowleft") {
        keys.left = false;
    }

    if (key === "d" || key === "arrowright") {
        keys.right = false;
    }
});



// Mouse clicks inside the game window
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    if (gameState === "menu") {
        if (isInsideButton(mouseX, mouseY, playButton)) {
            startGame();
        }
        return;
    }

    if (gameState === "complete") {
        const replayButton = { x: 350, y: 280, width: 200, height: 45 };
        const menuButton = { x: 350, y: 335, width: 200, height: 40 };
        const deleteButton = { x: 350, y: 385, width: 200, height: 40 };

        if (isInsideButton(mouseX, mouseY, replayButton)) {
            startGame();
            return;
        }

        if (isInsideButton(mouseX, mouseY, menuButton)) {
            gameState = "menu";
            return;
        }

        if (isInsideButton(mouseX, mouseY, deleteButton)) {
            localStorage.removeItem("littleGuyBestTime");
            bestTime = 0;
            newRecord = false;
            return;
        }
    }
});

function isInsideButton(x, y, button) {
    return (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
    );
}





 function startGame() {
    player.x = 60;
    player.y = groundY - player.height;
    player.health = 100;

    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;

    cameraX = 0;
    jumpQueued = false;

    keys.left = false;
    keys.right = false;

    gameState = "playing";
    damageCooldown = 0;
    score = 0;
    Shot.active = false;
    shooting = false;


    for (const target of targets) {
        target.active = true;
    }
    startTime = performance.now();
    elapsedTime = 0;
    finalTime = 0;
    }


 // Draw a button directly on the canvas
 function drawButton(button, text) {
    ctx.fillStyle = "#f2c14e";
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#242038";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        button.x + button.width / 2,
        button.y + button.height / 2
    );
 }

 function drawMainMenu() {
    // Deep purple background
    ctx.fillStyle = "#17152e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative background circles
    const circles = [
        { x: 100, y: 100, r: 45, color: "#30285c" },
        { x: 790, y: 90, r: 60, color: "#253d5b" },
        { x: 160, y: 300, r: 70, color: "#253d5b" },
        { x: 740, y: 330, r: 85, color: "#30285c" },
        { x: 450, y: 60, r: 25, color: "#284b58" }
    ];

    for (const circle of circles) {
        ctx.fillStyle = circle.color;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Decorative stars
    const stars = [
        [220, 80], [300, 120], [650, 100],
        [90, 220], [810, 230], [680, 300],
        [280, 320], [550, 340], [400, 90]
    ];

    for (const [x, y] of stars) {
        ctx.fillStyle = "#8ee3ef";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Small game label
    ctx.fillStyle = "#8ee3ef";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A LITTLE ADVENTURE", canvas.width / 2, 65);

    // Main title with colorful shadow
    ctx.fillStyle = "#ff6b8a";
    ctx.font = "bold 44px Arial";
    ctx.fillText(
        "Little Guy, Big Problems",
        canvas.width / 2 + 3,
        132 + 3
    );

    ctx.fillStyle = "#f4f0ff";
    ctx.fillText(
        "Little Guy, Big Problems",
        canvas.width / 2,
        132
    );

    // Colorful subtitle
    ctx.fillStyle = "#b9a7ff";
    ctx.font = "18px Arial";
    ctx.fillText(
        "Small hero. Big world. Your adventure awaits.",
        canvas.width / 2,
        183
    );

    // Custom coral and purple play button
    const button = playButton;

    ctx.fillStyle = "#ff6b8a";
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.strokeStyle = "#ffb3c6";
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#271c3f";
    ctx.font = "bold 26px Arial";
    ctx.fillText(
        "PLAY",
        button.x + button.width / 2,
        button.y + button.height / 2
    );

    // Controls panel
    ctx.fillStyle = "#252344";
    ctx.fillRect(115, 330, 670, 45);

    ctx.strokeStyle = "#514b7d";
    ctx.lineWidth = 2;
    ctx.strokeRect(115, 330, 670, 45);

    ctx.fillStyle = "#8ee3ef";
    ctx.font = "15px Arial";
    ctx.fillText(
        "A / D or ARROWS  •  MOVE",
        canvas.width / 2,
        345
    );

    ctx.fillStyle = "#ffb3c6";
    ctx.fillText(
        "W / SPACE  •  JUMP     BACKSPACE  •  SHOOT",
        canvas.width / 2,
        365
    );


    // Creator signature
    ctx.fillStyle = "#8ee3ef";
    ctx.font = "italic 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "Made by Santiago E.",
        canvas.width / 2,
        canvas.height - 15
    );


}


function drawCompleteScreen() {
    // Background
    ctx.fillStyle = "#17152e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative background circles — matching main menu
    const circles = [
        { x: 100, y: 100, r: 45, color: "#30285c" },
        { x: 790, y: 90, r: 60, color: "#253d5b" },
        { x: 160, y: 300, r: 70, color: "#253d5b" },
        { x: 740, y: 330, r: 85, color: "#30285c" },
        { x: 450, y: 60, r: 25, color: "#284b58" }
    ];

    for (const circle of circles) {
        ctx.fillStyle = circle.color;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Decorative stars
    const stars = [
        [220, 80], [300, 120], [650, 100],
        [90, 220], [810, 230], [680, 300],
        [280, 320], [550, 340], [400, 90]
    ];

    for (const [x, y] of stars) {
        ctx.fillStyle = "#8ee3ef";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Small label
    ctx.fillStyle = "#8ee3ef";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ADVENTURE COMPLETE", canvas.width / 2, 35);

    // Title with coral shadow
    ctx.fillStyle = "#ff6b8a";
    ctx.font = "bold 42px Arial";
    ctx.fillText("LEVEL COMPLETE!", canvas.width / 2 + 3, 83 + 3);

    ctx.fillStyle = "#f4f0ff";
    ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, 83);

    // Subtitle
    ctx.fillStyle = "#b9a7ff";
    ctx.font = "18px Arial";
    ctx.fillText(
        "You made it through the chaos!",
        canvas.width / 2,
        130
    );

    // Score panel
    ctx.fillStyle = "#252344";
    ctx.fillRect(235, 155, 430, 45);

    ctx.strokeStyle = "#514b7d";
    ctx.lineWidth = 2;
    ctx.strokeRect(235, 155, 430, 45);

    ctx.fillStyle = "#ffb3c6";
    ctx.font = "bold 26px Arial";
    ctx.fillText(
        `FINAL SCORE: ${score}`,
        canvas.width / 2,
        178
    );

        // Delete Best Time button
    ctx.fillStyle = "#d9534f";
    ctx.fillRect(350, 385, 200, 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Delete Best Time", 450, 410);

    // Final time
    const minutes = Math.floor(finalTime / 60);
    const seconds = Math.floor(finalTime % 60);
    const milliseconds = Math.floor((finalTime % 1) * 100);

    // Current completion time
ctx.fillStyle = "#8ee3ef";
ctx.font = "bold 24px Arial";
ctx.fillText(
    `YOUR TIME: ${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`,
    canvas.width / 2,
    220
);

    // Personal best
    if (bestTime > 0) {
        const bestMinutes = Math.floor(bestTime / 60);
        const bestSeconds = Math.floor(bestTime % 60);
        const bestMilliseconds = Math.floor((bestTime % 1) * 100);

        ctx.fillStyle = newRecord ? "#ffb3c6" : "#b9a7ff";
        ctx.font = "bold 16px Arial";

        ctx.fillText(
            newRecord
                ? "NEW PERSONAL BEST!"
                : `BEST: ${bestMinutes}:${String(bestSeconds).padStart(2, "0")}.${String(bestMilliseconds).padStart(2, "0")}`,
            canvas.width / 2,
            247
        );
    }

    // Play Again button — coral pink
    const replayButton = {
        x: 350, y: 280, width: 200, height: 45
    };

    ctx.fillStyle = "#ff6b8a";
    ctx.fillRect(
        replayButton.x, replayButton.y,
        replayButton.width, replayButton.height
    );

    ctx.strokeStyle = "#ffb3c6";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        replayButton.x, replayButton.y,
        replayButton.width, replayButton.height
    );

    ctx.fillStyle = "#271c3f";
    ctx.font = "bold 22px Arial";
    ctx.fillText(
        "PLAY AGAIN",
        replayButton.x + replayButton.width / 2,
        replayButton.y + replayButton.height / 2
    );

    // Main Menu button — cyan
    const menuButton = {
        x: 350, y: 335, width: 200, height: 40
    };

    ctx.fillStyle = "#8ee3ef";
    ctx.fillRect(
        menuButton.x, menuButton.y,
        menuButton.width, menuButton.height
    );

    ctx.strokeStyle = "#c4f6ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        menuButton.x, menuButton.y,
        menuButton.width, menuButton.height
    );

    ctx.fillStyle = "#202341";
    ctx.font = "bold 22px Arial";
    ctx.fillText(
        "MAIN MENU",
        menuButton.x + menuButton.width / 2,
        menuButton.y + menuButton.height / 2
    );
}

// Update player physics
function updateGame() {
    if (gameState !== "playing") {
        return;
    }

    if (keys.right) {
        player.velocityX += acceleration;
    }

    if (keys.left) {
        player.velocityX -= acceleration;
    }

    if (!keys.left && !keys.right) {
        player.velocityX *= friction;

        if (Math.abs(player.velocityX) < 0.08) {
            player.velocityX = 0;
        }
    }

    player.velocityX = Math.max(
        -maxSpeed,
        Math.min(player.velocityX, maxSpeed)
    );

    const previousBottom = player.y + player.height;
 let blocked = false;
    


 const nextX = player.x + player.velocityX;

 for (const platform of platforms) {
    const overlapsY =
        player.y + player.height > platform.y &&
        player.y < platform.y + platform.height;

    const hitsX =
        nextX + player.width > platform.x &&
        nextX < platform.x + platform.width;

    if (overlapsY && hitsX) {
        if (player.velocityX > 0) {
            player.x = platform.x - player.width;
        } else if (player.velocityX < 0) {
            player.x = platform.x + platform.width;
        }

        player.velocityX = 0;
        break;
    }
 }

    if (player.velocityX !== 0) {
        player.x += player.velocityX;
    }

    player.x = Math.max(
        0,
        Math.min(worldWidth - player.width, player.x)
    );

    player.velocityY = Math.min(
        player.velocityY + gravity,
        maxVelocityY
    );

    player.y += player.velocityY;
    player.onGround = false;

    for (const platform of platforms) {
        const overlapsX =
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;

        const underneathPlatform =
            previousBottom <= platform.y &&
            player.y + player.height >= platform.y; 

        const crossedTop =
            previousBottom <= platform.y &&
            player.y + player.height >= platform.y;

        if (
            overlapsX &&
            crossedTop &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }
    }

    if (jumpQueued && player.onGround) {
        player.velocityY = -11.5;
        player.onGround = false;
    }

    jumpQueued = false;

    if (Shot.active) {
    Shot.x += Shot.speedX;
    Shot.y += Shot.speedY;

    if (Math.abs(Shot.x - Shot.startX) >= 300) {
        Shot.active = false;
    }
 }


   // Count down the damage cooldown
if (damageCooldown > 0) {
    damageCooldown--;
}

for (const hazard of hazards) {
    const touching =
        player.x + player.width > hazard.x &&
        player.x < hazard.x + hazard.width &&
        player.y + player.height > hazard.y &&
        player.y < hazard.y + hazard.height;

    if (touching && damageCooldown === 0) {
        player.health -= 10;
        damageCooldown = 60;

        if (player.health <= 0) {
            startGame();
        }

        break;
    }
}


    // Return to the start if the player falls off the level
    if (player.y > canvas.height + 100) {
        startGame();
    }
    

    // Camera follows the player
    cameraX = Math.max(0,Math.min(
        worldWidth - canvas.width,
        player.x - 220
        )
    );

        // Finish the level at the flag
    if (player.x + player.width >= worldWidth - 90) {
        finalTime = (performance.now() - startTime) / 1000;

        // Check for a new personal best
        if (bestTime === 0 || finalTime < bestTime) {
            bestTime = finalTime;
            localStorage.setItem("littleGuyBestTime", bestTime);
            newRecord = true;
        } else {
            newRecord = false;
        }

        gameState = "complete";
    }
 }

// Draw level 1
function drawLevel() {
    ctx.fillStyle = "#d9c5a0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = "#fff4d6";

    for (const cloud of [
        { x: 120, y: 80 },
        { x: 450, y: 110 },
        { x: 760, y: 70 }
    ]) {
        const x = cloud.x - (cameraX * 0.25 % 900);

        ctx.beginPath();
        ctx.arc(x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, cloud.y - 8, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, cloud.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Platforms and ground
    for (const platform of platforms) {
        ctx.fillStyle = "#76634f";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle = "#5b9b45";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            7
        );
        }

// Draw colorful bullseye targets
for (const target of targets) {
    if (!target.active) continue;

    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;

    // Outer ring
    ctx.fillStyle = "#ff6b8a";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Middle ring
    ctx.fillStyle = "#f4f0ff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring
    ctx.fillStyle = "#8ee3ef";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Center
    ctx.fillStyle = "#30285c";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();
}


    // Draw damage spikes
    for (const hazard of hazards) {
        ctx.fillStyle = "#e84855";

        ctx.beginPath();
        ctx.moveTo(hazard.x, hazard.y + hazard.height);
        ctx.lineTo(hazard.x + hazard.width / 2, hazard.y);
        ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
        ctx.closePath();
        ctx.fill();
    }


    // Finish flag
    const flagX = worldWidth - 90;

    ctx.fillStyle = "#45404f";
    ctx.fillRect(flagX, groundY - 100, 6, 100);

    ctx.fillStyle = "#e84855";
    ctx.beginPath();
    ctx.moveTo(flagX + 6, groundY - 100);
    ctx.lineTo(flagX + 58, groundY - 82);
    ctx.lineTo(flagX + 6, groundY - 64);
    ctx.closePath();
    ctx.fill();

    // Player

    if (playerImage.complete && playerImage.naturalWidth > 0) {
        ctx.drawImage(
            playerImage,
            player.x,
           player.y,
            player.width,
            player.height
     );
    } else {
        // Fallback if the image doesn't load
        ctx.fillStyle = "red";
        ctx.fillRect(
         player.x,
        player.y,
        player.width,
        player.height
        );
    }



    ctx.fillStyle = "#000000";
    ctx.fillRect(
        player.x + 15,
        player.y + 7,
        4,
        4
    );

        // Draw projectile
    if (shooting && Shot.active) {
        ctx.fillStyle = "black";
        ctx.fillRect(
            Shot.x,
            Shot.y,
            Shot.width,
            Shot.height
        );
    }
    if (Shot.active) {
        for (const target of targets) {
            if (!target.active) continue;

            const hit =
                Shot.x < target.x + target.width &&
                Shot.x + Shot.width > target.x &&
                Shot.y < target.y + target.height &&
                Shot.y + Shot.height > target.y;

            if (hit) {
                target.active = false;
                score += 100;
                Shot.active = false;
                break;
            }
        }
    }

 ctx.restore();

    const displayTime =
    gameState === "complete" ? finalTime : elapsedTime;

            const minutes = Math.floor(displayTime / 60);
            const seconds = Math.floor(displayTime % 60);
            const milliseconds = Math.floor((displayTime % 1) * 100);

            ctx.fillStyle = "rgba(15, 15, 25, 0.85)";
            ctx.fillRect(canvas.width - 145, 15, 125, 35);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                `${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`,
                canvas.width - 82,
                38
            );


        // Level label
    ctx.fillStyle = "#242038";
    ctx.fillRect(10, 10, 240, 35);

        
    // Health bar background
    ctx.fillStyle = "#242038";
    ctx.fillRect(260, 10, 220, 35);

    // Red health bar
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
        270,
        15,
        200 * (player.health / 100),
        25
    );

        // Health text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "HP: " + player.health,
            370,
            27
        );
    // Compact target-style score HUD
    const scoreX = 485; // Adjust tos move score left or right
    const scoreY = 10;  // Align with your health bar

    ctx.fillStyle = "rgba(15, 15, 25, 0.85)";
    ctx.fillRect(scoreX, scoreY, 115, 30);

    // Small bullseye
    ctx.strokeStyle = "#ff4545";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(scoreX + 15, scoreY + 15, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(scoreX + 15, scoreY + 15, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ff4545";
    ctx.beginPath();
    ctx.arc(scoreX + 15, scoreY + 15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Smaller score text
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${score}`, scoreX + 30, scoreY + 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillText("LEVEL 1: THE BEGINNING", 20, 27);
 
    }
// Main game loop
 function gameLoop() {
    updateGame();

    if (gameState === "playing") {
        elapsedTime = (performance.now() - startTime) / 1000;
    }

    if (gameState === "menu") {
        drawMainMenu();
    } else if (gameState === "playing") {
        drawLevel();

    } else if (gameState === "complete") {
        drawCompleteScreen();
    }

    requestAnimationFrame(gameLoop);
}
gameLoop();