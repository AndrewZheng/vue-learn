## Introduce

This project show us how to build spa application with webpack &amp; gulp &amp; es6 &amp;vue/vuex. Let's get started!

## 参考链接

http://blog.codingplayboy.com/2017/05/31/webpack_spa_build_env/ 

## 搭建过程

#项目初始化

以你喜欢的任意方式，创建项目根目录，如：
mkdir vue-hello

#初始化包模块管理文件

进入项目根目录，初始化项目包模块管理文件package.json:
npm init 

命令台会提示你输入一堆信息，如果你想简单一点，可以添加-y参数，跳过输入步骤，生成默认信息：
npm init -y

#初始化源码目录

初始化项目package.json
在项目根目录下创建源码目录结构，通常源码目录是src或app，个人喜好是使用src:

#webpack/gulp/grunt对比和总结

webpack定位是一个模块化管理工具，而grunt/gulp都是自动化任务流程构建工具；
grunt基于二进制处理文件，gulp基于流式处理文件，效率比grunt更高一些；
webpack强大特性，使得其添加诸多插件可以替代grunt/gulp，但是目前的实践项目中，通常webpack结合gulp或grunt使用（各自处理各自专长的任务）；

#安装

首先安装webpack，npm或yarn都可以，无甚区别：
npm install --save-dev webpack

关于此处的--save和-dev参数做简要说明：
--save是声明将安装依赖添加入package.json文件;默认地，使用npm安装包模块依赖时，依赖关系存储在在"dependencies"属性对象内，表示项目依赖
-dev参数声明其是开发环境依赖；webpack是作为开发环境依赖的，不是作为源码直接调用,所以使用-dev参数

#webpack配置介绍

实践项目使用webpack完成自动化构建，本地服务调试与热加载，首先在根目录下创建webpack的配置入口文件webpack.config.js，基本内容结构如下:
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
如上，webpack配置文件使用module.exports方式导出配置对象，webpack执行时会默认读取项目根目录下webpack.config.js文件，当然可以手动配置指定一个文件作为配置文件，我们不讨论，可以参考webpack文档，接下来对webpack配置内容做简要介绍，如果你对webpack使用比较熟悉，可以跳过此节。

#文件处理配置

和webpack文件处理相关的几个配置属性主要有三个：目录上下文信息（context）, 处理文件入口信息（entry）, 文件输出信息（output）。

#目录上下文信息（context）

设置解析处理文件入口的相对目录，值为一个绝对目录路径，默认为当前执行目录，通常即项目根目录，在Node中其值与process.cwd()相同，如：
context: path.resolve(__dirname, 'src/'),
如上即解析为项目根目录下的src目录。

#处理文件入口信息（entry）

处理文件入口，值可以是字符串，或数组，或对象，值为字符串或数组时，即输出单文件，值为对象，可以输出多文件，输出文件名称等信息参考文件输出信息（output）。

#文件输出信息（output）

此配置声明webpack编译输出文件的文件名等信息，如:
filename: '[name].js',
声明文件名就是模块(chunk)名，对应在entry中定义的入口，你可能还见过[id],[hash],[chunkhash]这些用法，现做简单介绍：

-[id]：该值表示webpack编译模块（chunk）的id，通常是一个数字；
-[name]：该值表示webpack编译模块（chunk）名，对应entry中定义的入口名或文件名；
-[chunkhash]：该值表示webpack编译模块（chunk）hash值，根据模块内容计算出的一个md5值；
-[hash]：该值表示webapck编译对象hash值，根据编译对象计算出的md5值；
（编译对象，即webpack执行时读取配置后生成的一个编译配置对象，包含模块，待编译文件，相对于上次编译的变更文件等诸多信息，需要注意的是该对象在webpack启动读取配置文件后形成，在此次编译过程保持不变。）
-output.path：定义输出文件所在目录；
-output.publicPath：定义输出文件在浏览器访问时的基础相对路径，可以与后文webpack-dev-server一起使用。

#webpack加载器与模块

在介绍加载器配置之前，先看看加载器是什么：
Loaders are transformations that are applied on a resource file of your app. They are functions (running in node.js) that take the source of a resource file as the parameter and return the new source.
加载器是作用于应用资源文件的转换器，它们是一系列函数，接受资源文件的内容做参数，然后返回新的资源（以一个模块的形式返回）。

#webpack

webpack解析文件时使用的加载器都声明在module属性的loaders数组中，可以设置一个或多个加载器。

- module.noParse：指定某些文件不需要使用解析，支持传入文件路径或正则表达式；
- module.loaders：指定解析文件的加载器模块及各模块解析规则，可以设置以下属性：
- test: 待解析文件需匹配的规则，通常以文件后缀名称匹配文件；
- include：待解析文件所处目录；
- exclude: 过滤掉的目录；
- loader：加载器模块名称；
- loaders多个加载器；

