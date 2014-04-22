var express = require("express");
var async = require("async");
var app = express();
app.set('port', process.env.PORT || 3000);
var io = require("socket.io").listen(app.listen(app.get('port')) ,{log: false});
 
console.log("Listening on port" + app.get('port'));

app.use("/static", express.static(__dirname + "/static"));

var length=12;

games={
	/*
		*room_id* :{
			player1: Null //Type: socket
			player2: Null //Type: socket

		}
	*/
}

function generateRoom() {
    var collection = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var room="";

	for(var i=0; i<length; i++){
		room += collection.charAt(Math.floor(Math.random() * collection.length));
	}
	return room;
};
function initBoard(){
	var board=[]
	for (var i=0; i < length; i ++){
		row=[]
		for (var j=0; j < length; j++){
			row.push(0);
		}
		board.push(row);
	}

	for(var i = 0; i < length; i++) {
		board[0][i] = -1;
		board[1][i] = -1;
		board[length - 1][i] = -1;
		board[length - 2][i] = -1;
		board[i][length - 1] = -1;
		board[i][length - 2] = -1;
		board[i][0] = -1;
		board[i][1] = -1;
	}

	//Place the initial germs on the board
	board[2][2] = 1;
	board[length - 3][length - 3] = 1;
	board[length - 3][2] = 2;
	board[2][length - 3] = 2;
	return board
}

// Pass in the current board state(2d array), the number of the current player (1 or 2) and the coordinate of the selected block
// Returns an array of valid coordinates
function validGrid(currentBoard, currentPlayer, selectedX, selectedY) {
	var validGridList = [];
	for(var i = 0; i < 5; i++) {
		for(var j = 0; j < 5; j++) {
			if(currentBoard[selectedX - 2 + i][selectedY - 2 + j] == 0) {
				var validGrid = {x:selectedX - 2 + i, y:selectedY - 2 + j};
				validGridList.push(validGrid)
			}
		}
	}
	return validGridList;
}

// Counts germs
function countGerms(currentBoard, currentPlayer) {
	var count = 0;
	for (var i= 2; i<length - 2; i++)
		for(var l=0; l<length - 2; l++)
			if(currentBoard[i][l] == currentPlayer)
				count ++
	return count;
}

function infectedGridShort(currentBoard, row, column, currentPlayer) {
	var opponent;
	if(currentPlayer == 1) {
		opponent = 2;
	} 
	else {
		opponent = 1;
	}
	if(currentBoard[row+1][column] == opponent) {
		var infectedGrid = {x:row+1, y:column};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row+1][column+1] == opponent) {
		var infectedGrid = {x:row+1, y:column+1};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row][column+1] == opponent) {
		var infectedGrid = {x:row, y:column+1};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row-1][column+1] == opponent) {
		var infectedGrid = {x:row-1, y:column+1};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row-1][column] == opponent) {
		var infectedGrid = {x:row-1, y:column};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row-1][column-1] == opponent) {
		var infectedGrid = {x:row-1, y:column-1};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row][column-1] == opponent) {
		var infectedGrid = {x:row, y:column-1};
		infectedGridList.push(infectedGrid);
	}
	if(currentBoard[row+1][column-1] == opponent) {
		var infectedGrid = {x:row+1, y:column-1};
		infectedGridList.push(infectedGrid);
	}
	return infectedGridList;
}

