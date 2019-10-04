#! /usr/local/bin/node

// 1. 找到配置文件

const path = require('path');

const config = require(path.resolve('webpack.config.js'));

const Compiler = require('../lib/Compiler.js');
const compiler = new Compiler(config);
compiler.hooks.entryOption.call();

compiler.run();