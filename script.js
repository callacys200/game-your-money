alert("SCRIPT LOADED");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");




const images = {};




function loadImage(key, src) {
const img = new Image();
img.src = src;
images[key] = img;
}




loadImage("map", "images/map.jpg");
loadImage("house", "images/house.jpg");
loadImage("office", "images/office.jpg");
loadImage("bank", "images/bank.jpg");
loadImage("atm", "images/atm.jpg");
loadImage("police", "images/police.jpg");
loadImage("disney", "images/disney-sign.jpg");
loadImage("wallstreet", "images/wallstreet-sign.jpg");




const camera = {
x: 0,
y: 0,
width: canvas.width,
height: canvas.height
};




const player = {
x: 450,
y: 100,
size: 20,
speed: 3
};




function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
camera.width = canvas.width;
camera.height = canvas.height;
}




window.addEventListener("resize", resizeCanvas);
resizeCanvas();




// Buildings in the town
const buildings = [
{
  name: "Budgeting Basics",
  img: "house",
  x: 80,
  y: 120,
  w: 120,
  h: 120
},
{
  name: "Saving & Investing",
  img: "office",
  x: 360,
  y: 160,
  w: 120,
  h: 120
},
{
  name: "Banking Basics",
  img: "bank",
  x: 90,
  y: 420,
  w: 120,
  h: 120
},
{
  name: "Taxes & Income",
  img: "atm",
  x: 380,
  y: 560,
  w: 120,
  h: 120
},
{
  name: "Financial Safety",
  img: "police",
  x: 380,
  y: 300,
  w: 120,
  h: 120
}
];




const signs = [
{ img: "disney", x: 320, y: 700, w: 180, h: 60 },
{ img: "wallstreet", x: 80, y: 820, w: 200, h: 60 }
];




const keys = {};
document.addEventListener("keydown", e => {
const key = e.key.toLowerCase();




if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","e"].includes(key)) {
  e.preventDefault();
}




keys[key] = true;
});




document.addEventListener("keyup", e => {
keys[e.key.toLowerCase()] = false;
});












function movePlayer() {
if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
if (keys["d"] || keys["arrowright"]) player.x += player.speed;




// Clamp to MAP, not canvas
if (images.map.complete) {
  player.x = Math.max(0, Math.min(player.x, images.map.width - player.size));
  player.y = Math.max(0, Math.min(player.y, images.map.height - player.size));
}
}












function updateCamera() {
camera.x = player.x - camera.width / 2;
camera.y = player.y - camera.height / 2;




camera.x = Math.max(
  0,
  Math.min(camera.x, images.map.width - camera.width)
);




camera.y = Math.max(
  0,
  Math.min(camera.y, images.map.height - camera.height)
);
}




function drawBackground() {
if (!images.map.complete) return;




const sx = Math.max(0, Math.min(camera.x, images.map.width - camera.width));
const sy = Math.max(0, Math.min(camera.y, images.map.height - camera.height));




ctx.drawImage(
  images.map,
  sx, sy,
  camera.width, camera.height,
  0, 0,
  canvas.width, canvas.height
);
}












function drawBuildings() {
buildings.forEach(b => {
  ctx.drawImage(
    images[b.img],
    b.x - camera.x,
    b.y - camera.y,
    b.w,
    b.h
  );
});




signs.forEach(s => {
  ctx.drawImage(
    images[s.img],
    s.x - camera.x,
    s.y - camera.y,
    s.w,
    s.h
  );
});
}




function drawPlayer() {
ctx.fillStyle = "blue";
ctx.fillRect(
  player.x - camera.x,
  player.y - camera.y,
  player.size,
  player.size
);
}




function checkInteraction() {
buildings.forEach(b => {
  const touching =
    player.x < b.x + b.w &&
    player.x + player.size > b.x &&
    player.y < b.y + b.h &&
    player.y + player.size > b.y;




  if (touching && keys["e"]) {
    alert(`Entering ${b.name}`);
  }
});
}




images.map.onload = () => {
console.log("Map loaded:", images.map.width, images.map.height);
player.x = images.map.width / 2;
player.y = 50;
requestAnimationFrame(gameLoop);
};




images.map.onerror = () => {
console.error("MAP IMAGE FAILED TO LOAD");
};




// If the map image was loaded from cache before the onload handler was attached,
// start the game loop now so the game doesn't stay stuck showing only the
// canvas background.
if (images.map && images.map.complete) {
console.log("Map already loaded (cached):", images.map.width, images.map.height);
player.x = images.map.width / 2;
player.y = 50;
requestAnimationFrame(gameLoop);
}




function gameLoop() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
movePlayer();
updateCamera();
drawBackground();
drawBuildings();
drawPlayer();
checkInteraction();
requestAnimationFrame(gameLoop);
}
