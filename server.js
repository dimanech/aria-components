const fs = require('fs');
const path = require('path');
const url = require('url');
const http2 = require('http2');
const connect = require('connect');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const compression = require('compression');
const port = 3000;
const certs = {
	key: fs.readFileSync(__dirname +  '/certs/devserv.key', 'utf8'),
	cert: fs.readFileSync(__dirname + '/certs/devserv.crt', 'utf8')
};

const app = connect('https://127.0.0.1');
app.use(serveStatic(path.join(__dirname, 'pages')));
app.use(serveStatic(path.join(__dirname, 'cartridge1')));
app.use(serveStatic(path.join(__dirname, 'cartridge2')));

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
		html = fs.readFileSync('./pages/plp/plp.html');
	}

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(html);
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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

app.use(compression());
app.listen();
http2.createSecureServer(certs, app).listen(process.env.PORT || port);
console.log('https://127.0.0.1:' + (process.env.PORT || port));
