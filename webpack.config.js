const path = require('path');

module.exports = {
	mode: 'production',
	entry: { 'initiator': './cartridge1/js/initiator.js' },
	output: {
		path: path.resolve(__dirname, 'cartridge1', 'js'),
		filename: 'bundle.[name].js',
		chunkFilename: 'chunk.[name].js',
		publicPath: '/js/'
	}
};
