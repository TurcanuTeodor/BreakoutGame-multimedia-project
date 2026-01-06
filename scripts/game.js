const canvas= document.getElementById("breakoutCanvas");
const ctx= canvas.getContext("2d");

//canvas.style.border= "1px solid #0fa9";

ctx.lineWidth =3; //make lines thicker

const paddleWidth= 100;
const paddleHeight=20;
const paddleMarginBottom=50;

const ballRadius= 8;

let life=3;
let score=0;
const scoreUnit=10;

let level=1;
const maxLevel=3;

let isGameOver=false;

let leftArrow=false;
let rightArrow= false;

// sound toggle (mute/unmute all game sounds and swap icon)
const soundButton = document.getElementById("sound");
const soundIcon = soundButton ? soundButton.querySelector("img") : null; //returns the 1st elem that matches the specif css img
let soundOn = true;

function applySoundState() {
    const audioList = [
        wallHitSound,
        brickHitSound,
        lifeLostSound,
        paddleHitSound,
        winSound
    ];

    audioList.forEach(a => { if (a) a.muted = !soundOn; });

    if (soundIcon) {
        soundIcon.src = soundOn ? "img/SOUND_ON.png" : "img/SOUND_OFF.png";
        soundIcon.alt = soundOn ? "Sound on" : "Sound off";
    }
    if (soundButton) {
        soundButton.setAttribute("aria-pressed", String(!soundOn));
        soundButton.title = soundOn ? "Mute sound" : "Unmute sound";
    }
}

if (soundButton) {
    soundButton.addEventListener("click", () => {
        soundOn = !soundOn;
        applySoundState();
    });
}

// initialize sound UI and state once at load
applySoundState();


//create the paddle (js object)
const paddle ={
    x:100,
    y:480, //480+20(height of paddle)= 500(canvas height)
    width:80,
    height:20,
    dx:5 //direction on x axis -> moves only left-right
}

//draw the paddle 
function drawPaddle(){
    ctx.fillStyle="hsla(184, 100%, 54%, 0.60)";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle="#ffcd";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

//control the paddle (change the state of the variables)
//when you press a key
document.addEventListener("keydown", (event)=>{
    if(event.key ==="ArrowLeft") leftArrow =true;
    if(event.key ==="ArrowRight") rightArrow =true;
}); //moves smoothly each direction while you press the key, without needing to press repeatedly left-right

//when you lift your finger 
document.addEventListener("keyup", (event)=>{
    if(event.key ==="ArrowLeft") leftArrow= false;
    if(event.key ==="ArrowRight") rightArrow= false;
}
); 

//move the paddle (this actually moves the paddle)
function movePaddle(){
    if(rightArrow && paddle.x+paddle.width<canvas.width) //
        paddle.x +=paddle.dx;
    else if(leftArrow && paddle.x>0) //
        paddle.x-=paddle.dx;
}


//create the ball (elements of the game => all json objects)
const ball = {
    x: canvas.width/2, //in the middle of x axis
    y: paddle.y - ballRadius, // on the y axis is right on top of paddle, at a radius distance
    radius: ballRadius,
    speed:4,
    dx: 3* (Math.random()*1.6-0.8), //this way the ball moves in any direction , *3 so its 3x faster
    dy:-3 //the balls start moving up when the game begins
}

//draw the ball
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle= "#ebc8ecff";
    ctx.fill();
    ctx.strokStyle="#520266ff";
    ctx.stroke();
    ctx.closePath(); //create path from current point to the start  
}

//move the ball
function moveBall(){
    ball.x += ball.dx;
    ball.y +=ball.dy;
}


//ball and wall collision
function ballWallCollision(){
    //left - right walls
    if(ball.x + ball.radius >canvas.width || ball.x-ball.radius< 0){
        ball.dx = -ball.dx; //reverse the sign of the value
        wallHitSound.play();
    }

    //top wall
    if(ball.y - ball.radius <0 ) { //bc the top of y axis is negative
        ball.dy = -ball.dy; //reverse sign
        wallHitSound.play();
    }

    //bottom wall => missed the paddle
    if(ball.y+ball.radius> canvas.height){
        life--;
        lifeLostSound.play();
        resetBall();
    }
}

//reset ball => give it the intial values again
function resetBall(){
    ball.x= canvas.width/2;
    ball.y= paddle.y - ballRadius;
    ball.dx = 3* (Math.random()*1.6-0.8);
    ball.dy=-3;
}


//ball and paddle collision 
function ballPaddleCollision(){
    //verify on x axis if the ball is exactly on the paddle
    const withinX = ball.x >paddle.x && ball.x<paddle.x +paddle.width;

    //verify on y axis 
    const withinY = ball.y + ball.radius >= paddle.y && ball.y -ball.radius <= paddle.y+paddle.height;

    //if the 2 verifications above are true 
    if(withinX && withinY){
        paddleHitSound.play();

        let collidePoint = ball.x-(paddle.x+paddle.width/2); //calculate the exact point of collision (negative => ball hit left side of paddle; 0 => middle; positive => ball hit right side of paddle)  )

        collidePoint /= (paddle.width/2); //make the point between -1 and 1 

        const angle = collidePoint * (Math.PI/3); // if hit left side paddle -> collidePoint =-1 -> angle =-60 grades etc 

        //calculate the new dx and dy based on the angle you got
        ball.dx=ball.speed *Math.sin(angle); //horizontal direction
        ball.dy=-ball.speed *Math.cos(angle); //vertical direction
    }
}


