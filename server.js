/*
//////////////////////////////////////////////////////////////////
// =======================  INITALIZE ======================== //
////////////////////////////////////////////////////////////////
*/

var express=require('express');
var async=require('async');
var app=express();
app.set('port', process.env.PORT || 3000);
var io = require("socket.io").listen(app.listen(app.get('port')) ,{log: false});

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
}

function generateTime(){
	return new Date().getTime();
}

function generateQuestion(){

}
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
				player1: socket,
				player2: socket,
				roundStartTime: {0-9}
			}
		}
		
*/
/* SOCKET:
		//one player's socket instance
		{
			"room" : {a-zA-Z0-9}{6},
			"opponent" : socket,
			"points" : {0-9},
			"ready" : false,
			"done" : false;
		}
*/

io.sockets.on("connection",function(socket){
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
			socket.set("ready", false);
			socket.set("done", false);

			io.sockets.in(room).emit("notify", { success:1, message:"Both players connected." } );
		}
		// Player 1 has joined the room
		else{

			// initialize player 1
			socket.join(data.room);
			socket.set("room", room);
			socket.set("points",0);
			socket.set("ready", false);
			socket.set("done", false);
		}
	});

	socket.on("gamestart",function(){
		async.parallel([
			socket.get.bind(this, "room"),
			socket.get.bind(this, "opponent"),
			socket.get.bind(this, "done")
	    ], function(err, results) {

	    	socket.set("ready", true);

	    	results[1].get("ready", function(err,ready){
	    		// if both players are ready
	    		if(ready){

	    			// countdowns down in the frontend
	    			socket.emit("countdown", { count : 5 });

	    			// wait for countdown (5,4,3,2,1,start) == 6 seconds
					setTimeout(function(){

						//start time, generate question, emit it to front end
						games[results[0]].roundStartTime=generateTime();
						console.log("START!!!!");
						//emit (roundLimitTime-(roundNewTime - roundStartTime))/roundLimitTime
						// roundLimitTime = 5? 10? (sec)
						/*var stopinterval=setInterval(function(){
							// if both finished, stop interval
							// socket.on("done") will set 
							
							results[1].get("done", function(err,done){
								if(done && results[2]){
									clearInterval(stopinterval);
								}
							});


						},100);*/

					},6000);
	    		}
	    		else{
	    			socket.emit("notify", { success:0, message:"Waiting on your friend to get ready..."});
	    			socket.emit("notify", { success:0, message:"Your friend is ready!"});
	    		}
	    	});
	    });
	});

	socket.on("test",function(){
		socket.emit("countdown", { count : 5 });

		setTimeout(function(){
			console.log("hello");
		},6000);
	});
});








