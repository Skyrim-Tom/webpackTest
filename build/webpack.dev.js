const webpack = require('webpack');
// const {
// 	merge
// } = require('webpack-merge');
// const commonConfig = require('./webpack.common.js')

const devConfig = {
	mode: 'development',
	devtool: 'eval-cheap-module-source-map',
	devServer: {
		contentBase: './dist', //服务器要启动在哪个文件夹下
		port: 8080, //端口号
		hot: true, //开启Hot Module Replacement功能，用于检测到代码变动时，不需要重新加载页面
		hotOnly: true //开启状态时，即使HMR出了问题，也不要帮我重刷，就让它报错就好
	},
	module: {
		rules: [{
			test: /\.s?css$/,
			//针对css文件需要使用到2个loader，故use使用数组类型
			//针对scss文件需要用到3个loader，且执行优先顺序从右到左，从下往上
			use: [
				'style-loader', //把css样式挂载到<head>
				{
					loader: 'css-loader',
					options: {
						importLoaders: 2, //通过import引入的scss文件在引入之前也要去走下面2个loader，主要针对scss文件里引入另一个scss文件的情况
						modules: true //模块化css，开启css的模块化打包，用于让引入的css文件只作用于当前文件
					}
				}, //整合所有css代码及其引入的模块
				'sass-loader', //把sass代码翻译为css
				'postcss-loader' //用于调用autoprefixer插件自动添加厂商前缀，如-webkit- -moz- -o-等用于不同浏览器适配
			]
		}]
	},
	output: {
		filename: '[name].js', //跟随entry指定的打包名字
		chunkFilename: '[name].chunk.js', //除了入口文件外的其他chunk js文件都会输出为这种格
	},
	plugins: [new webpack.HotModuleReplacementPlugin()] //实例化插件
}

// module.exports = merge(commonConfig, devConfig)
module.exports = devConfig