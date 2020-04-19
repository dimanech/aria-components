let lastBreakpoint;
let calls = [];

const config = {
	sm: 767,
	md: 1024,
	lg: 1440
};

export function getBreakpoint() {
	let breakpoint;

	switch (true) {
		case window.innerWidth < config.sm:
			breakpoint = 'small';
			break;
		case (window.innerWidth >= config.sm && window.innerWidth < config.md):
			breakpoint = 'medium';
			break;
		case window.innerWidth >= config.md:
			breakpoint = 'large';
			break;
	}

	return breakpoint;
}

export function listenBreakpointChange(callback) {
	calls.push(callback);
	window.addEventListener('resize', () => {
		const currentBreakpoint = getBreakpoint();
		if (currentBreakpoint === lastBreakpoint) {
			return;
		}
		lastBreakpoint = currentBreakpoint;
		calls.forEach(call => call());
	});
}
