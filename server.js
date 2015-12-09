var util = require("util"),
    io = require("socket.io"),
    os = require('os');
	Player = require("./js/core/player.js").Player;
    ArrayUtils = require("./js/core/arrayutils.js").ArrayUtils;
    Bomb = require("./js/core/bomb.js").Bomb;
    Grid = require("./js/core/grid.js").Grid;

var socket,
    players,
    countId = 1,
    bombs;

function init() {
    players = [];
    bombs = [];

    util.log("Running at " + getLocalIp());

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	// Start listening for events
	setEventHandlers();

    setTimeout(explodeBombs(), 10);

    util.log("Waiting the players");
};

// Return the IP server
var getLocalIp = function(){
    var interfaces = os.networkInterfaces();

    var addresses = [];

    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    return addresses;
}

var setEventHandlers = function() {
	socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("killed player", onKilledPlayer);
    client.on("move player", onMovePlayer);
    client.on("new bomb", onNewBomb);
};

function contains(array, element){
  for(var i = 0; i < array.length; i++){
    if(array[i].i == element.i && array[i].j == element.j){
      return true;
    }
  }

  return false;
}

function onKilledPlayer(){
    util.log("Player killed: " + this.id);

    var removePlayer = new ArrayUtils().getObjectById(players, this.id);

    // Player not found
	if (!removePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

    // Broadcast removed player to connected socket clients
	socket.emit("killed player", {id: removePlayer.id, x: removePlayer.x, y: removePlayer.y});

    // Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);
}

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var removePlayer = new ArrayUtils().getObjectById(players, this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

    // Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});

     util.log("Clients Connected: " + players.length);
};

function onNewBomb(data) {
    util.log("New bomb defined " + this.id);

    var newBomb = new Bomb(countId++, new Grid(), data.x, data.y, this.id);

    util.log("Send existing bombs to other players");

    // Broadcast new player to connected socket clients
    //this.broadcast.emit("new bomb", {id: newBomb.id, x: newBomb.x, y: newBomb.y});
    socket.emit("new bomb", {id: newBomb.id, x: newBomb.x, y: newBomb.y, insertIn: newBomb.insertIn, playerId: newBomb.playerId});

    // Add new bomb to the bombs array
    bombs.push(newBomb);
}

function explodeBombs(){

    var bombsToremove = [];

    for(var i = 0; i < bombs.length; i++){
        if(new Date().getTime() - bombs[i].insertIn >  1800){
            util.log("Exploding the bomb " + bombs[i].id)
            // Selects to remove
            bombsToremove.push(bombs[i]);
        }
    }

    // Try to adds another bombs
    for(var attempt = 0; attempt < 5; attempt++){
        var newBombs = [];

        for(var i = 0; i < bombsToremove.length; i++){
            for(var j = 0; j < bombs.length; j++){
                if(bombsToremove.indexOf(bombs[j]) == -1){
                    if(bombsToremove[i].killThisBomb(bombs[j])){
                        newBombs.push(bombs[j]);
                    }
                }
            }
        }

        if(newBombs.length == 0){
            break;
        }

        for(var i = 0; i < newBombs.length; i++){
            bombsToremove.push(newBombs[i]);
        }
    }

    // Remove the bombs
    for(var i = 0; i < bombsToremove.length; i++){
        // Notify all players
        socket.emit('explode bomb', {id: bombsToremove[i].id, explode: new Date().getTime()});

        bombs.splice(bombs.indexOf(bombsToremove[i]), 1);
    }

    setTimeout(function(){ explodeBombs()}, 10);
}

function onNewPlayer(data) {

	// Create a new player
	var newPlayer = new Player(this.id, new Grid(), null, null, data.image);
	newPlayer.name = data.name;
    	newPlayer.init();

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, image: newPlayer.image, name: newPlayer.name });

	this.emit("update id", {id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, image: newPlayer.image, name: newPlayer.name});

	util.log("Send existing players to the new player");

	for (var i = 0; i < players.length; i++) {
		this.emit("new player", {id: players[i].id, x: players[i].x, y: players[i].y, image: players[i].image, name: players[i].name});
	};

	// Add new player to the players array
	players.push(newPlayer);

	util.log("Clients Connected: " + players.length);
};

// Player has moved
function onMovePlayer(data) {
	util.log("Moving player: " + this.id);

    // Find player in array
	var movePlayer = new ArrayUtils().getObjectById(players, this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

	// Update player position
	movePlayer.x = data.x;
	movePlayer.y = data.y;

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y});
};

/**************************************************
** RUN THE GAME
**************************************************/
init();
