describe('Accordion', async () => {
	let page;

	before(async () => {
		page = await global.browser.newPage();
		await page.goto("http://127.0.0.1:3000/js/components/toggles/accordion.html", { waitUntil: ["networkidle2", "domcontentloaded"]});
		await page.setViewport({ width: 1920, height: 1080 });
		await page.coverage.startJSCoverage({resetOnNavigation: false});
	})

	beforeEach(async () => {
		await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
	});

	after(async () => {
		const jsCoverage = await page.coverage.stopJSCoverage();
		global.pti.write([...jsCoverage]);
	});

	describe('Structure', function () {
		it('should have proper roles', async function () {
			const snapshot = await page.accessibility.snapshot();
			const reference = [
				{ role: 'link', name: 'focusable before' },
				{ role: 'button', name: 'Section 1' },
				{ role: 'button', name: 'Section 2' },
				{ role: 'button', name: 'Section 3' },
				{ role: 'link', name: 'focusable after' }
			];

			global.assert.deepEqual(snapshot.children, reference);
		});
	})

	describe('Navigation', function () {
		const referenceSnapshot = [
			{ role: 'link', name: 'focusable before', focused: true },
			{ role: 'button', name: 'Section 1', focused: true },
			{ role: 'button', name: 'Section 2', focused: true },
			{ role: 'button', name: 'Section 3', focused: true },
			{ role: 'link', name: 'focusable after', focused: true }
		];

		it('should have ability to step in/out from accordion group', async function () {
			let snapshot;
			for (let step = 0; step <= referenceSnapshot.length; step++) {
				await page.keyboard.press('Tab');
				snapshot = await page.accessibility.snapshot();
				global.assert.deepEqual(snapshot.children[step], referenceSnapshot[step]);
			}
		});

		it('should go to next/prev panel controls with arrows', async function () {
			let snapshot;

			await page.focus('#section-1-control');

			await page.keyboard.press('ArrowDown');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[2], referenceSnapshot[2]);

			await page.keyboard.press('ArrowDown');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[3], referenceSnapshot[3]);

			await page.keyboard.press('ArrowUp');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[2], referenceSnapshot[2]);

			await page.keyboard.press('ArrowUp');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[1], referenceSnapshot[1]);
		});

		it('should cycle over panel controls', async function () {
			let snapshot;

			await page.focus('#section-3-control');
			await page.keyboard.press('ArrowDown');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[1], referenceSnapshot[1]);

			await page.focus('#section-1-control');
			await page.keyboard.press('ArrowUp');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[3], referenceSnapshot[3]);
		});

		it('should quick navigate to first and last control with Home/End', async function () {
			let snapshot;

			await page.focus('#section-2-control');
			await page.keyboard.press('Home');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[1], referenceSnapshot[1]);

			await page.focus('#section-2-control');
			await page.keyboard.press('End');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[3], referenceSnapshot[3]);
		});

		it('should go to the panel content focusable elements', async function () {
			const focusableContent = { role: 'link', name: 'Focusable content', focused: true };
			let snapshot;
			await page.focus('#section-1-control');
			await page.keyboard.press('Space');
			await page.keyboard.press('Tab');
			snapshot = await page.accessibility.snapshot();
			global.assert.deepEqual(snapshot.children[2], focusableContent);
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

		beforeEach(async () => {
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
				{ role: 'link', name: 'focusable before' },
				{
					role: 'button',
					name: 'Section 1',
					expanded: true,
					focused: true
				},
				{ role: 'link', name: 'Focusable content' },
				{ role: 'button', name: 'Section 2' },
				{ role: 'button', name: 'Section 3' },
				{ role: 'link', name: 'focusable after' }
			];
			global.assert.deepEqual(snapshot.children, reference);
		});

		it('should open linked panel on Enter keyup', async function () {
			await assertClosed();
			await page.focus(buttonsSelector);
			await page.keyboard.press('Enter');
			await assertOpen();
		});

		it('should open linked panel on Space keyup', async function () {
			await assertClosed();
			await page.focus(buttonsSelector);
			await page.keyboard.press('Space');
			await assertOpen();
		});

		it('should open linked panel on tap', async function () {
			await assertClosed();
			await page.tap(buttonsSelector);
			await assertOpen();
		});

		it('should do nothing on click to opened panel', async function () {
			const initialState = await getState();
			await firstButtonHandle.click();
			const state = await getState();

			global.assert.deepEqual(initialState, state);
		});

		it('active control should be disabled')

		it('panel should be closed on click to other control', async function () {
			await firstButtonHandle.click();
			await assertOpen();
			await secondButtonHandle.click();
			await assertClosed();

			const snapshot = await page.accessibility.snapshot();
			const reference = [
				{ role: 'link', name: 'focusable before' },
				{ role: 'button', name: 'Section 1' },
				{
					role: 'button',
					name: 'Section 2',
					expanded: true,
					focused: true
				},
				{ role: 'text', name: 'Plain content' },
				{ role: 'button', name: 'Section 3' },
				{ role: 'link', name: 'focusable after' }
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

	describe('Allow multiple', function () {
	})

	describe('Allow toggle', function () {
	})

	describe('Toggle height', function () {
		const buttonSelector = '.accordion__control';
		let firstButtonHandle;
		let secondButtonHandle;
		let firstButtonControlledElementID;

		const getHeight = async () => page.$eval(firstButtonControlledElementID, node => node.style.height);

		beforeEach(async () => {
			const controls = await page.$$(buttonSelector);
			firstButtonHandle = controls[0];
			secondButtonHandle = controls[1];
			firstButtonControlledElementID = '#' + await firstButtonHandle.evaluate(node => node.getAttribute('aria-controls'));
		});

		it('height should be "0px" when initialized', async function () {
			global.assert.strictEqual(await getHeight(), '0px');
		});

		it('height should be "50px" when opened', async function () {
			await firstButtonHandle.click();
			global.assert.strictEqual(await getHeight(), '50px');
		});

		it('height should be "0" when closed', async function () {
			await firstButtonHandle.click();
			await secondButtonHandle.click();
			global.assert.strictEqual(await getHeight(), '0px');
		});

		it('height should be cleared after destroy', async function () {
			await page.evaluate(() => window.testedComponent.destroy());
			global.assert.strictEqual(await getHeight(), 'auto');
		});
	})
});
