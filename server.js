var util = require("util"),
    io = require("socket.io"),
    os = require('os');
	Player = require("./js/core/player.js").Player;
    Utils = require("./js/core/utils.js").Utils;
    Bomb = require("./js/core/bomb.js").Bomb;
    Grid = require("./js/core/grid.js").Grid;
    Item = require("./js/core/item.js").Item;

var socket,
    players,
    countId = 1,
    items,
    bombs;

function init() {
    players = [];
    bombs = [];
    items = [];

    // Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	// Start listening for events
	setEventHandlers();

    setTimeout(explodeBombs(), 10);

    util.log("Running at " + getLocalIp());

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
    client.on("remove item", onRemoveItem);
    client.on("update dead players", onUpdateDeadPlayers);
};

function onUpdateDeadPlayers(data){
    util.log("Update Dead Players : " + this.id);

    // Find player in array
	var updatePlayer = new Utils().getObjectById(players, this.id);

	// Player not found
	if (!updatePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

	// Update player position
	updatePlayer.deadPlayers = data.deadPlayers;

	// Broadcast updated position to connected socket clients
	socket.emit("update dead players", {id: updatePlayer.id, deadPlayers: updatePlayer.deadPlayers});
}

function onKilledPlayer(data){
    util.log("Player killed: " + this.id);

    var removePlayer = new Utils().getObjectById(players, this.id);

    // Player not found
	if (!removePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

    // Broadcast removed player to connected socket clients
    socket.emit("killed player", {bombId: data.bombId, ownerBombId: data.ownerBombId, killedPlayerId: data.killedPlayerId});

    // Remove player from players array
	//players.splice(players.indexOf(removePlayer), 1);
}

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var removePlayer = new Utils().getObjectById(players, this.id);

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

function onRemoveItem(data) {
	util.log("An item was removed: " + data.id);

	var removedItem = new Utils().getObjectById(items, data.id);

	if (!removedItem) {
		util.log("Item not found: " + data.id);
		return;
	};

    // Remove the item from items array
	items.splice(items.indexOf(removedItem), 1);

	// Broadcast removed item to connected socket clients
	socket.emit("remove item", {id: data.id});
};

function onNewBomb(data) {
    util.log("New bomb defined by " + this.id);

    var newBomb = new Bomb(countId++, new Grid(), data.x, data.y, this.id, data.size);

    util.log("Send existing bombs to other players");

    // Broadcast new player to connected socket clients
    socket.emit("new bomb", {id: newBomb.id, x: newBomb.x, y: newBomb.y, insertIn: newBomb.insertIn, playerId: newBomb.playerId, size:newBomb.size});

    // Add new bomb to the bombs array
    bombs.push(newBomb);
}

function explodeBombs(){

    var bombsToremove = [];

    for(var i = 0; i < bombs.length; i++){
        if(new Date().getTime() - bombs[i].insertIn >  1800){
            bombsToremove.push(bombs[i]);
        }
    }

    // Try to adds another bombs
    for(var attempt = 0; bombsToremove.length != 0 && attempt < 10; attempt++){

        var newBombs = [];

        for(var i = 0; i < bombsToremove.length; i++){
            for(var j = 0; j < bombs.length; j++){
                if(bombsToremove.indexOf(bombs[j]) == -1){
                    if(bombsToremove[i].explodeThisBomb(bombs[j])){
                        newBombs.push(bombs[j]);
                    }
                }
            }
        }

        if(newBombs.length == 0 || bombsToremove.length == bombs.length){
            break;
        }

        for(var i = 0; i < newBombs.length; i++){
            bombsToremove.push(newBombs[i]);
        }
    }

    if(bombs.length != 0 && bombsToremove.length == bombs.length){
        util.log("All bombs will be exploded");
    }

    // Remove the bombs
    for(var i = 0; i < bombsToremove.length; i++){
        util.log("Exploding the bomb " + bombsToremove[i].id)
        // Notify all players
        socket.emit('explode bomb', {id: bombsToremove[i].id, explode: new Date().getTime()});

        bombs.splice(bombs.indexOf(bombsToremove[i]), 1);
    }

    if(Math.random() <= 0.0025){
        releaseAnItem();
    }

    setTimeout(function(){ explodeBombs()}, 10);
}

function releaseAnItem(){
    // Only 10 items can be available on grid
    if(items.length == 10){
        util.log("The items set is full");
        return;
    }

    var startPos = new Utils().getStartPosition();
    var id = new Utils().generateUUID();
    var grid = new Grid();
    var x = startPos.i*grid.width;
    var y = startPos.j*grid.height;

    var type = 1;

    if(Math.random() <= 0.50){
        type = 2;
    }

    var item = new Item(id, grid, x, y, type);

    socket.emit('new item', {id: item.id, x: item.x, y: item.y, type: item.type});

    items.push(item);
}

function onNewPlayer(data) {
    // Create a new player
	var newPlayer = new Player(this.id, new Grid(), data.x, data.y, data.image, data.name);

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, image: newPlayer.image, name: newPlayer.name, deadPlayers: newPlayer.deadPlayers});

	util.log("Send existing players to the new player");

	for (var i = 0; i < players.length; i++) {
		this.emit("new player", {id: players[i].id, x: players[i].x, y: players[i].y, image: players[i].image, name: players[i].name, deadPlayers: players[i].deadPlayers});
	};

    util.log("Send existing items to the new player");

    for(var i = 0; i < items.length; i++){
        this.emit('new item', {id: items[i].id, x: items[i].x, y: items[i].y, type: items[i].type});
    }

	// Add new player to the players array
	players.push(newPlayer);

	util.log("Clients Connected: " + players.length);
};

// Player has moved
function onMovePlayer(data) {
	util.log("Moving player: " + this.id);

    // Find player in array
	var movePlayer = new Utils().getObjectById(players, this.id);

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
