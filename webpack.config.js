const path = require('path');

module.exports = {
	mode: 'production',
	entry: { 'initiator': './cartridge1/js/initiator.js' },
	output: {
		path: path.resolve(__dirname, 'cartridge1', 'dist', 'js'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
		publicPath: 'dist/js/'
	}
};
