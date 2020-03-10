const path = require('path');

module.exports = {
	mode: 'production',
	entry: { 'initiator': './public/js/initiator.js' },
	output: {
		path: path.resolve(__dirname, 'public', 'dist', 'js'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
		publicPath: 'dist/js/'
	}
};
