var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	context: path.resolve(__dirname, 'src/'),
	entry: {
		app: ['babel-polyfill','./scripts/app.js']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist/scripts/'),
		publicPath: 'assets/'
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', 'css-loader', 'postcss-loader']
		},{
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10000,
				name: 'img/[name]_[hash:7].[ext]'
			}
		},{
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10000,
				name: 'fonts/[name].[hash:7].[ext]'
			}
		},{
			test: /\.css$/,
			use: ExtractTextPlugin.extract({
			  fallback: "style-loader",
			  use: "css-loader"
			})
		},{
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
			  loaders: {
				css: ExtractTextPlugin.extract({
				  use: 'css-loader',
				  fallback: 'vue-style-loader' // <- 这是vue-loader的依赖，所以如果使用npm3，则不需要显式安装
				})
			  }
			}
		}
	    ],
		loaders: [ 
		     test: /\.vue|js$/,
			 enforce: 'pre',
			 include: path.resolve(__dirname, 'src'),
			 exclude: /node_modules/,
			 use: [{
				 loader: 'eslint-loader',
				 options: {
					 formatter: require('eslint-friendly-formatter')
				 }
			 }]
		]
	},
	resolve: {
		modules:[],
		alias: {
			'vue$': 'vue/dist/vue.js',
            components: path.resolve(__dirname, 'src/components/'),
            styles: path.resolve(__dirname, 'src/styles/'),	
            scripts: path.resolve(__dirname, 'src/scripts/'),
			views: path.resolve(__dirname, 'src/views/'),
		},
		extensions: ['.js', '.json', '.vue', '.css']
	},
	plugins: [
	    new HotModuleReplacementPlugin()
	],
	devServer: {
		contentBase: './src',
        inline: true,
        hot: true		
	}
};