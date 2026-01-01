const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const images = {};

function loadImage(key, src) {
  const img = new Image();
  img.src = src;
  images[key] = img;
  return img;
}

// Load images
const mapImg = loadImage("map", "images/map.jpg");
loadImage("house", "images/house.jpg");
loadImage("office", "images/office.jpg");
loadImage("bank", "images/bank.jpg");
loadImage("atm", "images/atm.jpg");
loadImage("disney", "images/disney-sign.jpg");
loadImage("wallstreet", "images/wallstreet-sign.jpg");

// Canvas resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Player
const player = {
  x: canvas.width / 2,
  y: 100,
  size: 22,
  speed: 6
};

// Input
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// Map scale (calculated after image loads)
let mapScale = 1;
let mapDisplayHeight = 0;

// Buildings (percent of ORIGINAL map)
const buildings = [
  { name: "Budgeting Basics", img: "house", x: 0.042, y: 0.025, w: 0.23, h: 0.1},
  { name: "Saving & Investing", img: "office", x: 0.69, y: 0.21, w: 0.23, h: 0.1},
  { name: "Banking Basics", img: "bank", x: 0.01, y: 0.401, w: 0.3, h: 0.09},
  { name: "Taxes & Income", img: "atm", x: 0.65, y: 0.6, w: 0.37, h: 0.08}
];

const signs = [
  { img: "disney", x: 0.69, y: 0.735, w: 0.28, h: 0.07 },
  { img: "wallstreet", x: 0.125, y: 0.86, w: 0.32, h: 0.07 }
];

// Camera (ONLY Y)
let cameraY = 0;

// Move player
function movePlayer() {
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  // Clamp player vertically to map
  player.y = Math.max(0, Math.min(player.y, mapDisplayHeight - player.size));
}

// Update camera (vertical only)
function updateCamera() {
  cameraY = player.y - canvas.height / 2;
  cameraY = Math.max(0, Math.min(cameraY, mapDisplayHeight - canvas.height));
}

// Draw map
function drawMap() {
  ctx.drawImage(
    images.map,
    0,
    -cameraY,
    canvas.width,
    mapDisplayHeight
  );
}

// Draw buildings/signs
function drawObjects() {
  [...buildings, ...signs].forEach(obj => {
    const x = obj.x * canvas.width;
    const y = obj.y * mapDisplayHeight;
    const w = obj.w * canvas.width;
    const h = obj.h * mapDisplayHeight;

    ctx.drawImage(
      images[obj.img],
      x,
      y - cameraY,
      w,
      h
    );
  });
}

// Player
function drawPlayer() {
  ctx.fillStyle = "black";
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - cameraY,
    player.size,
    player.size
  );
}

// Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  updateCamera();
  drawMap();
  drawObjects();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

// Start after map loads
mapImg.onload = () => {
  mapScale = canvas.width / mapImg.naturalWidth;
  mapDisplayHeight = mapImg.naturalHeight * mapScale;

  player.x = canvas.width / 2;
  player.y = 100;

  requestAnimationFrame(gameLoop);
};
