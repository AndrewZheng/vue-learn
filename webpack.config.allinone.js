/*
 * @Author:Andrew
 * @Date: 2017-09-17
 */
'use strict';

var webpack = require("webpack");
var path = require("path");
var glob = require('glob');

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
	var compDir=path.resolve(srcDir,'comments');
	
 

    var entryFiles = glob.sync(jsDir + '/*.{js,jsx}');
    var entryCssFiles=glob.sync(cssDir+'/*.{css,scss}');
	var entryImgFiles=glob.sync(imgDir+'/*.{svg,jpeg,jpg,png,gif,ico}');
    var compFiles = glob.sync(compDir+'/*.vue');
	
    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        map[filename] = filePath;
    }
	
    return map;
}

//html_webpack_plugins 定义
var html_plugins = function () {
    var entryHtml = glob.sync(srcDir + '/*.html')
    var r = []
    var entriesFiles = entries()
    for (var i = 0; i < entryHtml.length; i++) {
        var filePath = entryHtml[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        var conf = {
            template: 'html-loader!' + filePath,
            filename: filename + '.html'
        }
        //如果和入口js文件同名
        if (filename in entriesFiles) {
            conf.inject = 'body'
            conf.chunks = ['vendor', filename]
        }
        //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
        //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
        r.push(new HtmlWebpackPlugin(conf))
    }
    return r
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
        extractCSS = new ExtractTextPlugin('styles/style-master.css?[contenthash]');
        cssLoader = extractCSS.extract(['css-loader','postcss-loader']);
        sassLoader = extractCSS.extract(['css-loader','postcss-loader','sass-loader']);

        plugins.push(extractCSS)
		plugins.push(new webpack.HotModuleReplacementPlugin());//热替换
    }else{
        extractCSS = new ExtractTextPlugin('styles/[contenthash:8].[name].min.css', {
            // 当allChunks指定为false时，css loader必须指定怎么处理
            allChunks: false
        });
		
        cssLoader = extractCSS.extract(['css-loader','postcss-loader']);
        sassLoader = extractCSS.extract(['css-loader', 'sass-loader','sass-loader']);

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
				uglifyOptions: {
					ie8: false,
                    ecma: 6,
					compress: {
						warnings: false
					},
					output: {
						comments: false
					},
					mangle: {
						reserved : ['$', 'exports', 'require']
					}
			    }
            }),
            new webpack.NoEmitOnErrorsPlugin()
        )
    }
	
	var config={
		//devtool: 'eval-source-map',
		context: path.resolve(__dirname, 'src/'),
		entry: Object.assign(entries(), {
            // 用到什么公共lib（例如jquery.js），就把它加进vendor去，目的是将公用库单独提取打包
            'vendor': ['jquery']
        }),
		output: {
			filename: 'scripts/[name].js',
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
				loader: sassLoader
			},
			{
				test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
				use:[
				{
					loader: 'file-loader',
					options: {
						name: 'img/[name][ext]?[hash:8]',
						//outputPath:path.resolve(__dirname, "dist/img")
					}
				},
				/*{
				   loader:'url-loader',
				   options:{
					  limit:10000,//小于10KB的图片会自动转成dataUrl
                      name:'dist/img/[name].[ext]?[hash:8]'					  
				   }			
				},*/
				{
					loader:'image-webpack-loader',
					options:{
						gifsicle: {
						    interlaced: false,
					    },
					    optipng: {
						    optimizationLevel: 7,
					    },
					    pngquant: {
							quality: '65-85',
							speed: 4
					    },
					    mozjpeg: {
							bypassOnDebug:true,
							progressive: true,
							quality: 65
					    }				
					}
				}
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
            alias: pathMap,
			extensions: ['.js', '.css', '.scss', '.tpl', '.png', '.jpg']
		},
		plugins: plugins.concat(html_plugins()),
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