/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down, space) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false;
		space = space || false;

	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;

		switch (c) {
			// Controls
			case 37: // Left
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 39: // Right
				that.right = true; // Will take priority over the left key
				break;
			case 40: // Down
				that.down = true;
				break;
			case 32: // Space
				that.space = true;
				break;
		};
	};

	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 39: // Right
				that.right = false;
				break;
			case 40: // Down
				that.down = false;
				break;
			case 32: // Space
				that.space = false;
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		space: space,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};
