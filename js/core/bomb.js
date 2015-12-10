/**************************************************
** GAME BOMB CLASS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

var Bomb = function(id, grid, x, y, playerId) {
    this.id = id;
    this.grid = grid;
    this.insertIn = new Date().getTime(),
	this.x = x;
  	this.y = y;
    this.size = 5;
    this.explode = null;
    this.playerId = playerId;

    this.getRange = function(){
        var range = [];

        for(var i = 1; i <= this.size; i++){
            if( ! this.grid.hasWallByPosition(this.x, this.y - this.grid.height)){
                range.push({x:this.x, y:this.y - this.grid.height * i});
            }
            if( ! this.grid.hasWallByPosition(this.x, this.y + this.grid.height)){
                range.push({x:this.x, y:this.y + this.grid.height * i});
            }
            if( ! this.grid.hasWallByPosition(this.x - this.grid.width, this.y)){
                range.push({x:this.x - this.grid.width * i, y:this.y});
            }
            if( ! this.grid.hasWallByPosition(this.x + this.grid.width, this.y)){
                range.push({x:this.x + this.grid.width * i, y:this.y});
            }
        }

        return range;
    };

    this.killThisBomb = function(bomb){
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

            console.log(range);

            for(var i = 0; i < range.length; i++){
                var x = range[i].x,
                    y = range[i].y;

                if(x > this.x || x < this.x) {
                    if(i == range.length-1)
                        ctx.drawImage(sceneryImages['explosion'], 0, 64, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(i == range.length-2)
                        ctx.drawImage(sceneryImages['explosion'], 32, 32, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(i < range.length-4)
                        ctx.drawImage(sceneryImages['explosion'], 32, 0, 32, 32, x, y, this.grid.width, this.grid.height);
                } else if(y > this.y || y < this.y) {
                    if(i == range.length-3)
                        ctx.drawImage(sceneryImages['explosion'], 0, 32, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(i == range.length-4)
                        ctx.drawImage(sceneryImages['explosion'], 32, 64, 32, 32, x, y, this.grid.width, this.grid.height);
                    else if(i < range.length-4)
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
        ctx.drawImage(explodeImage, x, y, this.grid.width, this.grid.height);
    }
};

exports.Bomb = Bomb;
