/**************************************************
** GAME BOMB CLASS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

var Item = function(id, grid, x, y, type) {
    this.id = id;
    this.grid = grid;
    this.x = x;
  	this.y = y;
    this.type = type;

    this.draw = function(ctx) {
        var t = Math.floor(countFps/30);

        if(this.type == 1){
            ctx.drawImage(sceneryImages['item_bomb_'+(t+1)], this.x, this.y, this.grid.width, this.grid.height);
        }else if(this.type == 2){
            ctx.drawImage(sceneryImages['item_sun_'+(t+1)], this.x, this.y, this.grid.width, this.grid.height);
        }
	};
};

exports.Item = Item;
