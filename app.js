var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 6969;

//Define the default route
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/pong_game_page.html');
});

//Listen to the given port
http.listen(port, function () {
    console.log("Listening on * " + port);
});

//Array to store rooms
var rooms_nr_client = [];

//Setup socket server
var io = require('socket.io')(http);

function get_random_float(min, max) {
    return Math.random() * (max - min) + min;;
}

//When have a connection
io.on('connection', function (socket) {
    console.log("Connect created");
    //Call when the client call socket.emit('room_create', _);
    socket.on('room_create', function (room) {
        console.log("Room " + room + " created");
        result = socket.join(room);
        rooms_nr_client.push(room);
        socket.emit('created', room);
    });
    //Call when the client call socket.emit('room_join', _);
    socket.on('room_join', function (room) {
        //Variable to check
        var have_room = false;
        //Check if there is a room with the given id
        for (let index = 0; index < rooms_nr_client.length; index++) {
            if (room == rooms_nr_client[index]) {
                have_room = true;
                break;
            }
        }
        //If there is a room join it, if not tell the client there is not
        if (have_room) {
            console.log("New connection at room " + room);
            socket.join(room);
            socket.emit('joined', room);
            socket.emit('another_join');
            socket.in(room).emit('another_join');
        } else {
            socket.emit('join_failed', room);
        }
    });
    //Call when the client call socket.emit('move_up', _);
    socket.on('move_up', function (room) {
        //Send to all ppl in room except sender
        socket.broadcast.to(room).emit('move_down');
    });
    //Call when the client call socket.emit('move_down', _);
    socket.on('move_down', function (room) {
        //Send to all ppl in room except sender
        socket.broadcast.to(room).emit('move_up');
    });
    //Call when the client call socket.emit('reset_ball', _);
    socket.on('reset_ball', function (room) {
        //Create x and y for the ball vector
        var x = get_random_float(-1, 1);
        var y = get_random_float(-1, 1);
        var obj = {
            x: x,
            y: y,
        };
        //Send to all ppl in room include sender
        socket.emit('reset_ball', obj);
        socket.in(room).emit('reset_ball', obj);
    });
    socket.on('player_right_score', function (room) {
        socket.emit('player_right_score', room);
    });
    socket.on('player_left_score', function (room) {
        socket.emit('player_left_score', room);
    });
});