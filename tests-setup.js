const puppeteer = require('puppeteer');
const assert = require('assert');
const pti = require('puppeteer-to-istanbul');

const width = 1920;
const height = 1080;

before(async () => {
	require('./server.js');

	global.assert = assert;
	global.browser = await puppeteer.launch({
		//headless: false,
		args: [`--window-size=${width},${height}`]
	});
	global.pti = pti;
});

after(() => {
	global.browser.close();
	//process.exit(0);
});

// https://pptr.dev/#?product=Puppeteer&version=v3.1.0&show=api-accessibilitysnapshotoptions
//const devices = require('puppeteer/DeviceDescriptors');
//const iPhone = devices['iPhone 6'];
// await page.emulate(iPhone);
