import NotificationsManager from './components/notifications/NotificationsManager.js';
import DialogManager from './components/dialogs/DialogManager.js';
import DialogButton from './components/dialogs/DialogButton.js';
import MainMenu from './components/menus/MainMenu.js';
import Popup from './components/menus/Popup.js';
import Accordion from './components/togglers/Accordion.js';
import ComboboxSearch from './components/forms/ComboboxSearch.js';

export default [
	['MainMenu', MainMenu],
	['Popup', Popup],
	['ComboboxSearch', ComboboxSearch],
	['NotificationsManager', NotificationsManager],
	['DialogManager', DialogManager],
	['DialogButton', DialogButton],
	['Accordion', Accordion]
];
