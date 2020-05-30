const puppeteer = require('puppeteer');
const assert = require('assert');
const pti = require('puppeteer-to-istanbul');

const width = 1920;
const height = 1080;

//const devices = require('puppeteer/DeviceDescriptors');
//const iPhone = devices['iPhone 6'];

before(async () => {
	require('./server.js');

	global.assert = assert;
	global.browser = await puppeteer.launch({
		args: [`--window-size=${width},${height}`]
	});
	global.pti = pti;
});

after(() => {
	global.browser.close();
	//process.exit(0);
});
