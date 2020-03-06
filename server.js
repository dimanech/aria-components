const fs = require('fs');
const https = require('https');
const store = require('./utils/store').store;
const port = 3000;
const certs = {
	key: fs.readFileSync(__dirname +  '/certs/devserv.key', 'utf8'),
	cert: fs.readFileSync(__dirname + '/certs/devserv.crt', 'utf8')
};

const express = require('express');
const spdy = require('spdy');
const app = express();

app.use(express.static('./public'));

app.get('/', function (req, res) {
	console.log(req.method + ' ' + req.originalUrl);

	var html = fs.readFileSync('./public/index.html');
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(html);
});

app.post('/', function (req, res) {
	console.log(req.method + ' '+ req.originalUrl);

	var body = '';
	req.on('data', function (chunk) {
		body += chunk;
	});

	//res.writeHead(200, {'Content-Type': 'text/html'});
	//res.end(req.body);

	req.on('end', function () {
		store(body);
		console.dir(body);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(body);
	});
});

https.createServer(certs, app).listen(port);
console.log('Listening at https://127.0.0.1:' + port);