#模块解析规则配置

webpack支持在resolve属性对象中配置模块解析规则，主要有root，modules, alias和extensions属性。

-resolve.root与resolve.modules
该属性设置的是在开发代码中使用require或import加载某模块时，webpack查找该模块所遵循的查找目录范围，如在源代码中存在：

var utils = require('utils/utils.js');
而root配置如下：
resolve: {
	root: [
		path.resolve('./src/'),
		'node_modules'
	]
}
	
webpack编译时将自动在项目根目录下的src目录内的utils目录下查找utils.js，若存在，则返回，否则进入node_modules目录内查找utils.js模块。

当然，若未设置resolve.root属性值，则webpack默认先从node_modules查找模块，然后在根目录下查找。
注意：resolve.root在webpack v1版本中使用，而在webpack v2 中，使用modules代替，建议使用v2版本，后文也将统一使用modules属性。

-resolve.alias
alias，有别名的意思，这里的作用是设置其他模块或路径的别名，webpack在解析模块时，将使用配置值替换该别名，如，在未设置alias属性内容时，即resolve.alias默认是空对象{}时，我们在代码中引用模块：

var Vue = require('vue/dist/vue.js');
var TopHeader = require('components/header.js');
webpack在编译代码时，按resolve.modules声明的顺序依次查找对应模块，如按照上一节定义的resolve.modules：
resolve: {
	root: [
		path.resolve('./src/'),
		'node_modules'
	]
}
查找模块时，将首先在src/vue/dist/目录下寻找vue模块，在src/components/目录下查找header.js模块，查找到后返回，否则进入node_modules目录查找。

现在，我们还可以通过resolve.alias为模块或路径声明一个别名，更方便的声明加载模块：
resolve: {
	alias: {
		'vue$': 'vue/dist/vue.js'
		components: path.resolve(__dirname, 'src/components/')
	}
}


我可以使用如下方式加载模块
var Vue = require('vue');
var TopHeader = require('components/header.js');
#$符号
关于alias的详细使用介绍，请参见文档，本文并不是要介绍webpack文档，在这里介绍一下声明的vue$别名中的$符号：

这里的$符合是正则的文末匹配符，即只有当vue是最后一级路径时，webpack才会将该值解析成别名，进行别名与对应值替换，如vue/test.js中的vue是不会当作别名解析的，而components/header.js中的components则会按照声明的components别名进行解析，其结果是src/components/header.js。

#resolve.extensions
该值定义解析模块时的查找文件的后缀顺序，如["", ".js", ".json"]，会优先返回js文件，其次json文件，然后是其他文件，注意，这里数组传入了一个空字符串，他的作用是在未找到配置中所有列举的类型文件时，支持webpack返回其他类型文件，但是webpack2.x版本修改了，不支持传入空字符。

#webpack插件配置

webpack还支持多种多样的插件拓展，你可以使用它们对你的项目webpack模块构建过程进行额外处理，如代码压缩，图片等资源提交压缩，构建异常捕获和提升，构建流程时间消耗比，等等，而关于这些插件使用的配置在plugins属性数组内，将在后续进行介绍。

#项目本地调试与开发
为了方便开发和调试，通常都需要在本地主机开启服务，提供局域网内多终端访问，并且在文件变更时，实时刷新页面，正如grunt和gulp中Browsersync插件提供的功能一样，webpack可以使用webpack-dev-server模块实现。

webpack-dev-server是一个Node.js的express服务器，以webpack开发中间件的形式为webpack包提供服务，当监听到源码文件变更时，会自动重新打包，并且支持配置自动刷新浏览器，重新加载资源。

#安装

由于该插件只用于开发模式，所以通过以下npm指令安装：
npm install webpack-dev-server --save-dev

#配置

启用webpack-dev-server时，其默认开启8080端口，访问localhost:8080返回当前目录下的index.html，即执行指令当前目录下的静态资源，当然可以通过指令传递参数或在配置文件进行配置指定静态资源目录。
另外需要注意的是，开启webpack-dev-server后，变更文件重新打包后，并不会实际输出到配置的output目录，而是在publicPath属性声明的相对路径所在的内存中读取。

#静态资源目录配置（CONTENT BASE）

webpack-dev-server --content-base src/
执行以上指令开启服务后，webpack-dev-server将默认在src/目录返回静态资源，当然也可以在webpack.config.js配置文件中指定：
devServer: {
	contentBase: './src'
}
访问http://localhost:8080和http://localhost:8080/index.html效果一样，均返回src目录下的index.html文件。

PUBLICPATH与输出文件访问
在前文webpack配置一节中提到output.publicPath属性值表示，在浏览器访问webpack output输出的文件时的基础相对路径，如设置：
output: {
	path: 'dist/scripts',
	filename: 'app.js',
	publicPath: 'assets/'
}
则在html文件中引用该app.js文件的方式如下：
<script src="assets/app.js"></script>
在浏览器中访问app.js的方式为：http://localhost:8080/assets/app.js

