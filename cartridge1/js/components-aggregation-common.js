import MainMenu from './components/menus/MainMenu.js';
import Popup from './components/menus/Popup.js';
import ComboboxSearch from './components/forms/ComboboxSearch.js';
import NotificationsManager from './components/notifications/NotificationsManager.js';
import DialogManager from './components/dialogs/DialogManager.js';
import DialogButton from './components/dialogs/DialogButton.js';
import Accordion from './components/toggles/Accordion.js';
import MessageRelayService from './services/MessageRelay.js';

export default [
	['MessageRelayService', MessageRelayService],
	['NotificationsManager', NotificationsManager],
	['DialogManager', DialogManager],
	['DialogButton', DialogButton],
	['MainMenu', MainMenu],
	['Popup', Popup],
	['ComboboxSearch', ComboboxSearch],
	['Accordion', Accordion]
];
