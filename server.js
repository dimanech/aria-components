const fs = require('fs');
const path = require('path');
const url = require('url');
const connect = require('connect');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const port = 3000;
//const http2 = require('http2');
//const certs = {
//	key: fs.readFileSync(__dirname +  '/.certs/localhost.key', 'utf8'),
//	cert: fs.readFileSync(__dirname + '/.certs/localhost.crt', 'utf8'),
//	allowHTTP1: true
//};

const app = connect('127.0.0.1');

app.use(serveStatic(path.join(__dirname, 'cartridge1')));
app.use(serveStatic(path.join(__dirname, 'cartridge2')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/service-worker.js', function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/javascript'});
	res.end(fs.readFileSync('./cartridge1/js/services/service-worker.js'));
});

app.use('/plp', function(req, res) {
	const queryObject = url.parse(req.url, true).query;
	let html;

	for (let prop in queryObject) {
		const url = `./pages/plp/${prop}/${queryObject[prop]}.html`;

		if (fs.existsSync(url)) {
			html = fs.readFileSync(url);
			break;
		}
	}

	if (!html) {
		html = fs.readFileSync('./pages/plp.html');
	}

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(html);
});

app.use('/endpoint', function(req, res) {
	const request = req.body;
	let response = {success: 'success message'};
	let head = {
		code: 200,
		contentType: {'Content-Type': 'application/json'}
	}

	switch (true) {
		case (request.expectedResponse === 'formError'):
			response.error = 'Some general error for form';
			break;
		case (request.expectedResponse === 'inputErrors'):
			response.fields = {
				'address': 'some error'
			};
			break;
		case (request.expectedResponse === 'redirectUrl'):
			response.redirectUrl = '/plp';
			break;
		case (request.expectedResponse === 'notJSON'):
			head.contentType = {'Content-Type': 'text/html'};
			response = 'someString';
			break;
		case (request.expectedResponse === 'status500'):
			head.code = 500;
			head.contentType = {'Content-Type': 'text/html'};
			response = {
				errorMessage: 'Some server side error message'
			};
			break;
	}

	res.writeHead(head.code, head.contentType);
	const isTextType = request.expectedResponse === 'notJSON';
	res.end(isTextType ? response : JSON.stringify(response));
});

app.listen(port);
// to check service worker 1) comment http2.createServer 2) change to app.listen(port);
//http2.createSecureServer(certs, app).listen(process.env.PORT || port);
console.log('http://127.0.0.1:' + (process.env.PORT || port));
