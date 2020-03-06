'use strict';

const fs = require('fs');
let basket = require('../data/products');

function store(dataStr) {
	basket.products.push(JSON.parse(dataStr));
	//fs.writeFileSync('./data/questions.json', JSON.stringify(questions), 'UTF8');
	console.log('Store: ' + dataStr);
}

module.exports = {
	store: store
};
