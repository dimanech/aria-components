const statusBlock = document.getElementById('status');
const form = document.querySelector('form');

const serialize = form => {
	let obj = {};

	form.querySelectorAll('input, select, textarea').forEach(element => {
		const name = element.name;
		const value = element.value;

		if (name) {
			obj[name] = value;
		}
	});

	return JSON.stringify(obj);
};

const formClear = form => {
	form.querySelectorAll('textarea').forEach(element => {
		element.value = '';
	});
};

const formSubmit = event => {
	event.preventDefault();

	const data = serialize(form);
	const http = new XMLHttpRequest();

	http.open("POST", "/", true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = () => {
		if (http.readyState === 4 && http.status === 200) {
			statusBlock.innerText = http.responseText;
			formClear(form);
		} else {
			console.log('readyState=' + http.readyState + ', statusBlock: ' + http.status);
		}
	};

	http.send(data);
};

const topics = {
	"themes": [
		{
			"id": 0,
			"name": "HTML",
			"topics": [
				{
					"id": 0,
					"name": "General understanding"
				},
				{
					"id": 1,
					"name": "HTML anathomy. Doctype, tag, attribute. W3C validators"
				}
			]
		},
		{
			"id": 1,
			"name": "CSS & SASS",
			"topics": [
				{
					"id": 0,
					"name": "Selectors, declarations"
				},
				{
					"id": 1,
					"name": "Base formatting contexts - block, inline"
				}
			]
		}
	]
};

const setThemes = () => {
	const themeSelect = document.getElementById('theme');
	let options = '';
	topics.themes.forEach(theme => {
		options += `<option value="${theme.id}">${theme.name}</option>`
	});
	return themeSelect.innerHTML = options;
};

const updateTopics = () => {
	const selectedTheme = document.getElementById('theme').value;
	const topicsSelect = document.getElementById('topic');
	let topicsList = [];
	let options = '';

	topics.themes.forEach(theme => {
		const currentTheme = parseFloat(selectedTheme);
		if (theme.id === currentTheme) {
			return topicsList = theme.topics;
		}
	});

	topicsList.forEach(topic => {
		return options += `<option value="${topic.id}">${topic.name}</option>`;
	});

	return topicsSelect.innerHTML = options;
};

setThemes();
updateTopics();

document.getElementById('theme').addEventListener('change', updateTopics);
document.getElementById('submit').addEventListener('click', formSubmit);