// Takes in the current board state, the row and column of the germ placement, and the id of the current player
// Returns a list of grids that are infected by the germ placement
function infectedGrid(currentBoard, row, column, currentPlayer) {
	var opponent;
	if(currentPlayer == 1) {
		opponent = 2;
	} 
	else {
		opponent = 1;
	}

	var infectedGridList = [];
	if(row > 0 && row < length - 1 && column > 0 && column < length - 1) {
		if(currentBoard[row+1][column] == opponent) {
			var infectedGrid = {x:row+1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column+1] == opponent) {
			var infectedGrid = {x:row+1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column+1] == opponent) {
			var infectedGrid = {x:row, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column+1] == opponent) {
			var infectedGrid = {x:row-1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column] == opponent) {
			var infectedGrid = {x:row-1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column-1] == opponent) {
			var infectedGrid = {x:row-1, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column-1] == opponent) {
			var infectedGrid = {x:row, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column-1] == opponent) {
			var infectedGrid = {x:row+1, y:column-1};
			infectedGridList.push(infectedGrid);
		}
	}
	if(row > 0 && row < length - 1 && column == 0) {
		if(currentBoard[row+1][column] == opponent) {
			var infectedGrid = {x:row+1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column+1] == opponent) {
			var infectedGrid = {x:row+1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column+1] == opponent) {
			var infectedGrid = {x:row, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column+1] == opponent) {
			var infectedGrid = {x:row-1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column] == opponent) {
			var infectedGrid = {x:row-1, y:column};
			infectedGridList.push(infectedGrid);
		}
	}
	if(row > 0 && row < length - 1 && column == length - 1) {
		if(currentBoard[row-1][column] == opponent) {
			var infectedGrid = {x:row-1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column-1] == opponent) {
			var infectedGrid = {x:row-1, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column-1] == opponent) {
			var infectedGrid = {x:row, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column-1] == opponent) {
			var infectedGrid = {x:row+1, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column] == opponent) {
			var infectedGrid = {x:row+1, y:column};
			infectedGridList.push(infectedGrid);
		}
	}
	if(row == 0 && column > 0 && column < length - 1) {
		if(currentBoard[row+1][column] == opponent) {
			var infectedGrid = {x:row+1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column+1] == opponent) {
			var infectedGrid = {x:row+1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column+1] == opponent) {
			var infectedGrid = {x:row, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column-1] == opponent) {
			var infectedGrid = {x:row, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row+1][column-1] == opponent) {
			var infectedGrid = {x:row+1, y:column-1};
			infectedGridList.push(infectedGrid);
		}

	}
	if(row == length - 1 && column > 0 && column < length - 1) {
		if(currentBoard[row][column+1] == opponent) {
			var infectedGrid = {x:row, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column+1] == opponent) {
			var infectedGrid = {x:row-1, y:column+1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column] == opponent) {
			var infectedGrid = {x:row-1, y:column};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row-1][column-1] == opponent) {
			var infectedGrid = {x:row-1, y:column-1};
			infectedGridList.push(infectedGrid);
		}
		if(currentBoard[row][column-1] == opponent) {
			var infectedGrid = {x:row, y:column-1};
			infectedGridList.push(infectedGrid);
		}
	}
	return infectedGridList;

}

//URL CONFIG
app.get("/", function(req, res) {
    res.render("index.jade");
});
app.get("/room", function(req, res) {
	var room=generateRoom();
    res.render("main.jade", {shareURL: req.host+"/"+room, share: room});
});
app.get("/:room([a-zA-Z0-9]{"+length+"})",function(req,res){
	room=req.params.room
    res.render("main.jade", {shareURL: req.host+"/"+room, share: room});
});
app.get("/error_full",function(req, res){
	res.render("full.jade");
});
app.get("/exit",function(req, res){
	res.render("exit.jade");
});
app.get("/error_opponent",function(req, res){
	res.render("exit_forfit.jade");
});
app.get("/about",function(req, res){
	res.render("about.jade");
});


