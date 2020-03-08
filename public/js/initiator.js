import MainMenu from './components/menus/MainMenu.js';
import Popup from './components/menus/Popup.js';
import SearchCombobox from './components/forms/SearchCombobox.js';

const loadedComponents = [
	['MainMenu', MainMenu],
	['Popup', Popup],
	['SearchCombobox', SearchCombobox]
];

const componentsList = {};

function addComponentToList(componentName, component) {
	if (/Manager/g.test(componentName)) {
		componentsList[componentName] = component;
	}
}

function initComponent(domNode) {
	const loadedComponentsNames = loadedComponents.map(element => element[0]);
	const componentName = domNode.getAttribute('data-widget');
	const componentIndex = loadedComponentsNames.indexOf(componentName);

	if (componentIndex === -1) {
		console.warn(`"${componentName}" present on page, but it is import not found!`)
		return;
	}

	const component = new loadedComponents[componentIndex][1](domNode, componentsList);
	component.init();
	addComponentToList(componentName, component);
}

document.querySelectorAll('[data-widget]').forEach(node => initComponent(node));

