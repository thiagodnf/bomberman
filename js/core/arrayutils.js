/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/

if (typeof exports == "undefined") {
  exports = {};
}

function ArrayUtils(){

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


}

exports.ArrayUtils = ArrayUtils;

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
