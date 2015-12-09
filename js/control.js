var supportTouch = $.support.touch,
            scrollEvent = "touchmove scroll",
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                            time: (new Date).getTime(),
                            coords: [ data.pageX, data.pageY ],
                            origin: $(event.target)
                        },
                        stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        event.preventDefault();
                    }
                }
                $this
                        .bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                        if (stop.time - start.time < 1000 &&
                                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                            start.origin
                                    .trigger("swipeupdown")
                                    .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
$.each({
    swipedown: "swipeupdown",
    swipeup: "swipeupdown"
}, function(event, sourceEvent){
    $.event.special[event] = {
        setup: function(){
            $(this).bind(sourceEvent, $.noop);
        }
    };
});

var uuid = generateUUID();

$(function(){

	var socket = new WebSocket("ws://192.168.25.7:8001");

	$(".btn-bomb").height($(document).height()-100);
	$(".btn-bomb").width($(document).width());

	$("#bomb").on('tap', function(e){
		sendMessage(socket, {id:uuid, command: commands.BOMB});
		//window.navigator.vibrate(200); // vibrate for 200ms
	});

	$("#bomb").on('swiperight', function(e){
  	sendMessage(socket, {id:uuid, command: commands.MOVE_TO_RIGHT});
	});

	$("#bomb").on('swipeup', function(e){
  	sendMessage(socket, {id:uuid, command: commands.MOVE_TO_UP});
	});

	$("#bomb").on('swipedown', function(e){
  	sendMessage(socket, {id:uuid, command: commands.MOVE_TO_DOWN});
	});

	$("#bomb").on('swipeleft', function(e){
  	sendMessage(socket, {id:uuid, command: commands.MOVE_TO_LEFT});
	});

	socket.onopen = function(){
		console.log("Socket has been opened!");
		sendMessage(socket, {id:uuid, command: commands.NEW_USER, i:1, j:1});
	};

	socket.onmessage = function(msg){
		console.log("Received: " + msg);
	};

	socket.onclose = function(){
		console.log("Connection closed");
	};
});
