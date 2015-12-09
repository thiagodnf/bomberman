/**************************************************
** GAME GRID CLASS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

var Grid = function() {
	this.maxI = 11;
	this.maxJ = 11;
	this.width = 40;
	this.height = 40;

	this.draw = function(ctx) {

		// Draw the walls
		for(var i = 0; i < this.maxI; i++){

			for(var j = 0; j < this.maxJ; j++){

				if(this.hasWall(i, j)){
					ctx.drawImage(sceneryImages['wall'], i*this.width, j*this.height, this.width, this.height);
				}
			}
		}
	};

	this.hasWall = function(i, j){
		return i % 2 != 0 && j % 2 != 0;
	};

	this.hasWallByPosition = function(x, y){
		return this.hasWall(this.getPosI(x), this.getPosJ(y));
	};

	this.getPosI = function(x){
		return Math.floor(x / this.width);
	};

	this.getPosJ = function(y){
		return Math.floor(y / this.height);
	}

	this.getFreePositions = function(){
		var freePositions = [];

		for(var i = 0; i < this.maxI; i++){
			for(var j = 0; j < this.maxJ; j++){
				if( ! this.hasWall(i, j)){
					freePositions.push({i:i,j:j});
				}
			}
		}
		
		return freePositions;
	};
};

exports.Grid = Grid;
