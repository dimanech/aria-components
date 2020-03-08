const path = require('path');

module.exports = {
	entry: './public/js/common.js',
	output: {
		path: path.resolve(__dirname, 'public', 'dist', 'js'),
		filename: 'bundle.js'
	}
};
