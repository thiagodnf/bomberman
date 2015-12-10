/**************************************************
** GAME PLAYER CLASS
**************************************************/
var PlayerServer = function(id, startX, startY) {
	this.x = startX;
	this.y = startY;
	this.id = id;
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.PlayerServer = PlayerServer;
