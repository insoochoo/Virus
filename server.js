/*
//////////////////////////////////////////////////////////////////
// =======================  INITALIZE ======================== //
////////////////////////////////////////////////////////////////
*/

var express=require('express');
var async=require('async');
var app=express();
app.set('port', process.env.PORT || 8080);
var io = require("socket.io").listen(app.listen(app.get('port')));

console.log("Listening on port http://localhost:" + app.get('port'));
app.use("/static", express.static(__dirname + "/static"));


/*
//////////////////////////////////////////////////////////////////
// =======================  FUNCTIONS ======================== //
////////////////////////////////////////////////////////////////
*/


function generateRoom(length) {
    var collection = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var room="";

	for(var i=0; i<length; i++){
		room += collection.charAt(Math.floor(Math.random() * collection.length));
	}
	return room;
};


/*
//////////////////////////////////////////////////////////////////
// ==========================  URL =========================== //
////////////////////////////////////////////////////////////////
*/


app.get('/', function(req, res){
	res.render('index.jade');
});

app.get('/room', function(req, res){
	room=generateRoom(6);
	res.render('main.jade', {shareURL: req.host+"/"+room, share: room});
});

app.get('/:room{a-zA-Z0-9}{6}', function(req, res){
	room=req.params.room;
	res.render('main.jade', {shareURL: req.host+"/"+room, share: room});
});


/*
//////////////////////////////////////////////////////////////////
// ======================  SOCKETIO ========================== //
////////////////////////////////////////////////////////////////
*/

/* GAMES:
		//contains all game instances
		{
			*room* : {
				player1: socket
				player2: socket
			}
		}
		
*/
/* SOCKET:
		//one player's socket instance
		{
			"room" : {a-zA-Z0-9}{6}
			"opponent" : socket
			"points" : {0-9}
		}
*/

io.sockets.on("connection",function(){
	socket.on("join",function(data){

		//initialize socket

		if(room in games){

			//check if 2nd player already exists
			if(games[room].player2){
				socket.exit("full");
				return;
			}

			// initialize player 2
			socket.join(data.room);
			socket.set("room", room);
			socket.set("opponent", games[room].player1);
			games[room].player1.set("opponent",socket);
			socket.set("points",0);

			io.sockets.in(room).emit("notify", { success:1, message:"Both players connected." } );
		}
		// Player 1 has joined the room
		else{

			// initialize player 1
			socket.join(data.room);
			socket.set("room", room);
			socket.set("points",0);
		}
	});


});








