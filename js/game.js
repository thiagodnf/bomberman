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
	items,
	localPlayer,	// Local player
	countFps = 0,
	playerImages = [],
	sceneryImages = [],
	socket;

function appendNewPlayer(player){
	var img = playerImages[player.image];

	var id = null;

	if(player.id == null){
		id = socket.io.engine.id;
	}else{
		id = player.id;
	}

	$("#panel-players-online").append('<li id="'+id+'" class="list-group-item"> <span class="badge" title="'+player.deadPlayers+'">'+player.deadPlayers+'</span> <img src="'+img.src+'"/> '+player.name+'</li>');

	updateRanking();
}

function updateRanking(){
	tinysort.defaults.order = 'desc';
	tinysort('ul#panel-players-online>li',{selector:'span'});
}

function update(){
	if(localPlayer == null){
		return;
	}

	// Remove exploded bombs after 500ms
	for(var i = 0; i < bombs.length; i++){
		if(bombs[i].explode != null){
			if(new Date().getTime() - bombs[i].explode > 500){
				bombs.splice(bombs.indexOf(bombs[i]), 1);
			}
		}
	}

	if(localPlayer.update(keys)){
		socket.emit("move player", {x: localPlayer.x, y: localPlayer.y});
	}

	var gotItem = localPlayer.getAnItem(items);

	if(gotItem){
		socket.emit("remove item", {id: gotItem.id});
	}

	var bomb = localPlayer.newBomb(keys);

	if(bomb){
		// Broadcast to another players
		socket.emit("new bomb", {x:bomb.x, y:bomb.y, playerId: bomb.playerId, size: bomb.size});
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

	// Draw the items
	for (var i = 0; i < items.length; i++) {
		items[i].draw(ctx);
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

	console.log(window.location.host);

	if(window.location.host == 'thiagodnf.github.io'){
		socket = io.connect("thiagodnf-bomberman-server.herokuapp.com");
	}else{
		socket = io.connect("localhost:3000");
	}

	var startPos = new Utils().getStartPosition();

	localPlayer = new Player(null, grid, startPos.i*grid.width, startPos.j*grid.height, null, null);

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

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Item removed message received
	socket.on("remove item", onRemoveItem);

	// Player removed message received
	socket.on("killed player", onKilledPlayer);

	// Explode bombs
	socket.on("explode bomb", onExplodeBomb);

	// Explode bombs
	socket.on("update dead players", onUpdateDeadPlayers);

	// New Item
	socket.on("new item", onNewItem);
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	appendNewPlayer(localPlayer);
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
	remotePlayers = [];
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: " + data.id);

	// Initialise the new player
	var newPlayer = new Player(data.id, grid, data.x, data.y, data.image, data.name);
	newPlayer.deadPlayers = data.deadPlayers;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);

	appendNewPlayer(newPlayer);

	console.log("Remote Players Connected: " + remotePlayers.length);
};

function onUpdateDeadPlayers(data){
	console.log("Updating dead players: " + data.id);

	var updatePlayer = new Utils().getObjectById(remotePlayers, data.id);

	// Player not found
	if (!updatePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	updatePlayer.deadPlayers = data.deadPlayers;

	$("#"+updatePlayer.id+" > span").html(updatePlayer.deadPlayers);
	$("#"+updatePlayer.id+" > span").attr('title', updatePlayer.deadPlayers);

	updateRanking();
}

// New player
function onNewBomb(data) {
	console.log("Receiving a bomb " + data.id);

	// Initialise the new player
 	var newBomb = new Bomb(data.id, grid, data.x, data.y, data.playerId, data.size);
	newBomb.insertIn = data.insertIn;

	// Add new bomb
	bombs.push(newBomb);
};

// New Item
function onNewItem(data) {
	console.log("Receiving a new item " + data.type);

	// Initialise the new player
 	var newItem = new Item(data.id, grid, data.x, data.y, data.type);

	// Add new bomb
	items.push(newItem);
};

function onExplodeBomb(data) {
	console.log("Exploding the bomb " + data.id);

	var bomb = new Utils().getObjectById(bombs, data.id);

	if(bomb.playerId == socket.io.engine.id){
		localPlayer.countBomb--;
	}

	bomb.explode = data.explode;

	var explodedItems = bomb.explodedItems(items);

	for(var i= 0 ; i < explodedItems.length; i++){
		socket.emit("remove item", {id: explodedItems[i].id});
	}

	if(localPlayer.kill(bomb)){
		// Notify other player
		socket.emit("killed player", {bombId: bomb.id, ownerBombId: bomb.playerId, killedPlayerId: socket.io.engine.id});

		// Desconnect the player
		socket.disconnect();

		// Remove the player of the screen
		localPlayer.killed = true;

		// Show the Game Over modal
		$("#game-over").modal("show");
	}
}

// Move player
function onMovePlayer(data) {
	var movePlayer = new Utils().getObjectById(remotePlayers, data.id);

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

	var removePlayer = new Utils().getObjectById(remotePlayers, data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	$("#"+removePlayer.id).remove();

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);

	updateRanking();

	console.log("Remote Players Connected: " + remotePlayers.length);
};

// Remove player
function onRemoveItem(data) {
	console.log("Removing item: " + data.id);

	var removedItem = new Utils().getObjectById(items, data.id);

	if (!removedItem) {
		util.log("Item not found: " + data.id);
		return;
	};

	// Remove item from array
	items.splice(items.indexOf(removedItem), 1);
};

// Remove player
function onKilledPlayer(data) {
	console.log("Player " + data.killedPlayerId + " killed");

	var killedPlayer = new Utils().getObjectById(remotePlayers, data.killedPlayerId);

	if(data.ownerBombId == socket.io.engine.id){
		localPlayer.deadPlayers++;

		$("#"+data.ownerBombId+" > span").html(localPlayer.deadPlayers);
		$("#"+data.ownerBombId+" > span").attr('title', localPlayer.deadPlayers);

		socket.emit("update dead players", {id: socket.io.engine.id, deadPlayers:localPlayer.deadPlayers});
	}

	$("#"+data.killedPlayerId).remove();

	updateRanking();

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(killedPlayer), 1);
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

	$('#choose-a-player').on('shown.bs.modal', function () {
	    $('#input-player-name').focus();
	});

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

	items = [];

	resizeCanvas();

	// Load user's preferences
	var name = localStorage.getItem("name");
	var image = localStorage.getItem("image");

	if(name != null) $("#input-player-name").val(name);
	if(image != null) $('#select-image-type').selectpicker('val', image);

	if ( ! Date.now) {
		Date.now = function() { return new Date().getTime(); }
	}

	$("#btn-restart").click(function(){
		location.reload();
	});

	$.validate({
		form : '#form-new-player',
		onSuccess : function($form) {

			$("#choose-a-player").modal("hide");

			var name = $("#input-player-name").val();
			var image = $("#select-image-type").val();

			//Save the user's option on the localstorage
			localStorage.setItem("name", name);
			localStorage.setItem("image", image);

			init();

			localPlayer.name = name;
			localPlayer.image = image;

			// Send local player data to the game server
			socket.emit("new player", {image: localPlayer.image, name: localPlayer.name, x: localPlayer.x, y: localPlayer.y});

			// Will stop the submission of the form
			return false;
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

	sceneryImages['bomb_0'] = 'img/bomb_0.png';
	sceneryImages['bomb_1'] = 'img/bomb_1.png';
	sceneryImages['bomb_2'] = 'img/bomb_2.png';
	sceneryImages['bomb_3'] = 'img/bomb_3.png';
	sceneryImages['explode'] = 'img/explode.png';
	sceneryImages['wall'] = 'img/wall.png';
	sceneryImages['item_bomb_1'] = 'img/item_bomb_1.png';
	sceneryImages['item_bomb_2'] = 'img/item_bomb_2.png';
	sceneryImages['item_sun_1'] = 'img/item_sun_1.png';
	sceneryImages['item_sun_2'] = 'img/item_sun_2.png';

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
