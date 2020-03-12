// NB! just an example of implementation
// https://developers.google.com/maps/documentation/javascript/places-autocomplete
export default class GoogleAddresses {
	constructor(domNode, pageComponents, options) {
		this.inputField = domNode;
		this.autocomplete = null;
		this.formInfo = options.formInfo || null;
		this.options = options.options || {
			types: ['geocode'],
			componentRestrictions: {
				country: 'ca'
			}
		};
	}

	init() {
		if (typeof google === 'object' && typeof google.maps === 'object') {
			this.handleApiReady();
		} else {
			this.handleApiReady = this.handleApiReady.bind(this);
			document.addEventListener('googleApi:ready', this.handleApiReady);
		}
	}

	handleApiReady() {
		this.autocomplete = new google.maps.places.Autocomplete(this.inputField, this.options);
		this.autocomplete.setFields(['address_component']);
		this.addEventListeners();
	}

	addEventListeners() {
		this.fillInAddress = this.fillInAddress.bind(this);
		this.autocomplete.addListener('place_changed', this.fillInAddress);
	}

	/**
	 * Get each component of the address from the place details,
	 * and then fill-in the corresponding field on the form (if formInfo is provided).
	 */
	fillInAddress() {
		const placeResult = this.autocomplete.getPlace();

		if (!placeResult || !this.formInfo) {
			return;
		}

		const streetNumber = this.getPropertyFromResult(placeResult, 'street_number');
		const address = this.getPropertyFromResult(placeResult, 'route');
		if (streetNumber) {
			this.setElementValue(this.formInfo.address, `${streetNumber}, ${address}`);
		} else {
			this.setElementValue(this.formInfo.address, address);
		}

		this.setElementValue(this.formInfo.postal_code, this.getPropertyFromResult(placeResult, 'postal_code'));
		this.setElementValue(this.formInfo.city, this.getPropertyFromResult(placeResult, 'locality'));

		if (this.formInfo.country !== '') {
			this.setElementValue(this.formInfo.country, this.getPropertyFromResult(placeResult, 'country'));
		}

		this.setElementValue(this.formInfo.state, this.getPropertyFromResult(placeResult, 'administrative_area_level_1'));
	}

	setElementValue(domNode, value) {
		let val = value;
		if (val === null) {
			val = '';
		}
		const element = domNode;
		switch (element.tagName) {
			case 'SELECT':
				for (let i = 0; i < element.options.length; i++) {
					if (element.options[i].value === value) {
						element.options[i].selected = true;
						return;
					}
				}
				break;
			default:
				element.value = val;
				break;
		}
	}

	getPropertyFromResult(place, type) {
		let value = '';

		for (let i = 0; i < place.address_components.length; i++) {
			const addressType = place.address_components[i].types[0];

			if (addressType === type) {
				value = (type !== 'administrative_area_level_1' && type !== 'country')
						? place.address_components[i].long_name
						: place.address_components[i].short_name;
			}
		}

		return value;
	}

	destroy() {
		document.removeEventListener('googleApi:ready', this.handleApiReady);
		this.autocomplete = null;
	}
}