//create brick object
const brick={
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    offSetLeft:20,
    offSetTop: 20,
    marginTop: 40,
    fillColor:"#c884c8ff",
    strokeColor: "#652727ff"
};

//create the bricks arrangement 
let bricks; 

function createBricks(){
    bricks=[];
    for(let r=0; r< brick.row; r++){
        bricks[r]=[]; //create no. of rows of brick.row no.
        for(let c=0; c<brick.column; c++){
            //now create bricks as you pass column by columns
            bricks[r][c]={
                x: c*(brick.width + brick.offSetLeft) +brick.offSetLeft , //this puts bricks in columns
                y: r*(brick.height + brick.offSetTop)+ brick.offSetTop + brick.marginTop,
                status: true //by default brick exist and needs drawing // hit by ball => false exists but no need drawing 
            } 
        }
    }
}

createBricks();

//draw the bricks arrangement
function drawBricks(){
    for(let r=0; r<brick.row; r++){
        for(let c=0; c< brick.column; c++){
            const b= bricks[r][c];
            if(b.status){
                ctx.fillStyle= brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle= brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}


//ball and bricks collision
function ballBrickCollision(){
for(let r=0; r<brick.row; r++){
        for(let c=0; c< brick.column; c++){
            const b= bricks[r][c];

            if(!b.status) continue;

            const hitX= ball.x + ball.radius > b.x && ball.x- ball.radius < b.x+brick.width;
            const hitY= ball.y + ball.radius >b.y && ball.y- ball.radius < b.y+brick.height;

            if(hitX && hitY){ 
                brickHitSound.play();
                ball.dy = -ball.dy; //reverse signs of the ball bc it bounced back in the opposite direction
                b.status= false; 
                score += scoreUnit;
                return;
            }
        }
    }
}


//ui: score, lives, level
function showGameStats(text, textX, textY, img, imgX, imgY) {
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Arial";
    ctx.fillText(text, textX, textY);

    ctx.drawImage(img, imgX, imgY, 25, 25);
}


//draw everything
function draw(){
    drawPaddle();
    drawBall();
    drawBricks();

    //all stats in a single row with equal spacing
    const statsY = 30; // vertical position for all text
    const imgY = 10;   // vertical position for all images
    const spacing = 100; // distance between each stat group (image + text)
    const startX = 20;  // starting position from left
    
    //position 1
    showGameStats(score, startX + 35, statsY, scoreImg, startX, imgY);
    
    //position 2
    showGameStats(life, startX + spacing + 35, statsY, lifeImg, startX + spacing, imgY);
    
    //position 3
    showGameStats(level, startX + spacing*2 + 35, statsY, levelImg, startX + spacing*2, imgY);
}


//game over
function gameOverFunction(){
    if(life<=0){
        showYouLose();
        isGameOver=true;
    }
}


//level up
function levelUp(){
    let finished= true;

    for(let r=0; r<brick.row; r++){
        for(let c=0; c<brick.column; c++){
            if(bricks[r][c].status){
                finished= false;
                break;
            }
        }
    }

    if(finished){
        winSound.play();

        if(level >= maxLevel){
            showYouWin();
            isGameOver=true;
            return;
        }

        //next level means more bricks per row and more speed for ball
        brick.row++;
        ball.speed +=0.5;
        createBricks();
        resetBall();
        level++;
    }
}


//update -> means movement and collison and end/win/levelup game
function update(){
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOverFunction();
    levelUp();
}


//game over overlay 
const gameOverScreen = document.getElementById("gameOver");
const youWon = document.getElementById("youWon");
const youLose = document.getElementById("youLose");
const restart = document.getElementById("restart");

restart.addEventListener("click",()=>{
    location.reload();
});

function showYouWin(){
    gameOverScreen.style.display="flex"; //makes it visible and centers content
    youWon.style.display="block";
}

function showYouLose(){
    gameOverScreen.style.display="flex";
    youLose.style.display="block";
}

//start game loop
function loop(){
    if(isGameOver) return;
    ctx.clearRect(0,0,canvas.width, canvas.height) //clean canvas
    draw(); //redraw
    update();
    requestAnimationFrame(loop); //call loop again
}

document.querySelector('.arcade-btn.red').addEventListener('mousedown',function()
{
    leftArrow=true;
});

document.querySelector('.arcade-btn.red').addEventListener('mouseup', function(){
    leftArrow=false;
});

document.querySelector('.arcade-btn.blue').addEventListener('mousedown',function(){
    rightArrow=true;
});

document.querySelector('.arcade-btn.blue').addEventListener('mouseup',function(){
    rightArrow=false;
});

const startButton = document.getElementById('start');
const startGameScreen= document.getElementById('startGame');

startButton.addEventListener('click', ()=>{
    startGameScreen.style.display='none';
    loop(); // start the game 

})
