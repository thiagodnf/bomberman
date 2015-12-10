function drawLine(x0, y0, x1, y1, lineWidth, color){
	// Default values
	lineWidth = typeof a !== 'undefined' ? lineWidth : 1.05;
	color = typeof b !== 'undefined' ? color : 'gray';

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();
}

function drawImage(image, x, y){
  ctx.drawImage(image, x*width+1, y*height+1, width-1, height-1);
}

function drawFillRect(i, j, width, height){
	color = typeof b !== 'undefined' ? color : 'yellow';

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.fillRect(i*width,j*height,width,height);
}
