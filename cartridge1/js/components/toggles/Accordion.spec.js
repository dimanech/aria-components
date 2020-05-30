describe('Accordion', async () => {
	let page;

	before(async () => {
		page = await global.browser.newPage();
		await page.goto("http://127.0.0.1:3000/js/components/toggles/accordion.html");
		await page.setViewport({ width: 1920, height: 1040 });
	});

	after(async () => {
		await page.close();
	});

	describe('Structure', function () {
		it('should have proper roles', async function () {
			// https://pptr.dev/#?product=Puppeteer&version=v3.1.0&show=api-accessibilitysnapshotoptions
			const snapshot = await page.accessibility.snapshot();
			//console.log(snapshot);
		});
	})

	describe.only('Toggle panel', function () {
		let firstButtonHandle;
		let firstButtonControlledElementID;
		let secondButtonHandle;

		before(async () => {
			const controlls = await page.$$('.accordion__control');
			firstButtonHandle = controlls[0];
			secondButtonHandle = controlls[1];
			firstButtonControlledElementID = '#' + await firstButtonHandle.evaluate(node => node.getAttribute('aria-controls'));
		});

		it('should open linked panel on click', async function () {
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'true');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'false');
			await firstButtonHandle.click();
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'false');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'true');
		});

		it('should do nothing on click to opened panel', async function () {
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'false');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'true');
			await firstButtonHandle.click();
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'false');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'true');
		});

		it('panel should be closed on click to other control', async function () {
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'false');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'true');
			await secondButtonHandle.click();
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), 'true');
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), 'false');
		});
	})

});
