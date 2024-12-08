const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const speedControl = document.getElementById('speedControl');

const images = {
    character: new Image(),
    fishBall: new Image(),
    tofu: new Image(),
    crabStick: new Image(),
    bomb: new Image()
};
images.character.src = './assets/character.png';
images.fishBall.src = './assets/fish_ball.png';
images.tofu.src = './assets/tofu.png';
images.crabStick.src = './assets/crab_stick.png';
images.bomb.src = './assets/bomb.png';

let gameInterval, dropInterval;
let player = { x: 375, y: 350, width:50, height: 50 };
let items = [];
let score = 0;
let timeLeft = 30;
let itemSpeed = parseInt(speedControl.value);

const itemTypes = [
    { name: 'fishBall', score: 5, image: images.fishBall },
    { name: 'tofu', score: 4, image: images.tofu },
    { name: 'crabStick', score: 3, image: images.crabStick },
    { name: 'bomb', score: -4, image: images.bomb }
];

let orientationEnabled = false;
let tiltX = 0;

speedControl.addEventListener('input', () => {
    itemSpeed = parseInt(speedControl.value);
});

function startGame() {
    resetGame();
    gameInterval = setInterval(updateGame, 16);
    dropInterval = setInterval(spawnItem, 1000);
}

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(dropInterval);
    items = [];
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    startButton.disabled = true;
    setTimeout(() => startButton.disabled = false, 3000);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateItems();
    drawItems();
    checkCollisions();
    if (timeLeft <= 0) endGame();

    if (orientationEnabled) {
        player.x += tiltX * 3;
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    }
}

function drawPlayer() {
    ctx.drawImage(images.character, player.x, player.y, player.width, player.height);
}

function spawnItem() {
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const x = Math.random() * (canvas.width - 50);
    items.push({ x, y: 0, width: 60, height: 60, ...itemType });
}

function updateItems() {
    items.forEach(item => item.y += itemSpeed);
    items = items.filter(item => item.y < canvas.height);
}

function drawItems() {
    items.forEach(item => {
        ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    });
}

function checkCollisions() {
    items.forEach((item, index) => {
        if (
            item.y + item.height >= player.y &&
            item.x < player.x + player.width &&
            item.x + item.width > player.x
        ) {
            score += item.score;
            scoreElement.textContent = score;
            items.splice(index, 1);
        }
    });
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(dropInterval);
    alert(score >= 50 ? '恭喜!太厲害啦😍' : '再試一次吧🥺!');
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - 20);
    if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - player.width, player.x + 20);
});

function enableOrientation() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    orientationEnabled = true;
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    alert('需要啟用方向感應才能玩此遊戲！');
                }
            })
            .catch(console.error);
    } else if ('ondeviceorientation' in window) {
        orientationEnabled = true;
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
        alert('此設備不支援方向感應。');
    }
}

function handleOrientation(event) {
    tiltX = (event.gamma || 0) / 5;
    if (!tiltX) tiltX = (event.beta || 0) / 5;
}

startButton.addEventListener('click', () => {
    enableOrientation();
    startGame();
});

setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        timerElement.textContent = timeLeft;
    }
}, 1000);
