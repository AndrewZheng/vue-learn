var path = require('path');

module.exports = {
	context: path.resolve(__dirname, 'src/'),
	entry: {
		app: './scripts/app.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist/scripts/')
	},
	module: {
		loaders: []
	},
	resolve: {
		modules:[],
		alias: {},
		extensions: []
	},
	plugins: [],
	devServer: {}
};