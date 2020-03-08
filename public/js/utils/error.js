const log = window.console;

/**
 * @type {string[]}
 */
let errors = [];

/**
 *
 * @param {string|Error} message to show
 */
export function showErrorLayout(message) {
	const errorLayout = document.querySelector('#errorLayout');
	if (errorLayout) {
		if (message instanceof Error) {
			if (message.stack) {
				errors.unshift(message.stack);
			}
			errors.unshift(message.message);
		} else {
			errors.unshift(message);
		}

		log.error(message);
		errorLayout.addEventListener('click', () => {
			errorLayout.innerHTML = '';
			errors = [];
		}, { once: true });

		errorLayout.innerHTML = `<div class="danger" style="
            bottom: 0;
            right: 0;
            position: fixed;
            background-color: #ff0000c7;
            border: black;
            padding: 5px;
            z-index: 9999999;
            border-radius: 10px;
        ">
                Error: <br/>
                ${errors.join('<hr/>')}
            </div>`;
	}
}
