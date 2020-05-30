const puppeteer = require('puppeteer');
const assert = require('assert');

const width = 1920;
const height = 1080;

before(async () => {
	require('./server.js');
	global.assert = assert;
	global.browser = await puppeteer.launch({
		args: ['--start-maximized', `--window-size=${width},${height}`]
	});
});

after(() => {
	global.browser.close();
	process.exit(0);
});


// Dummy server
//http.createServer((req, res) => {
//	fs.readFile(__dirname + req.url, (err, data) => {
//		if (err) {
//			res.writeHead(404);
//			res.end(JSON.stringify(err));
//			return;
//		}
//		const resourceType = path.extname(req.url);
//		switch (resourceType) {
//			case '.html':
//				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
//				break;
//			case '.js':
//				res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
//				break;
//			case '.css':
//				res.setHeader('Content-Type', 'text/css; charset=UTF-8');
//				break;
//		}
//		res.statusCode = 200;
//		res.end(data);
//	});
//}).listen(3000);
