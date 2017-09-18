/**
 * Created by andrew on 2017/9/17.
 */
'use strict';

var gulp = require('gulp');
var webpack = require('webpack');

//用于gulp传递参数
var minimist = require('minimist');

var gutil = require('gulp-util');

var src = process.cwd() + '/src';
var assets = process.cwd() + '/dist';

var knownOptions = {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'production'}
};

var options = minimist(process.argv.slice(2), knownOptions);

var webpackConf = require('./webpack.config');
var webpackConfDev = require('./webpack-dev.config');
var webpackServer=require('webpack-dev-server');

var remoteServer = {
    host: '172.16.10.191',
    remotePath: '/www/tomcat/webapps/webpacktest',
    user: 'root',
    pass: 'fjKL32jKL132jKljK342L'
};

var localServer = webpackServer;

//check code
gulp.task('hint', function () {
    var jshint = require('gulp-jshint')
    var stylish = require('jshint-stylish')

    return gulp.src([
        '!' + src + '/scripts/lib/**/*.js',
        src + '/scripts/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
})

// clean assets
gulp.task('clean', ['hint'], function () {
    var clean = require('gulp-clean');
    return gulp.src(assets, {read: true}).pipe(clean())
});

//run webpack pack
gulp.task('pack', ['clean'], function (done) {
    var _conf = options.env === 'production' ? webpackConf : webpackConfDev;
    webpack(_conf, function (err, stats) {
        if (err) throw new gutil.PluginError('webpack', err)
        gutil.log('[webpack]', stats.toString({colors: true}))
        done()
    });
});

//default task
gulp.task('default', ['pack'])

//deploy assets to remote server
gulp.task('deploy', function () {
    var sftp = require('gulp-sftp');
    var _conf = options.env === 'production' ? remoteServer : localServer;
    return gulp.src(assets + '/**')
        .pipe(sftp(_conf))
})