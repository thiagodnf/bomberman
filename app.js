// Define the used port
var port = process.env.PORT || 8080;

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(port);

console.log("Client running at port " + port);
