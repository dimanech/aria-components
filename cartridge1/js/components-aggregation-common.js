import NotificationsManager from './components/notifications/NotificationsManager.js';
import DialogManager from './components/dialogs/DialogManager.js';
import DialogButton from './components/dialogs/DialogButton.js';
import MainMenu from './components/menus/MainMenu.js';
import Popup from './components/menus/Popup.js';
import Tabs from './components/togglers/Tabs.js';
import Accordion from './components/togglers/Accordion.js';
import Expand from './components/togglers/Expand.js';
import SearchCombobox from './components/forms/SearchCombobox.js';

export default [
	['MainMenu', MainMenu],
	['Popup', Popup],
	['SearchCombobox', SearchCombobox],
	['NotificationsManager', NotificationsManager],
	['DialogManager', DialogManager],
	['DialogButton', DialogButton],
	['Tabs', Tabs],
	['Accordion', Accordion],
	['Expand', Expand],
];
