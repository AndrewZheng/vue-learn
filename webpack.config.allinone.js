/*
 * @Author:Andrew
 * @Date: 2017-09-17
 */
'use strict';

var webpack = require("webpack");
var path = require("path");
var glob = require('glob')

//路径定义
var srcDir = path.resolve(process.cwd(), 'src');
var distDir = path.resolve(process.cwd(), 'dist');
var nodeModPath = path.resolve(__dirname, './node_modules');
var pathMap = require('./src/pathmap.json');
var publicPath = '/';

//插件定义
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

//入口文件定义
var entries = function () {
    var jsDir = path.resolve(srcDir, 'scripts');
	var cssDir=path.resolve(srcDir, 'styles');
	var imgDir=path.resolve(srcDir,'img');
	
    var entryFiles = glob.sync(jsDir + '/*.{js,jsx}');
    var entryCssFiles=glob.sync(cssDir+'/*.{css,scss}');
	var entryImgFiles=glob.sync(imgDir+'/*.{svg,jpeg,jpg,png,gif,ico}');

    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        map[filename] = filePath;
    }
	
    return map;
}

module.exports =function(options){
	options = options || {}
    var debug = options.debug !==undefined ? options.debug :true;
	
	var plugins = [];

    var extractCSS;
    var cssLoader;
    var sassLoader;

    plugins.push(new CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    }));
	
	if(debug){
        extractCSS = new ExtractTextPlugin('styles/[name].css?[contenthash]')
        cssLoader = extractCSS.extract(['css-loader'])
        sassLoader = extractCSS.extract(['css-loader', 'sass-loader'])

        plugins.push(extractCSS)
    }else{
        extractCSS = new ExtractTextPlugin('styles/[contenthash:8].[name].min.css', {
            // 当allChunks指定为false时，css loader必须指定怎么处理
            allChunks: false
        });
		
        cssLoader = extractCSS.extract(['css-loader']);
        sassLoader = extractCSS.extract(['css-loader', 'sass-loader']);

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
				uglifyOptions: {
					compress: {
						warnings: false
					},
					output: {
						comments: false
					},
					mangle: {
						except: ['$', 'exports', 'require']
					}
			    }
            }),
            new webpack.NoEmitOnErrorsPlugin()
        )
    }
	
	var config={
		context: path.resolve(__dirname, 'src/'),
		entry: Object.assign(entries(), {
            // 用到什么公共lib（例如jquery.js），就把它加进vendor去，目的是将公用库单独提取打包
            //'vendor': ['jquery']
        }),
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist/'),
			chunkFilename: '[chunkhash:8].chunk.js',
            publicPath: publicPath			
		},
		module: {
			rules: [
			{
				test: /\.css$/,
                exclude: /node_modules/,
				loader: cssLoader
			},
            {   
			    test: /\.scss$/, 
				exclude: /node_modules/,
				include: path.resolve(__dirname, "src/sass"),
				loader: sassLoader
			},
			{
				test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
				loader:[
					//小于10KB的图片会自动转成dataUrl，
					'url-loader?limit=10000&name=img/[hash:8].[name].[ext]',
					'image-webpack-loader?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
				]
            },
			{
				test: /\.(js|vue|jsx)$/,
				exclude: /node_modules/,
				use: [{
				  loader:'babel-loader',  
				  options: {
					 presets: ['es2015']
				  }
				}]
			}]
		},
		resolve: {			 
            alias: {
			  "zepto": "scripts/lib/zepto.js",
			  "jquery": "scripts/lib/jquery-1.12.4.js",
			  "avalon": "scripts/lib/avalon.shim.js",
			  "commonCss":"styles/common.css"
			},
			extensions: ['.js', '.css', '.scss', '.tpl', '.png', '.jpg']
		},
		plugins: plugins ,
		devServer: {
			contentBase: path.join(__dirname, './src'),
			host: '192.168.1.26',  
			port: 8081,
			inline: true,
			hot: true		
		}
	}
	
	return config;
};