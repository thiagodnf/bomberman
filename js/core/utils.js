/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

function Utils(){

	this.removeAt = function(array, index) {
		array.splice(index, 1);
	};

	this.getObjectById = function(array, id) {
		for (var i = 0; i < array.length; i++) {
			if (array[i].id == id){
				return array[i];
			}
		};

		return false;
	};

    this.getStartPosition = function(){
    	// Get all free positions in the grid
    	var freePositions = new Grid().getFreePositions();

    	// Select a random index
    	var index = this.getRandomIntegerNumber(0, freePositions.length-1);

    	// Return the random position
    	return freePositions[index];
    };

    this.getRandomIntegerNumber = function(min,max){
    	return Math.floor((Math.random() * (max)) + min);
    };

    this.generateUUID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };
}

exports.Utils = Utils;

/*

function contains(array, value){
	for (var i = 0; i < array.length; i++) {
		if(array[i] == value){
			return true;
		}
	}

	return false;
}

function getNewMatrix(sizeX, sizeY){
	var matrix = new Array(sizeX);

	for (var i = 0; i < sizeX; i++) {
	  matrix[i] = new Array(sizeY);
	}

	return matrix;
}*/