#自动刷新（AUTOMATIC REFRESH）
前面说到webpack-dev-server支持文件变更时，自动刷新浏览器，这也是开发者急需的功能，webpack-dev-server支持两种方式实现：

-iframe模式（iframe mode）：页面通过iframe窗口插入然后变更时自动重新加载；
-inline模式（inline mode）：通过sock.js(比如websocket协议，轮询等方式)在页面嵌入一个小型客户端与webpack-dev-server服务器建立连接，当发生变更重新打包时，通过此连接通知页面重新加载；

#iframe模式

使用默认的iframe模式时，不需要进行任何配置，可以直接访问：http://localhost:8080/webpack-dev-server/index.html即可，如图，通过iframe插入我们的页面：

#iframe模式（iframe mode)

注意：
在应用页面上方会有状态栏显示当前应用信息；
应用URL的变更发生在iframe内部，不会反映在浏览器地址栏；

#inline模式

要开启inline模式，只需要指定--inline命令行参数或在配置文件中指定inline: true：

devServer: {
	contentBase: './src',
	inline: true
}
在此模式下，直接访问http://localhost:8080/index.html或http://localhost:8080即可，此模式与iframe模式的区别在于:

访问URL不同；
需指定inline配置参数；
应用信息在控制台输出；
应用URL的变更直接反映在浏览器地址栏；
其实inline模式还可以配合Node.Js服务运行，之后再介绍，这里只说明了其在HTML文档中的使用。

#热替换（HOT MODULE REPLACEMENT）

除了自动刷新，webpack-dev-server的另一大卖点是模块热替换，那么热替换到底是什么？
热替换，即文件发生变更时，webpack包只替换发生变更的模块，而不需要全部替换；浏览器不需要完全重新加载，而可以直接将变更的模块注入到运行中的应用。
开启热替换功能需要指定--hot指令参数，或在配置文件中添加：

devServer: {
	contentBase: './src',
	inline: true,
	hot: true
}

注意到以上代码，热替换需要与inline模式一起使用，另外需要指定output.publicPath值。

HotModuleReplacementPlugin
配置好后还需要使用webpack.HotModuleReplacementPlugin插件，才能真正启用热替换功能：

plugins: [
	new webpack.HotModuleReplacementPlugin()
]
同样的，热替换可以搭配Node.js服务一起使用，之后介绍。
如图，为每个文件(app.js, test.js)都实现了HMR热替换，当发生变更时，只更新变更模块，而不是重新加载所有文件：

#拥抱ES6

ES6推出以来，广受Jser们青睐，其确实有很多新特性和新规范，值得我们深入学习并使用，可以参考ECMAScript 6入门，未来所有的JavaScript应用都应该拥抱ES6，不过，目前各大浏览器都在推进ES6的实现，在兼容实现之前，我们还需要过渡性的将其转换成ES5语法，最通用的方式就是使用babel转换。

#使用BABEL加载器

首先，为了能使用webpack和babel转换js代码，需要使用babel-loader加载器，另外还需要安装babel转换js的转换规则插件，如babel-preset-es2015定义了转换规则，安装方式如下：
npm install --save-dev babel-loader babel-preset-es2015

然后在根目录下创建.babelrc文件，内容：
{
	"presets": ["es2015"]
}

在webpack.config.js配置文件中，添加相关loader配置：

module: {
	loaders: [
		{
			test: /\.(js|vue)$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}
	]
}
其中，test匹配需要转换的文件，exclude匹配不需要转换的文件或目录。

#BABEL-POLYFILL

我们需要明白的一点是babel-preset-es2015能做的，只是转换ES6代码成ES5，使得浏览器可以解析执行，但是对于ES6新提出的API，如Promise，Generator等无法简单的转换成ES5代码，这时就需要babel-polyfill了，babel-polyfill是一个垫片，它可以模拟提供所有的ES6功能和特性，可以看作是提供了一个模拟的全局ES6环境。

-安装
安装依然很简单，由于是垫片，是需要在源码中使用的，所有指定--save参数：
npm install --save babel-polyfill

-使用
不同于babel-preset-es2015，babel-polyfill需要直接打包进源码，而且需要在使用ES6代码前引入一次：
import 'babel-polyfill'

只需要引入一次，因为该垫片提供的是一个模拟的全局ES6环境，而不是模块内部的。
或者直接在webpack.config.js中配置打包入口文件时加入该垫片：

entry: {
	app: ['babel-polyfill', './scripts/app.js']
},
现在你可以在你的代码中使用任何你想用的ES6 API了。

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2013-present, Andrew Zheng
