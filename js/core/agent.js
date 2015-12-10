function Agent(i, j, maxI, maxJ, walls){
  this.i = i;
  this.j = j;

  this.walls = walls;

  this.maxI = typeof maxI !== 'undefined' ? maxI : 10;
  this.maxJ = typeof maxJ !== 'undefined' ? maxJ : 10;

  this.moveToUp = function(){
  	if(this.j != 0 && ! this.hasWallOnUp()){
  		this.j--;
  	}
  }

  this.moveToDown = function(){
    if(this.j < this.maxJ-1 && ! this.hasWallOnDown()){
  		this.j++;
  	}
  }

  this.moveToLeft = function(){
  	if(this.i != 0 && ! this.hasWallOnTheLeft()){
  		this.i--;
  	}
  }

  this.moveToRight = function(){
  	if(this.i < this.maxI-1 && ! this.hasWallOnTheRight()){
  		this.i++;
  	}
  }

  this.hasWallOnTheRight = function(){
    return this.walls[this.i+1][this.j] == 1;
  }

  this.hasWallOnTheLeft = function(){
    return this.walls[this.i-1][this.j] == 1;
  }

  this.hasWallOnUp = function(){
    return this.walls[this.i][this.j-1] == 1;
  }

  this.hasWallOnDown = function(){
    return this.walls[this.i][this.j+1] == 1;
  }
}
