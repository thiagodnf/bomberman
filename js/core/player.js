/**************************************************
** GAME PLAYER CLASS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

var Player = function(id, grid, x, y, image) {
	this.id = id;
  this.image = image;
  this.grid = grid;
  this.x = x;
	this.y = y;
  this.name = "User";
  this.killed = false;
  this.maxBomb = 2;
  this.countBomb = 0;
  this.direction = 3;

    this.init = function(){
  		var freePositions = this.grid.getFreePositions();
  		var index = this.getRandomIntegerNumber(0, freePositions.length-1);
  		var startPoint = freePositions[index];
  		this.x = startPoint.i*this.grid.width;
      this.y = startPoint.j*this.grid.height;
    }

	this.getRandomIntegerNumber = function(min,max){
		return Math.floor((Math.random() * (max)) + min);
	};

    this.kill = function(bomb){
        if(this.killed){
            return false;
        }

        if(this.x == bomb.x && this.y == bomb.y){
            return true;
        }

        var range = bomb.getRange();

        for(var i = 0; i < range.length; i++){
            if(range[i].x == this.x && range[i].y == this.y){
                return true;
            }
        }

        return false;
    }

	this.newBomb = function(keys) {
		if (keys.space) {
            keys.space = false;
            if(this.countBomb < this.maxBomb){
                this.countBomb++;
                return new Bomb(-1, this.grid, this.x, this.y, this.id);
            }
		}

		return false;
	}

	this.update = function(keys) {
		// Previous position
		var prevX = this.x,
		    prevY = this.y;

		// Up key takes priority over down
		if (keys.up) {
          this.direction = 3;
      		if(this.y > 0 && ! this.hasWallOnTheTop()){
        		this.y -= this.grid.height;
        		if(this.y % this.grid.height == 0){
          			keys.up = false;
        		}
      		}
		} else if (keys.down) {
          this.direction = 0;
      		if(this.y < this.grid.height*(this.grid.maxJ-1) && ! this.hasWallOnTheBottom()){
	        	this.y += this.grid.height;
	        	if(this.y % this.grid.height == 0){
	          		keys.down = false;
				}
      		}
		} else if (keys.left) {
          this.direction = 2;
      		if(this.x > 0 && ! this.hasWallOnTheLeft()){
        		this.x -= this.grid.width;
        		if(this.x % this.grid.width == 0){
          			keys.left = false;
        		}
      		}
		} else if (keys.right) {
          this.direction = 1;
    			if(this.x < this.grid.width*(this.grid.maxI-1) && ! this.hasWallOnTheRight()){
        		this.x += this.grid.width;
        		if(this.x % this.grid.width == 0){
        			keys.right = false;
        		}
      		}
		}

		return (prevX != this.x || prevY != this.y) ? true : false;
	};

	this.hasWallOnTheRight = function(){
		return this.grid.hasWall(this.getPosI() + 1, this.getPosJ());
	};

	this.hasWallOnTheLeft = function(){
		return this.grid.hasWall(this.getPosI() - 1, this.getPosJ());
	};

	this.hasWallOnTheTop = function(){
		return this.grid.hasWall(this.getPosI(), this.getPosJ() - 1);
	};

	this.hasWallOnTheBottom = function(){
		return this.grid.hasWall(this.getPosI(), this.getPosJ() + 1);
	};

	this.getPosI = function(){
		return Math.floor(this.x/this.grid.width);
	};

	this.getPosJ = function(){
		return Math.floor(this.y/this.grid.height);
	};

	this.draw = function(ctx) {
        if( this.killed){
            return;
        }
        
        var index = this.direction;
        ctx.drawImage(playerImages['10'], 0, index*52, 32, 52, this.x, this.y-20, this.grid.width, this.grid.height+20);
        //ctx.drawImage(playerImages[this.image], this.x, this.y, this.grid.width, this.grid.height);
	};
};

exports.Player = Player;
