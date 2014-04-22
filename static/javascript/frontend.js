$(document).ready(function() {
    var content="";
    for(var i = 2; i < 10; i++){
        content+="<tr>";
        for(var j = 2; j < 10; j++) {
          content+="<td class='box' data-row="+i+" data-column="+j+"><i class='fa fa-circle'>";
        }
    }
    $("#board table").append(content);

	var clip = new ZeroClipboard( 
		document.getElementById('copy-clipboard'), {
		moviePath: "static/flash/ZeroClipboard.swf"
	});


	clip.on( 'complete', function(client, args){
		alertify.log("Your room URL has been copied. Send it to your friend!");
	});

	$("#help-icon").tooltip({
	'selector': '',
	'placement': 'top',
	'container':'body'
	});
	$("#send_message").tooltip({
	'selector': '',
	'placement': 'left',
	'container':'body'
	});
});

var socket = io.connect(window.location.hostname);


/*
//////////////////////////////////////////////////////////////////
// ==========================  GAME ========================== //
////////////////////////////////////////////////////////////////
*/

var room = $("input").data("room");

socket.on("connect",function(){
	if(room){
		socket.emit("join",{room:room});
	}
});

socket.on("kick",function(data){
	window.location = "/error_full";
});

socket.on("online",function(){
	$('.p2-status i').css("color","#2ecc71");
	$('.p2-status span').html(" Connected");
});

socket.on("notify",function(data){
	if(data.connected == 1){
		if(data.turn){
			alertify.success("Both players connected. Your turn!");
		}
		else{
			alertify.success("Both players connected. Opponent's turn!");
		}
	}
	else{
		alertify.log("Waiting on your opponent's response.");
	}
});

$(document).ready(function() {
	$("#leave").click(function(){
		socket.emit("leave");
		window.location = '/exit';
	});
	$("#rematch").click(function(){
		socket.emit("reset");
		$('.gameSetting').css("display","none");
	});
	$(".box").click(function(){
		socket.emit("click", { row : $(this).data("row"), column : $(this).data("column") });
	});
	var count=0;
	$(".box").mouseenter(function(){
		socket.emit("hover", {hover:1, row : $(this).data("row"), column : $(this).data("column") })
	});
	$(".box").mouseleave(function(){
		socket.emit("hover", {hover:0, row : $(this).data("row"), column : $(this).data("column") })
	});

});

socket.on("updateScore", function(data){
	$(".p1-score span").html(data.p1);
	$(".p2-score span").html(data.p2);
})

socket.on("clearboard", function(){
	for(var i = 2; i < 10; i++){
		for(var l=2; l < 10; l++){
			$(".box[data-row='"+i+"'][data-column='"+l+"']").css("background-color","");
		}
	}
})

function clearAvailable(){
	for(var i = 2; i < 10; i++){
		for(var l = 2; l < 10; l++){
			if($(".box[data-row='"+i+"'][data-column='"+l+"']").css("background-color")=="rgb(225, 225, 225)"){
				$(".box[data-row='"+i+"'][data-column='"+l+"']").animate({
		  			backgroundColor: ""
		  		},100);
			}
		}
	}
}

socket.on("clearAvailable", function(data){
	clearAvailable();
})

socket.on("available", function(data){
	for (var i = 0; i < data.available.length; i++){
		$(".box[data-row='"+data.available[i].x+"'][data-column='"+data.available[i].y+"']").animate({
  			backgroundColor: "rgb(225,225,225)",
      		opacity:1
  		}, 300);
	}
})

socket.on("place",function(data){
	var germ = $(".box[data-row='"+data.row+"'][data-column='"+data.column+"']");
	//germ.css("background-color",data.color);

	germ.animate({
      backgroundColor: data.color,
      opacity:1
  	});

  	for (var i = 0; i < data.infectedGrids.length; i++){
  		$(".box[data-row='"+data.infectedGrids[i].x+"'][data-column='"+data.infectedGrids[i].y+"']").animate({
  			backgroundColor: data.color,
      		opacity:1
  		}, 300);
  	}
});

socket.on("preview",function(data){
	var box_object = $(".box[data-row='"+data.row+"'][data-column='"+data.column+"']");
	if(box_object.css("opacity") != 1
		|| box_object.css("background-color") == "rgb(255, 255, 255)"){
		if(data.hover == 1){
			box_object.css("background-color",data.color);
			box_object.css("opacity",0.2);
		}
		else{
			box_object.css("background-color","");
			box_object.css("opacity",1);
		}
	}
});

socket.on("gameover",function(data){
	socket.emit("reset_ready");
	$('.gameSetting').css("display","block");
});

socket.on("leave",function(){
	window.location = '/error_opponent';
});

socket.on("errorMessage",function(data){
	alertify.error(data.message);
});

/*
//////////////////////////////////////////////////////////////////
// ========================  MESSAGES ======================== //
////////////////////////////////////////////////////////////////
*/

function sendMessage(){
		socket.emit("send", { message : $('.field').val() });
		$('.field').val("");
}

$(document).ready(function(){
	$('.send').click(function(){
		sendMessage();
	});
	$(".field").keypress(function(e) {
        if(e.which == 13) {
            sendMessage();
        }
    });
    /*$(document).bind('keydown',function(e){
    	$('.field').focus();
    	$(document).unbind('keydown');
	});*/
});

var messages = [
		/*{
			players:false,
			color: HEX,
			message: TEXT
		}*/
];


socket.on('message',function(data){
	if(data.message){
		messages.push(
			{
				me:data.me,
				players:data.players,
				color: data.color,
				message: data.message
			});

		var content="";
		for(var i = 0; i < messages.length; i ++){
			if(messages[i].players){
				var display="";
				if(messages[i].me){
					display="Me";
				}
				else{
					display="Opponent";
				}
				content+= "<span style='letter-spacing: 0.7px;'><span style='color:"+messages[i].color+"'>"+display+"</span> : "+messages[i].message+"</span><br/>";
				
			}
			else{

				content+= "<span style='letter-spacing: 0.7px; color:"+messages[i].color+"'>"+messages[i].message+"</span><br/>";
			}
		}
		$('#content').html(content);
		$("#content").scrollTop($("#content")[0].scrollHeight);
		$('.field').focus();
	}
});












