const fs = require('fs');
const path = require('path');
const http2 = require('http2');
const connect = require('connect');
const serveStatic = require('serve-static');
const port = 3000;
const certs = {
	key: fs.readFileSync(__dirname +  '/certs/devserv.key', 'utf8'),
	cert: fs.readFileSync(__dirname + '/certs/devserv.crt', 'utf8')
};

const app = connect('https://127.0.0.1');
app.use(serveStatic(path.join(__dirname, 'public')));
app.listen();
http2.createSecureServer(certs, app).listen(process.env.PORT || port);
console.log('https://127.0.0.1:' + (process.env.PORT || port));
