/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	grid,			// Grid
	remotePlayers,
	bombs,
	localPlayer,	// Local player
	image,
	socket;

var countFps = 0;

var playerImages = [];
var sceneryImages = [];

var playerOneImage = new Image();
var playerTwoImage = new Image();
var playerThreeImage = new Image();
var playerFourImage = new Image();
var bombImage = new Image();
var explodeImage = new Image();
var wallImage = new Image();

function update(){
	if(localPlayer == null){
		return;
	}

	for(var i = 0; i < bombs.length; i++){

		if(bombs[i].explode != null){

			if(localPlayer.kill(bombs[i])){
				socket.emit("killed player", {id: localPlayer.id});
			}
			if(new Date().getTime() - bombs[i].explode > 500){
				bombs.splice(bombs.indexOf(bombs[i]), 1);
			}
		}
	}

	if(localPlayer.update(keys)){
		socket.emit("move player", {x: localPlayer.x, y: localPlayer.y});
	}

	var bomb = localPlayer.newBomb(keys);

	if(bomb){
		// Broadcast to another players
		socket.emit("new bomb", {x:bomb.x, y:bomb.y, playerId: bomb.playerId});
	}
}

function draw(){
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	grid.draw(ctx);

	// Draw the bombs
	for (var i = 0; i < bombs.length; i++) {
		bombs[i].draw(ctx);
	};

	// Draw the local and others players
	if(localPlayer != null) localPlayer.draw(ctx);

	// Draw the remote players
	for (var i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
	
	countFps++;

	if(countFps == 60){
		countFps = 0;
	}
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};

function init() {
	// Initialise keyboard controls
	keys = new Keys();

	socket = io.connect("http://localhost:8000");

	// Start listening for events
	setEventHandlers();
};

function setEventHandlers(){
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	resizeCanvas();

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// New bomb received
	socket.on("new bomb", onNewBomb);

	// New bomb received
	socket.on("update id", onUpdateId);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Player removed message received
	socket.on("killed player", onKilledPlayer);

	// Explode bombs
	socket.on("explode bomb", onExplodeBomb);
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
	remotePlayers = [];
	$("#panel-players-online").html();
};

// New player
function onUpdateId(data) {
	console.log("Updating the id " + data.id);

	localPlayer = new Player(data.id, grid, data.x, data.y, data.image);

	//$("#panel-players-online").append('<li class="list-group-item"><img src="img/agent_'+data.image+'.png" width="40px">'+data.name+'</li>');
}
// New player
function onNewPlayer(data) {

	var exitingPlayer = new ArrayUtils().getObjectById(remotePlayers, data.id);

	// Player found
	if (exitingPlayer) {
		return;
	};

	console.log("New player connected: " + data.id);

	// Initialise the new player
	var newPlayer = new Player(data.id, grid, data.x, data.y, data.image);

	$(".btn-player").prop("disabled", false);

	$("#btn-player-"+data.image).prop("disabled", true);

	$("#panel-players-online").append('<li class="list-group-item"><img src="img/agent_'+data.image+'.png" width="40px">'+data.name+'</li>');

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);

	console.log("Remote Players Connected: " + remotePlayers.length);
};

// New player
function onNewBomb(data) {
	console.log("Receiving a bomb " + data.id);

	// Initialise the new player
 	var newBomb = new Bomb(data.id, grid, data.x, data.y, data.playerId);
	newBomb.insertIn = data.insertIn;

	// Add new bomb
	bombs.push(newBomb);
};

function onExplodeBomb(data) {
	console.log("Exploding the bomb " + data.id);

	var bomb = new ArrayUtils().getObjectById(bombs, data.id);

	if(bomb.playerId == localPlayer.id){
		localPlayer.countBomb--;
	}

	bomb.explode = data.explode;
}

