var connect = require('connect');
    serveStatic = require('serve-static');
	port = process.env.PORT || 8080;

connect().use(serveStatic(__dirname)).listen(port);

