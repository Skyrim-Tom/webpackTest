const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware'); //中间件
const config = require('./webpack.config.js');
// 在node中直接使用webpack
const complier = webpack(config) //webpack编译器 作用：webpack函数传入配置文件后会返回一个编译器

const app = express(); //通过express创建一个服务器实例
app.use(webpackDevMiddleware(complier, {
    publicPath: config.output.publicPath
})) //只要文件发生改变，complier就会重新运行

app.listen(3000, () => { //监听3000端口号
    console.log('server is running.')
})