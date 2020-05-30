describe('Accordion', async () => {
	let page;

	before(async () => {
		page = await global.browser.newPage();
		// await page.emulate(iPhone);
		await page.goto("http://127.0.0.1:3000/js/components/toggles/accordion.html", { waitUntil: 'networkidle2'});
		await page.setViewport({ width: 1920, height: 1080 });
		await page.coverage.startJSCoverage();
	});

	after(async () => {
		const jsCoverage = await page.coverage.stopJSCoverage();
		global.pti.write([...jsCoverage]);
		await page.close();
	});

	describe('Structure', function () {
		it('should have proper roles', async function () {
			// https://pptr.dev/#?product=Puppeteer&version=v3.1.0&show=api-accessibilitysnapshotoptions
			//const snapshot = await page.accessibility.snapshot();
			//console.log(snapshot);
		});
	})

	describe('Toggle panel', function () {
		let firstButtonHandle;
		let firstButtonControlledElementID;
		let secondButtonHandle;

		before(async () => {
			const buttons = await page.$$('.accordion__control');
			firstButtonHandle = buttons[0];
			secondButtonHandle = buttons[1];
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

		it('should do nothing when destroyed', async function () {
			const panelState = await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden'));
			const controlState = await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded'));

			await page.evaluate(() => window.testedComponent.destroy());
			await firstButtonHandle.click();

			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.getAttribute('aria-hidden')), panelState);
			global.assert.strictEqual(await page.$eval('.accordion__control', node => node.getAttribute('aria-expanded')), controlState);
		});
	})

	describe('Toggle height', function () {
		let firstButtonHandle;
		let firstButtonControlledElementID;

		before(async () => {
			const controls = await page.$$('.accordion__control');
			firstButtonHandle = controls[0];
			firstButtonControlledElementID = '#' + await firstButtonHandle.evaluate(node => node.getAttribute('aria-controls'));
		});

		it('height should be cleared after destroy', async function () {
			await page.evaluate(() => window.testedComponent.destroy());
			global.assert.strictEqual(await page.$eval(firstButtonControlledElementID, node => node.style.height), 'auto');
		});
	})

});
