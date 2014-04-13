/*
//////////////////////////////////////////////////////////////////
// ======================  SOCKETIO ========================== //
////////////////////////////////////////////////////////////////
*/
$(document).ready(function(){
	var socket = io.connect(window.location.hostname);

	socket.on("connect",function(){
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
});