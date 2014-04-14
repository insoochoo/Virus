/*
//////////////////////////////////////////////////////////////////
// ======================  SOCKETIO ========================== //
////////////////////////////////////////////////////////////////
*/
$(document).ready(function(){
	var socket = io.connect(window.location.hostname);

	socket.on("connect",function(){
		socket.emit("test");
		if(room){
			socket.emit("join",{room:room});
		}

	});

	socket.on("notify",function(data){
		if(data.success == 1){
			alertify.success(data.message);
		}
		else if(data.success == 0){
			alertify.log(data.message);
		}
		else{ //data.success == -1
			alertify.error(data.message);
		}
	});

	socket.on("countdown",function(data){
		if(data.count){
			count=data.count;
			var stopinterval=setInterval(function(){
				if(count == 1){
					clearInterval(stopinterval);
				}
				$("p").html(count);
				count--;
			},1000);
		}
	});
});