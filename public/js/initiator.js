import MainMenu from './components/menus/MainMenu.js';
import Popup from './components/menus/Popup.js';
import SearchCombobox from './components/forms/SearchCombobox.js';

const componentsList = {};

function addComponentToList(componentName, component) {
	if (/Manager/g.test(componentName)) {
		componentsList[componentName] = component;
	}
}

function initComponent(domNode) {
	const componentName = domNode.getAttribute('data-widget');
	let component;

	console.log(componentName)

	switch (true) {
		case (componentName === 'MainMenu'):
			component = new MainMenu(domNode, componentsList);
			break;
		case (componentName === 'SearchCombobox'):
			component = new SearchCombobox(domNode, componentsList);
			break;
		case (componentName === 'Popup'):
			component = new Popup(domNode, componentsList);
			break;
		default:
			return;
	}
	component.init();
	addComponentToList(componentName, component);
}

document.querySelectorAll('[data-widget]')
		.forEach(node => initComponent(node));

console.log(componentsList);

