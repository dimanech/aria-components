describe('Accordion', async () => {
	let page;
	const allCoverage = [];

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
			const snapshot = await page.accessibility.snapshot();
			const reference = [
				{ role: 'button', name: 'Section 1' },
				{ role: 'button', name: 'Section 2' },
				{ role: 'button', name: 'Section 3' }
			];

			global.assert.deepEqual(snapshot.children, reference);
		});
	})

	describe('Toggle panel', function () {
		let firstButtonHandle;
		let secondButtonHandle;
		const buttonsSelector = '.accordion__control';
		let firstPanelSelector;

		const assertOpen = async function () {
			global.assert.strictEqual(await page.$eval(firstPanelSelector, node => node.getAttribute('aria-hidden')), 'false');
			global.assert.strictEqual(await page.$eval(buttonsSelector, node => node.getAttribute('aria-expanded')), 'true');
		}

		const assertClosed = async function () {
			global.assert.strictEqual(await page.$eval(firstPanelSelector, node => node.getAttribute('aria-hidden')), 'true');
			global.assert.strictEqual(await page.$eval(buttonsSelector, node => node.getAttribute('aria-expanded')), 'false');
		}

		const getState = async function () {
			return {
				panel: page.$eval(firstPanelSelector, node => node.getAttribute('aria-hidden')),
				control: page.$eval(buttonsSelector, node => node.getAttribute('aria-expanded'))
			}
		}

		before(async () => {
			const buttons = await page.$$(buttonsSelector);
			firstButtonHandle = buttons[0];
			secondButtonHandle = buttons[1];
			firstPanelSelector = '#' + await firstButtonHandle.evaluate(node => node.getAttribute('aria-controls'));
		});

		it('should open linked panel on click', async function () {
			await assertClosed();
			await firstButtonHandle.click();
			await assertOpen();

			const snapshot = await page.accessibility.snapshot();
			const reference = [
				{
					role: 'button',
					name: 'Section 1',
					expanded: true,
					focused: true
				},
				{ role: 'link', name: 'Focusable content' },
				{ role: 'button', name: 'Section 2' },
				{ role: 'button', name: 'Section 3' }
			];
			global.assert.deepEqual(snapshot.children, reference);
		});

		it('should do nothing on click to opened panel', async function () {
			const initialState = await getState();
			await firstButtonHandle.click();
			const state = await getState();

			global.assert.deepEqual(initialState, state);
		});

		it('active control should be disabled')

		it('panel should be closed on click to other control', async function () {
			await assertOpen();
			await secondButtonHandle.click();
			await assertClosed();

			const snapshot = await page.accessibility.snapshot();
			const reference = [
				{ role: 'button', name: 'Section 1' },
				{
					role: 'button',
					name: 'Section 2',
					expanded: true,
					focused: true
				},
				{ role: 'text', name: 'Plain content' },
				{ role: 'button', name: 'Section 3' }
			];
			global.assert.deepEqual(snapshot.children, reference);
		});

		it('should do nothing when destroyed', async function () {
			const initialState = await getState();

			await page.evaluate(() => window.testedComponent.destroy());
			await firstButtonHandle.click();

			const state = await getState();
			global.assert.deepEqual(initialState, state);
		});
	})

	describe('Toggle height', function () {
		const buttonSelector = '.accordion__control';
		let firstButtonHandle;
		let firstButtonControlledElementID;

		const getHeight = async () => page.$eval(firstButtonControlledElementID, node => node.style.height);

		before(async () => {
			const controls = await page.$$(buttonSelector);
			firstButtonHandle = controls[0];
			firstButtonControlledElementID = '#' + await firstButtonHandle.evaluate(node => node.getAttribute('aria-controls'));
		});

		it('height should be "auto" when initialized', async function () {
			global.assert.strictEqual(await getHeight(), 'auto');
		});

		it('height should be "200" when opened', async function () {
			await firstButtonHandle.click();
			const snapshot = await page.accessibility.snapshot();
			console.log(snapshot)
			global.assert.strictEqual(await getHeight(), '200');
		});

		it('height should be "0" when closed', async function () {
			await firstButtonHandle.click();
			global.assert.strictEqual(await getHeight(), '0');
		});

		it('height should be cleared after destroy', async function () {
			await page.evaluate(() => window.testedComponent.destroy());
			global.assert.strictEqual(await getHeight(), 'auto');
		});
	})
});
