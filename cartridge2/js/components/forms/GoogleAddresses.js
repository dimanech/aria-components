// NB! just an example of implementation
// https://developers.google.com/maps/documentation/javascript/places-autocomplete
export default class GoogleAddresses {
	constructor(domNode) {
		this.input = domNode;
		this.autocomplete = null;
		this.config = this.getConfig();
		this.formElements = this.config.formElements || null;
		this.options = this.config.options || {
			types: ['geocode'],
			componentRestrictions: {
				country: 'ch'
			}
		};
	}

	init() {
		if (!this.config) {
			console.error('Could not init GoogleAddresses. No config provided')
			return;
		}

		if (typeof google === 'object' && typeof google.maps === 'object') {
			this.handleApiReady();
		} else {
			this.handleApiReady = this.handleApiReady.bind(this);
			document.addEventListener('googleApi:ready', this.handleApiReady);
		}
	}

	handleApiReady() {
		this.autocomplete = new google.maps.places.Autocomplete(this.input, this.options);
		this.autocomplete.setFields(['address_component']);
		this.addEventListeners();
	}

	addEventListeners() {
		this.fillInAddress = this.fillInAddress.bind(this);
		this.autocomplete.addListener('place_changed', this.fillInAddress);
	}

	/**
	 * Get each component of the address from the place details,
	 * and then fill-in the corresponding field on the forms (if formInfo is provided).
	 */
	fillInAddress() {
		const placeResult = this.autocomplete.getPlace();

		if (!placeResult || !this.formElements) {
			return;
		}

		if (this.formElements.address) {
			const streetNumber = this.getPropertyFromResult(placeResult, 'street_number');
			const address = this.getPropertyFromResult(placeResult, 'route');
			if (streetNumber) {
				this.setElementValue(this.formElements.address, `${streetNumber}, ${address}`);
			} else {
				this.setElementValue(this.formElements.address, address);
			}
		}

		if (this.formElements.postal_code) {
			this.setElementValue(this.formElements.postal_code, this.getPropertyFromResult(placeResult, 'postal_code'));
		}

		if (this.formElements.city) {
			this.setElementValue(this.formElements.city, this.getPropertyFromResult(placeResult, 'locality'));
		}

		if (this.formElements.country) {
			this.setElementValue(this.formElements.country, this.getPropertyFromResult(placeResult, 'country'));
		}

		if (this.formElements.state) {
			this.setElementValue(this.formElements.state, this.getPropertyFromResult(placeResult, 'administrative_area_level_1'));
		}
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

	getConfig() {
		const config = this.input.getAttribute('data-config');
		if (!config) {
			return null;
		}

		try {
			let parsedConfig = JSON.parse(config);
			if (parsedConfig.formElements) {
				for (const prop in parsedConfig.formElements) {
					if (parsedConfig.formElements.hasOwnProperty(prop)) {
						parsedConfig.formElements[prop] = document.querySelector(parsedConfig.formElements[prop]);
					}
				}
			}

			return parsedConfig;
		} catch (e) {
			console.error('GoogleAddresses config has JSON syntax errors', e);
		}
	}
}