// Move player
function onMovePlayer(data) {
	var movePlayer = new ArrayUtils().getObjectById(remotePlayers, data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.x = data.x;
	movePlayer.y = data.y;
};

// Remove player
function onRemovePlayer(data) {
	console.log("Removing player: " + data.id);

	var removePlayer = new ArrayUtils().getObjectById(remotePlayers, data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

// Remove player
function onKilledPlayer(data) {
	console.log("Killing player: " + data.id);

	var killedPlayer = new ArrayUtils().getObjectById(remotePlayers, data.id);

	if ( ! killedPlayer) {
		// if(localPlayer.x == data.x && localPlayer.y == data.y){
		if(localPlayer.id == data.id){
			localPlayer.killed = true;
			$("#game-over").modal("show");
		}else{
			// Player not found
			console.log("Player not found: "+data.id);
		}
	}else {
		// Remove player from array
		remotePlayers.splice(remotePlayers.indexOf(killedPlayer), 1);
	}
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function resizeCanvas(){
	canvas.width = grid.width * grid.maxI;
	canvas.height = grid.height * grid.maxJ;
}

$(function(){

	if(typeof(Storage) === "undefined") {
	    console.log("Sorry! No Web Storage support");
	}

	$('#select-image-type').selectpicker();
	
	// Declare the canvas and rendering context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	// Initialise grid
	grid = new Grid();

	// Initialise remote players array
	remotePlayers = [];

	// Initialise bombs
	bombs = [];

	resizeCanvas();

	// Load user's preferences

	var name = localStorage.getItem("name");
	var image = localStorage.getItem("image");

	if(name != null) $("#input-player-name").val(name);
	if(image != null) $('#select-image-type').selectpicker('val', image);

	if ( ! Date.now) {
		Date.now = function() { return new Date().getTime(); }
	}

	$.validate({
		form : '#form-new-player',
		onSuccess : function($form) {
			$("#choose-a-player").modal("hide");

			
			
			var name = $("#input-player-name").val();
			var image = $("#select-image-type").val();

			//Save the user's option on the localstorage

			localStorage.setItem("name", name);
			localStorage.setItem("image", image);
			
			// Send local player data to the game server
			socket.emit("new player", {image: image, name:name});

			return false; // Will stop the submission of the form
		},		
	});

	playerImages['1'] = 'img/agent_1.png';
	playerImages['2'] = 'img/agent_2.png';
	playerImages['3'] = 'img/agent_3.png';
	playerImages['4'] = 'img/agent_4.png';
	playerImages['5'] = 'img/bomber_1.png';
	playerImages['6'] = 'img/bomber_2.png';
	playerImages['7'] = 'img/bomber_3.png';
	playerImages['8'] = 'img/bomber_4.png';
	playerImages['9'] = 'img/bomber_5.png';
	playerImages['10'] = 'img/bomber_0.png';

	//é scenary
	sceneryImages['bomb_0'] = 'img/bomb_0.png';
	sceneryImages['bomb_1'] = 'img/bomb_1.png';
	sceneryImages['bomb_2'] = 'img/bomb_2.png';
	sceneryImages['bomb_3'] = 'img/bomb_3.png';
	sceneryImages['explode'] = 'img/explode.png';
	sceneryImages['wall'] = 'img/wall.png';
	sceneryImages['explosion'] = 'img/explosion_0.png';

	var allImages = [];

	for(key in playerImages){
		allImages.push(playerImages[key]);
	} 

	for(key in sceneryImages){
		allImages.push(sceneryImages[key]);
	} 

	resources.load(allImages);

	resources.onReady(function(){
		for(key in playerImages){
			playerImages[key] = resources.get(playerImages[key]);
		}

		for(key in sceneryImages){
			sceneryImages[key] = resources.get(sceneryImages[key]);
		}

		init();
		animate();

		$("#choose-a-player").modal({
			backdrop: 'static',
			keyboard: true,
			close: function(event, ui){ 
				$(this).dialog('close');
			} 
		});
	});
});