io.sockets.on("connection",function(socket){
	console.log("connection detected");
	socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Welcome to VIRUS" });
	socket.on("join",function(data){
		console.log("server room:" + data.room);
		
		// Player 2 or more joins the room
		if(data.room in games){
			// Validate if room is full or not
			if(games[data.room].player2)
			{
				console.log("3RD PLAYER TRIED TO JOIN THE GAME")
				socket.emit("kick");
				return;
			}

			// Initiate player 2
			socket.join(data.room);
			socket.set("room", data.room);
			socket.set("pid", 2);
			socket.set("color", "#F56363");
			socket.set("preview",[]);
			socket.set("ready",true);
			// Set opponents
			socket.set("opponent", games[data.room].player1);
			games[data.room].player1.set("opponent", socket);

			// Set turn
			socket.set("turn", false);
			socket.get("opponent",function(err,opponent){
				opponent.set("turn",true);
			});

			//Initialize selected grid's coordinate to -1 (nothing selected)
			socket.set("selectedX", -1);
			socket.set("selectedY", -1);

			// Save player 2 socket into "games" object
			games[data.room].player2 = socket;

			io.sockets.in(data.room).emit("online");

			console.log("PLAYER 2 HAS JOINED THE GAME");
			socket.emit("message",{ me: false, players: false, color: "#bdc3c7", message : "Player 1 has joined the game." });
			io.sockets.in(data.room).emit("message",{ me: false, players: false, color: "#bdc3c7", message : "Player 2 has joined the game." });

			games[data.room].player1.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "It's your turn!" });
			socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Your opponent's turn!" });
		    		
			//Notify players
			games[data.room].player1.emit("notify",{connected:1, turn : true});
			socket.emit("notify",{connected:1, turn : false});

			var player1Color;
			var player2Color;
			games[data.room].player1.get("color", function(err, data){
				player1Color = data;
			}); 
			games[data.room].player2.get("color", function(err, data){
				player2Color = data;
			}); 

			//Message front end to place starting germs onto the table
			io.sockets.in(data.room).emit("place", {row:2, column:2, infectedGrids:[], color:player1Color});
			io.sockets.in(data.room).emit("place", {row:length - 3, column:length - 3, infectedGrid:[], color:player1Color});
			io.sockets.in(data.room).emit("place", {row:length - 3, column:2, infectedGrids:[], color:player2Color});
			io.sockets.in(data.room).emit("place", {row:2, column:length - 3, infectedGrids:[], color:player2Color});

			//set initial scores
			io.sockets.in(data.room).emit("updateScore", {p1 :2, p2:2});
		}

		// Initiate player 1 and game table
		else{
			//Initiate player 1
			socket.join(data.room);
			socket.set("room", data.room);
			socket.set("pid", 1);
			socket.set("color", "#FDD761");
			socket.set("turn", false);
			socket.set("preview", []);
			socket.set("ready",true);
			//Initialize selected grid's coordinate to -1 (nothing selected)
			socket.set("selectedX", -1);
			socket.set("selectedY", -1);
			//Initiate game table as an array
			board=initBoard();

			/*board=[ [ 0, 2, 2, 2, 2, 2, 2 ],
			  		[ 2, 2, 2, 2, 2, 2, 2 ],
			  		[ 2, 2, 2, 2, 2, 2, 2 ],
			  		[ 2, 2, 2, 2, 2, 2, 2 ],
			  		[ 2, 2, 2, 2, 2, 2, 2 ],
			  		[ 2, 2, 2, 2, 2, 2, 2 ] ];*/

			console.log(board);
			// initiate "games" object
			games[data.room]={
				player1: socket,
				player2: null,
				board: board,
				ended: false
			}
			
			console.log("PLAYER 1 HAS JOINED THE GAME");
			socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Player 1 has joined the game." });
		}
	});
	// check where the player put the "box"
	socket.on("click",function(data){
		async.parallel([
			socket.get.bind(this, "turn"),
			socket.get.bind(this, "opponent"),
			socket.get.bind(this, "room"),
			socket.get.bind(this, "pid"),
			socket.get.bind(this, "color"),
			socket.get.bind(this, "selectedX"),
			socket.get.bind(this, "selectedY")

	    ], function(err, results) {
	    	// check if both players are in the game/room
	    	if(games[results[2]].player2){	
	    		// check if game is ready to be played
	    		if(!games[results[2]].ended){
	    			// check if it is the player's turn
			    	if(results[0]){
			    		var currentBoard = games[results[2]].board;
			    		var column = data.column;
			    		var row = data.row;
						//Check if the selected grid belongs to current player
		    			if(currentBoard[row][column] == results[3]) {
		    				socket.emit("clearAvailable");
		    				socket.set("selectedX", row);
		    				socket.set("selectedY", column);
		    				// Show available grid now
		    				var validPlacementList = validGrid(currentBoard, results[3], row, column);
		    				socket.emit("available",{available: validPlacementList});
		    			}
		    			// If the player has selected an empty grid
		    			else if(currentBoard[row][column] == 0) {
				    		// If the player has not selected a germ beforehand
				    		if(results[5] == -1) {
				    			socket.emit("errorMessage", { message : "Select the germ you want to move first" });
				    		}
				    		// If the player has already selected a germ beforehand
				    		else {
				    			// Get the valid placements for this grid
				    			var validPlacementList = validGrid(currentBoard, results[3], results[5], results[6]);
					    		console.log(validPlacementList);
					    		var isValid = false;
					    		for(var i = 0; i < validPlacementList.length; i++) {
					    			if(validPlacementList[i].x == row && validPlacementList[i].y == column) {
					    				isValid = true;
					    				break;
					    			}
					    		}	
					    		if(isValid == true) {
					    			socket.emit("clearAvailable");
					    			// Place germ here
					    			games[results[2]].board[row][column] = results[3];

					    			

					    			
					    			// Change board state according to infected grid
					    			var infectedGridList = infectedGrid(currentBoard, row, column, results[3]);
					    			for(var i = 0; i < infectedGridList.length; i++) {
					    				games[results[2]].board[infectedGridList[i].x][infectedGridList[i].y] = results[3];
					    			}

									// If the placement is a jump, clear the previous block
					    			if(Math.abs(row - results[5]) == 2 || Math.abs(column - results[6]) == 2) {
					    				games[results[2]].board[results[5]][results[6]] = 0;
					    				// Broadcast message to move germ to new location
					    				io.sockets.in(results[2]).emit("move", { row:data.row, column:data.column, infectedGrids:infectedGridList, color: results[4], prevRow: results[5], prevCol: results[6] });
					    			}
					    			else {
					    				// Broadcast message of germ placement to front end
					    				io.sockets.in(results[2]).emit("place", { row:data.row, column:data.column, infectedGrids:infectedGridList, color: results[4] });	
					    			}

					    			//Reset the player's selected coordinate
					    			socket.set("selectedX", -1);
					    			socket.set("selectedY", -1);

					    			
					    			//Pass the turn to the opponent
					    			socket.set("turn", false);
					    			results[1].set("turn", true);
					    			results[1].emit("message",{ me:false, players: false, color: "#bdc3c7", message : "It's your turn!" });
									socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Your opponent's turn!" });
									



				    				var p1Count = countGerms(games[results[2]].board, 1);
				    				var p2Count = countGerms(games[results[2]].board, 2);
				    				//console.log(p1Count + " " + p2Count);
				    				io.sockets.in(results[2]).emit("updateScore", {p1 : p1Count, p2: p2Count});


				    				//TODO: Update win condition checking
				    				/*if (p1Count+p2Count != 64 && opponentValidPlacement.length == 0){
				    					results[1].emit("gameover", {message:"You Lost!"});
				    					socket.emit("gameover", {message:"You Won!"});
				    				}
				    				else*/ if (p1Count+p2Count == 64){
				    					if (p1Count > p2Count && results[3] == 1 || p2Count > p1Count && results[3]==2){
				    						results[1].emit("gameover", {message:"You Lost!"});
				    						socket.emit("gameover", {message:"You Won!"});
				    					}
				    					else if (p1Count > p2Count && results[3] == 2 || p2Count > p1Count && results[3] == 1){
				    						socket.emit("gameover", {message:"You Lost!"});
				    						results[1].emit("gameover", {message:"You Won!"});
				    					}
				    					else if (p1Count == p2Count){
				    						socket.emit("gameover", {message:"Draw!"});
				    						results[1].emit("gameover", {message:"Draw!"});
				    					}
				    				}


					    		}
					    		else {
					    			// You can't place germ here
					    			socket.emit("errorMessage", { message: "You can't place your germ here." });
					    		}
				    		}
				    	}
			    		
			    		else {
			    			
			    		}
			    		
				    }
			    	else{
			    		console.log(results[3] + " opponent's turn");
			    		socket.emit("errorMessage", { message : "It's your opponent's turn." });
			    	}
			    }
			    else{
		    		console.log("not all players are ready");
			    	socket.emit("notify",{connected:0, turn : results[0]});
			    }
		    }
		    else{
		    	console.log("player 2 hasn't joined yet");
		    	socket.emit("errorMessage", { message : "Please wait until your opponent arrives" });
		    }
	    });
	});

	socket.on("hover",function(data){
		async.parallel([
			socket.get.bind(this, "room"),
			socket.get.bind(this, "color"),
			socket.get.bind(this, "opponent"),
			socket.get.bind(this, "preview")
	    ], function(err, results) {

			if(results[0] in games){
			
				// on mouseenter
			    if(data.hover == 1){
			    	socket.set("preview", [data.row, data.column]);
			    	io.sockets.in(results[0]).emit("preview",{ hover:1, row:data.row, column:data.column, color:results[1] });
			    }

			    // on mouseleave
			    else{
			    	io.sockets.in(results[0]).emit("preview",{ hover:0, row:results[3][0], column:results[3][1], color:results[1] });
			    	if(games[results[0]].player2){
				    	results[2].get("preview", function(err, preview) {
				    	
			    			//if row and column are the same
			    			//if both players hovering over the same block
			    			if(results[3][0] == preview[0]
			    				&& results[3][1] == preview[1]){
			    				results[2].get("color", function(err, color) {
			    				//re-color whoever is still hovering over the same block again
			    					io.sockets.in(results[0]).emit("preview",{ hover:1, row:preview[0], column:preview[1], color:color });
			    				});
			    				socket.set("preview", []);
			    			}
				    	});
					}
			    	
			    }
			}
	    });
	});

	// ready is reset
	// players ready becomes true when user clicks "ok" when asked to play again
	socket.on("reset_ready",function(){
		socket.set("ready", false);
	});

	socket.on("reset",function(){
		async.parallel([
			socket.get.bind(this, "turn"),
			socket.get.bind(this, "room"),
			socket.get.bind(this, "opponent")
	    ], function(err, results) {
	    	if(results[1] in games){
				//re-initialize board
				board=initBoard();
		    	games[results[1]].board=board;
				socket.set("ready", true);
				socket.emit("message",{ me:false, players: false, color: "#343a3d", message : "Waiting for your opponent to rematch!" });
				results[2].emit("message",{ me:false, players: false, color: "#343a3d", message : "Your opponent wants to rematch!" });
				    	
	    		// to check if opponent is also ready
	    		results[2].get("ready",function(err, ready){
	    			
	    			// if your opponent is ready, reset game
	    			if(ready){
	    				console.log("ready");
				    	games[results[1]].ended=false;
				    	if(results[0]){
							socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "It's your turn!" });
			    			results[2].emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Waiting for your opponent to make a move..." });
				    	}
				    	else{
							results[2].emit("message",{ me:false, players: false, color: "#bdc3c7", message : "It's your turn!" });
			    			socket.emit("message",{ me:false, players: false, color: "#bdc3c7", message : "Waiting for your opponent to make a move..." });
				    	}
				    	// notify current socket player
				    	socket.emit("notify",{connected:1, turn : results[0]});
				    	//clear previous gameboard for all players
	    				socket.emit("clearboard");results[2].emit("clearboard");
	    				//place new germs on the new board
	    				var player1Color;
						var player2Color;
						var playerId;
						games[results[1]].player1.get("color", function(err, data){
							player1Color = data;
						}); 
						games[results[1]].player2.get("color", function(err, data){
							player2Color = data;
						}); 
						socket.get("pid", function(err, data){
							playerId = data;
						}); 

						//manually placing init germs
	    				socket.emit("place", {row:2, column:2, infectedGrids:[], color:player1Color});
						socket.emit("place", {row:length - 3, column:length - 3, infectedGrid:[], color:player1Color});
						socket.emit("place", {row:length - 3, column:2, infectedGrids:[], color:player2Color});
						socket.emit("place", {row:2, column:length - 3, infectedGrids:[], color:player2Color});
						results[2].emit("place", {row:2, column:2, infectedGrids:[], color:player1Color});
						results[2].emit("place", {row:length - 3, column:length - 3, infectedGrid:[], color:player1Color});
						results[2].emit("place", {row:length - 3, column:2, infectedGrids:[], color:player2Color});
						results[2].emit("place", {row:2, column:length - 3, infectedGrids:[], color:player2Color});
						//end 

	    				// notify opponent
	    				results[2].get("turn",function(err, turn){
				    		results[2].emit("notify",{connected:1, turn : turn});
				    	});
				    }
		    	});
		    }
	    });
	});

	socket.on("disconnect",function(){
		socket.get("room",function(err,room){
	    	if(room in games){
				console.log("Disconnecting...");
				io.sockets.in(room).emit('leave');
				if(room in games){
					delete games.room;
				}
			}
		});
	});


	socket.on("send",function(data){
		async.parallel([
			socket.get.bind(this, "room"),
			socket.get.bind(this, "color"),
			socket.get.bind(this, "opponent")
	    ], function(err, results) {
			if(results[0] in games){
				if(results[2]){
					results[2].emit("message",{ me:false, players: true, color: results[1], message : data.message });
				}
				socket.emit("message",{ me:true, players: true, color: results[1], message : data.message });
			}
		});
	});

});



	



