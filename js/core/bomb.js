/**************************************************
** GAME BOMB CLASS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

var Bomb = function(id, grid, x, y, playerId, size) {
    this.id = id;
    this.grid = grid;
    this.insertIn = new Date().getTime(),
	this.x = x;
  	this.y = y;
    this.size = size;
    this.explode = null;
    this.playerId = playerId;

    this.getRange = function(){
        var range = [];

        for(var i = 1; i <= this.size; i++){
            if( ! this.grid.hasWallByPosition(this.x, this.y - this.grid.height)){
                range.push({x:this.x, y:this.y - this.grid.height * i, r:i});
            }
            if( ! this.grid.hasWallByPosition(this.x, this.y + this.grid.height)){
                range.push({x:this.x, y:this.y + this.grid.height * i, r:i});
            }
            if( ! this.grid.hasWallByPosition(this.x - this.grid.width, this.y)){
                range.push({x:this.x - this.grid.width * i, y:this.y, r:i});
            }
            if( ! this.grid.hasWallByPosition(this.x + this.grid.width, this.y)){
                range.push({x:this.x + this.grid.width * i, y:this.y, r:i});
            }
        }

        return range;
    };

    this.explodedItems = function(items){
        var explodedItems = [];

        var range = this.getRange();

        for(var j = 0; j < items.length; j++){
            for(var i = 0; i < range.length; i++){
                if(range[i].x == items[j].x && range[i].y == items[j].y){
                    explodedItems.push(items[j]);
                    break;
                }
            }
        }

        return explodedItems;
    }

    this.explodeThisBomb = function(bomb){
        var range = this.getRange();

        for(var i = 0; i < range.length; i++){
            if(range[i].x == bomb.x && range[i].y == bomb.y){
                return true;
            }
        }

        return false
    }

	this.draw = function(ctx) {
        if(this.explode){

            var range = this.getRange();

            for(var i = 0; i < range.length; i++){
                var x = range[i].x,
                    y = range[i].y,
                    r = range[i].r;

                if(x > this.x || x < this.x) {
                    if(x > this.x && r == this.size)
                        ctx.drawImage(sceneryImages['explosion'], 0, 64, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(x < this.x && r == this.size)
                        ctx.drawImage(sceneryImages['explosion'], 32, 32, 32, 32, x, y, this.grid.width, this.grid.height);
                    else
                        ctx.drawImage(sceneryImages['explosion'], 32, 0, 32, 32, x, y, this.grid.width, this.grid.height);
                } else {
                    
                    if(y > this.y && r == this.size)  
                        ctx.drawImage(sceneryImages['explosion'], 0, 32, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(y < this.y && r == this.size)
                        ctx.drawImage(sceneryImages['explosion'], 32, 64, 32, 32, x, y, this.grid.width, this.grid.height);
                    else
                        ctx.drawImage(sceneryImages['explosion'], 64, 0, 32, 32, x, y, this.grid.width, this.grid.height);
                }
            }

            //draw center
            ctx.drawImage(sceneryImages['explosion'], 0, 0, 32, 32, this.x, this.y, this.grid.width, this.grid.height);
        }else{
    		var index = Math.floor(countFps/15);
    		ctx.drawImage(sceneryImages['bomb_'+index], this.x, this.y, this.grid.width, this.grid.height);
        }
	};

    this.drawRange = function(x, y, color){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.grid.width, this.grid.height);
        ctx.drawImage(sceneryImages['explode'], x, y, this.grid.width, this.grid.height);
    }
};

exports.Bomb = Bomb;
