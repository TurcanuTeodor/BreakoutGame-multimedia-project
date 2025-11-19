//loading images
const bgImg= new Image();
bgImg.src= "./img/bg.jpg";

const levelImg= new Image();
levelImg.src= "./img/level.png";

const lifeImg= new Image();
lifeImg.src= "./img/life.png";

const scoreImg= new Image();
scoreImg.src= "./img/score.png";


//loading sounds
const wallHitSound= new Audio();
wallHitSound.src= "./sound/wall.mp3";

const brickHitSound= new Audio();
brickHitSound.src= "./sound/brick_hit.mp3";

const lifeLostSound= new Audio();
lifeLostSound.src ="./sound/life_lost.mp3";

const paddleHitSound= new Audio();
paddleHitSound.src= "./sound/paddle_hit.mp3";

const winSound= new Audio();
winSound.src="./sound/win.mp3";