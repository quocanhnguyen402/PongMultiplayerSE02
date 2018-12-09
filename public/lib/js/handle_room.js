//Create new socket
var socket = io();
//connect control
var connected = false;
var position = 0;

//This will be the room ID
var room = '';

//Create a random ID for the room (will have to check with the server later)
function makeRoomId() {
    var id = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
}

//Show join form when click "Join a room"
$('#btn_show_join_form').on("click", function () {
    $('#join_form').show();
});

//When click on join
$('#btn_join').on("click", function () {
    //Take the room ID in the input
    room = $('#room_id').val();
    //Tell the server to make the room
    socket.emit('room_join', room);
});

//When click on create
$('#btn_create').on("click", function () {
    //Make the room ID randomly
    room = makeRoomId();
    //Tell the server to connect to the room
    socket.emit('room_create', room);
});

//Called when the server call socket.broadcast("joined")
socket.on('joined', function (room) {
    //Hide the create or join div
    $('#create_or_join_game').hide();
    //Show the chess board container
    $('#play_ground').show();
    //Show the room info
    $('#room_info').html("You joined room:<b>" + room + "<b>");
    $('#room_info').show();
    //Change connect state to true
    // connected = true;
    //Change position to 2
    position = 2;
});

//Called when the server call socket.broadcast("join_failed")
socket.on('join_failed', function (room) {
    //Show the room info
    $('#room_info').html("Cant find room id: <b>" + room + "<b>");
    $('#room_info').show();
});

//Called when the server call socket.broadcast("another_join")
socket.on('another_join', function () {
   //Change connect state to true
   connected = true;
   //Ball controll
   socket.emit('reset_ball', room);
});

//Called when the server call socket.broadcast("created")
socket.on('created', function () {
    //Hide the create or join div
    $('#create_or_join_game').hide();
    //Show the chess board container
    $('#play_ground').show();
    //Show the room info
    $('#room_info').html("Your room id is: <b>" + room + "<b>");
    $('#room_info').show();
    //Change position to 1
    position = 1;
});

