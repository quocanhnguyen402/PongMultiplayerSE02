//Ball variables
var ball_speed = 3;
const BALL_RADIUS = 20;
var ball, ballVelocity, ball_ready = false;
//Paddle variables
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
//Player variables
var player1Position, player2Position;
var player1Velocity, player2Velocity;
var player1Score, player2Score;
//Playing state and time count
var start_sate = false;
var playing_state = false;
var time_count = 3;

function setup() {
    //Create playground in the div that have id="play_ground"
    var canvas = createCanvas(600, 400);
    canvas.parent('play_ground');
    //Initialize player position to mid screen
    player1Position = player2Position = height / 2 - 50;
    //Set velocity and score to 0
    player1Velocity = player2Velocity = 0;
    player1Score = player2Score = 0;
    //Set text
    textAlign(CENTER);
    textSize(30);
    //Color the playground
    fill(255);
}

function draw() {
    //Draw background
    background(0);
    //Draw paddles
    rect(PADDLE_WIDTH * 2, player1Position, PADDLE_WIDTH, PADDLE_HEIGHT);
    rect(width - (PADDLE_WIDTH * 3), player2Position, PADDLE_WIDTH, PADDLE_HEIGHT);
    if (ball_ready) {
        //Draw ball
        ellipse(ball.x, ball.y, BALL_RADIUS);
    }
    //Draw scoreboard
    text(player1Score + "  |  " + player2Score, width / 2, 50);
    //Handle the paddles
    handlePlayerMove();
    //Handle the ball
    handleBall();
}

function handleBall() {
    //If the ball is in play
    if (playing_state && connected && ball_ready) {
        //Ball position
        ball.x += ballVelocity.x;
        ball.y += ballVelocity.y;
        //Top & bottom collisions
        if (ball.y > height || ball.y < 0) {
            //Reverse y-velocity
            ballVelocity.y *= -1;
        }
        //Within range on the left side
        if (ball.x <= PADDLE_WIDTH * 3) {
            console.log([ball.x, width - ball.x, PADDLE_WIDTH]);
            //Out of bounds
            if (ball.x <= PADDLE_WIDTH) {
                ball_ready = false;
                socket.emit('player_right_score', room);
                socket.emit('reset_ball', room);
                return;
            }
            //Check collision on left paddle
            if (ball.y > player1Position && ball.y < player1Position + PADDLE_HEIGHT) {
                //Prevent the ball from getting stuck inside paddle
                if (ballVelocity.x < 0) {
                    //Increase the ball speed
                    ball_speed++;
                    ballVelocity.setMag(ball_speed);
                    //Hit the ball back
                    ballVelocity.x *= -1;
                    ballVelocity.mult(random(1, 1.1));
                }
            }
            //Right paddle
        } else if (ball.x >= width - (PADDLE_WIDTH * 3)) {
            //When out of bounds
            if (ball.x >= width - PADDLE_WIDTH) {
                ball_ready = false;
                socket.emit('player_left_score', room);
                socket.emit('reset_ball', room);
                return;
            }
            //Check collision on right paddle
            if (ball.y > player2Position && ball.y < player2Position + PADDLE_HEIGHT) {
                //Prevent the ball from getting stuck inside paddle
                if (ballVelocity.x > 0) {
                    //Increase the ball speed
                    ball_speed++;
                    ballVelocity.setMag(ball_speed);
                    //Hit the ball back
                    ballVelocity.x *= -1;
                    ballVelocity.mult(random(1, 1.1));
                }
            }
        }
        //If not
    } else if (connected && ball_ready) {
        //Countdown every 1 sec
        if (frameCount % 60 == 0) {
            time_count--;
        }
        //Print the remaining time
        text(time_count, width / 2, height / 2 - 30);
        //If countdown time is over then play the ball
        if (time_count == 0) {
            playing_state = true;
        }
    }
}

function ball_reset(x, y) {
    //Set ball to center
    ball = createVector(width / 2, height / 2);
    //Reset the ball speed to default(3)
    ball_speed = 3;
    //Set a new vector for the ball
    // ballVelocity = createVector(random(-1, 1), random(-1, 1));
    ballVelocity = createVector(x, y);
    //Set ball speed to default speed
    ballVelocity.setMag(ball_speed);
    //Set ball to be ready
    ball_ready = true;
}

function handlePlayerMove() {
    //Player one controls
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) { //w key
        //Move up
        player1Velocity -= 7.5;
        //Tell the server to move us up
        socket.emit('move_up', room);
        //
    } else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { //s key
        //Move down
        player1Velocity += 7.5;
        //Tell the server to move us down
        socket.emit('move_down', room);
    }
    //Change position
    player1Position += player1Velocity;
    //Friction
    player1Velocity *= 0.4;
    //Constrain paddles
    player1Position = constrain(player1Position, 0, height - PADDLE_HEIGHT);
}

function move_player_2() {
    //Change position
    player2Position -= player2Velocity;
    //Friction
    player2Velocity *= 0.4;
    //Constrain paddles
    player2Position = constrain(player2Position, 0, height - PADDLE_HEIGHT);
}

//Called when the server call socket.broadcast("move_up")
socket.on('move_up', function () {
    //Move up
    player2Velocity += 7.5;
    //Change position
    move_player_2();
});

//Called when the server call socket.broadcast("move_down")
socket.on('move_down', function () {
    //Move up
    player2Velocity -= 7.5;
    //Change position
    move_player_2();
});

//Called when the server call socket.broadcast("reset_ball")
socket.on('reset_ball', function (obj) {
    if (position == 1) {
        var x = obj.x;
        var y = obj.y;
    } else {
        var x = obj.x*-1;
        var y = obj.y*-1;
    }
    ball_reset(x,y);
});

//Called when the server call socket.broadcast("player_left_score")
socket.on('player_left_score', function () {
    player1Score++;
});

//Called when the server call socket.broadcast("player_right_score")
socket.on('player_right_score', function () {
    player2Score++;
});