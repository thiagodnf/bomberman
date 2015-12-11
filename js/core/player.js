/**************************************************
** GAME PLAYER CLASS
**************************************************/

var TOP = 1,
    BOTTOM = 2,
    LEFT = 3,
    RIGHT = 4;

if (typeof exports == "undefined") {
  exports = {};
}

var Player = function(id, grid, x, y, image, name) {
	this.id = id;

	this.image = image;
	this.grid = grid;
	this.x = x;
	this.y = y;
	this.name = name;
	this.killed = false;
	this.maxBomb = 1;
	this.countBomb = 0;
	this.size = 1;
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
            if(this.countBomb < this.maxBomb && ! this.hasBomb(this.x, this.y)){
                this.countBomb++;
                return new Bomb(-1, this.grid, this.x, this.y, this.id, this.size);
            }
		}

		return false;
	}

    this.getAnItem = function(items){
        for(var i=0; i < items.length;i++){
            if(items[i].x == this.x && items[i].y == this.y){
                if(items[i].type == 1){
                    this.maxBomb++;
                }else if(items[i].type == 2){
                    this.size++;
                }

                return items[i];
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
      		if(this.y > 0 && ! this.hasWallOnTheTop() && ! this.hasBombAt(TOP)){
        		this.y -= this.grid.height;
        		if(this.y % this.grid.height == 0){
          			keys.up = false;
        		}
      		}
		} else if (keys.down) {
          this.direction = 0;
      		if(this.y < this.grid.height*(this.grid.maxJ-1) && ! this.hasWallOnTheBottom() && ! this.hasBombAt(BOTTOM)){
	        	this.y += this.grid.height;
	        	if(this.y % this.grid.height == 0){
	          		keys.down = false;
				}
      		}
		} else if (keys.left) {
         	this.direction = 2;
      		if(this.x > 0 && ! this.hasWallOnTheLeft() && ! this.hasBombAt(LEFT)){
        		this.x -= this.grid.width;
        		if(this.x % this.grid.width == 0){
          			keys.left = false;
        		}
      		}
		} else if (keys.right) {
          	this.direction = 1;
			if(this.x < this.grid.width*(this.grid.maxI-1) && ! this.hasWallOnTheRight() && ! this.hasBombAt(RIGHT)){
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

    this.hasBomb = function(x, y){
        for(var i = 0; i< bombs.length;i++){
            if(bombs[i].x == x && bombs[i].y == y){
                return true;
            }
        }
        return false;
    };

	this.draw = function(ctx) {
        if( this.killed){
            return;
        }
        
        var walking = keys.up || keys.down || keys.left || keys.right;
        var count = Math.floor(countFps/15);
        var index = this.direction;

        if(this.image != null){
        	ctx.drawImage(playerImages['10'], walking*count*32, index*52, 32, 52, this.x, this.y-20, this.grid.width, this.grid.height+20);
            //ctx.drawImage(playerImages[this.image], this.x, this.y, this.grid.width, this.grid.height);
        }
	};

    this.hasBombAt = function(location){
        if(location == TOP){
            return this.hasBomb(this.x, this.y - this.grid.height);
        }else if(location == BOTTOM){
            return this.hasBomb(this.x, this.y + this.grid.height);
        }else if(location == LEFT){
            return this.hasBomb(this.x - this.grid.width, this.y);
        }else if(location == RIGHT){
            return this.hasBomb(this.x + this.grid.width, this.y);
        }
    }
};

exports.Player = Player;
