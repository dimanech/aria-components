const fs = require('fs');
const path = require('path');
const pathUtil = path;
const http2 = require('http2');
const connect = require('connect');
const serveStatic = require('serve-static');
const port = 3000;
const certs = {
	key: fs.readFileSync(__dirname +  '/certs/devserv.key', 'utf8'),
	cert: fs.readFileSync(__dirname + '/certs/devserv.crt', 'utf8')
};

function setHeaders (res, path) {
	if (pathUtil.extname(path) === '.js') {
		res.setHeader('Content-Type', 'application/javascript')
	}
}

const app = connect('https://127.0.0.1');
app.use(serveStatic(path.join(__dirname, 'public'), { 'setHeaders': setHeaders }));
app.listen();
http2.createSecureServer(certs, app).listen(process.env.PORT || port);


