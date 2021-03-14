// const {
// 	merge
// } = require('webpack-merge');
// const commonConfig = require('./webpack.common.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); //压缩输出的CSS文件
const WorkboxPlugin = require('workbox-webpack-plugin'); //PWA 用于处理当服务器当机时，页面依然可以以缓存的形式展现出来

const prodConfig = {
	mode: 'production',
	devtool: 'cheap-module-source-map',
	module: {
		rules: [{
			test: /\.s?css$/,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: 'css-loader',
					options: {
						importLoaders: 2, //通过import引入的scss文件在引入之前也要去走下面2个loader，主要针对scss文件里引入另一个scss文件的情况
						modules: true //模块化css，开启css的模块化打包，用于让引入的css文件只作用于当前文件
					}
				}, //整合所有css代码及其引入的模块
				'sass-loader', //把sass代码翻译为css
				'postcss-loader' //用于调用autoprefixer插件自动添加厂商前缀，如-webkit- -moz- -o-等用于不同浏览器适配
			],
		}]
	},
	output: {
		filename: '[name].[contenthash].js', //跟随entry指定的打包名字
		chunkFilename: '[name].[contenthash].chunk.js', //除了入口文件外的其他chunk js文件都会输出为这种格
	},
	optimization: {
		minimizer: [
			new CssMinimizerPlugin()
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].chunk.css',
		}),
		new WorkboxPlugin.GenerateSW({
			clientsClaim: true,
			skipWaiting: true
		})
	]
};

// module.exports = merge(commonConfig, prodConfig)
module.exports = prodConfig