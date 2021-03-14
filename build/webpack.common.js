const {
  template
} = require('lodash');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //作用：htmlWebpackPlugin插件会在打包结束后，自动生成一个html文件，并把打包生成的js自动引入到这个html文件中(打包后运行)
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin'); //作用：每次打包的时候先清空dist目录(打包前执行)
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {
  merge
} = require('webpack-merge');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const devConfig = require('./webpack.dev.js');
const prodConfig = require('./webpack.prod.js');

const plugins = [
  new HtmlWebpackPlugin({
    title: 'Output Management',
    template: 'src/index.html' //接收一个模版文件
  }),
  new CleanWebpackPlugin({
    // root: path.resolve(__dirname, '../'), //指定根路径
    cleanStaleWebpackAssets: false
  }), //防止watch 触发增量构建后删除 index.html 文件
  new webpack.ProvidePlugin({
    $: 'jquery' //如果在模块代码中发现有$这个字符串，就会自动引入jquery，然后把jquery赋值给$变量
  }),
  new BundleAnalyzerPlugin() //可视化打包分析插件
]

const files = fs.readdirSync(path.resolve(__dirname, '../dll')); //遍历dll文件夹下的内容
files.forEach(file => {
  if (/.*\.dll.js/.test(file)) {
    plugins.push(
      new AddAssetHtmlWebpackPlugin({ //把vendors.dll.js文件添加(挂载)到html引入文件里面去
        filepath: path.resolve(__dirname, '../dll', file)
      }))
  }
  if (/.*\.manifest.json/.test(file)) {
    plugins.push(
      new webpack.DllReferencePlugin({
        manifest: path.resolve(__dirname, '../dll', file)
      }))
  }
})

const commonConfig = {
  entry: {
    main: './src/index.js', //等价于直接写字符串，打包生成的名称为默认为main.js
    // sub: './src/index.js'
  },
  resolve: {
    extensions: ['.js', '.jsx '],
    mainFiles: ['index']
  },
  module: { //不同文件模块打包方式
    rules: [{
        test: /\.m?jsx?$/,
        exclude: /node_modules/, //如果文件处于node_modules里，则不使用此规则(exclude：排除在外)
        // include: path.resolve(__dirname, '../src'), //只翻译src目录里面的js文件
        use: [{
            loader: "babel-loader" //语法解析工具
            // options: {
            //   // presets: [
            //   //   ['@babel/preset-env', {
            //   //     "targets": { //根据浏览器版本判断是否有必要去做ES6转ES5
            //   //       "edge": "17",
            //   //       "firefox": "60",
            //   //       "chrome": "67", //项目会运行在版本号大于67的chrome浏览器，对于这个版本以上的浏览器，则不需要进行转移和填充
            //   //       "safari": "11.1"
            //   //     },
            //   //     useBuiltIns: 'usage' //当做 @babel/polyfill填充时，只针对业务代码用到的语法进行翻译 使用usage时，会自动import @babel/polyfill
            //   //   }]
            //   // ] //用于语法转换，但是只能转换一部分
            //   //下面的代码已转移到.babelrc
            //   "plugins": [ //为了不污染全局环境，写类库的时候使用plugins @babel/plugin-transform-runtime会更优
            //     ["@babel/plugin-transform-runtime"], {
            //       "absoluteRuntime": false,
            //       "corejs": 2,
            //       "helpers": true,
            //       "regenerator": true,
            //       "version": "7.0.0-beta.0"
            //     }
            //   ]
            // }
          },
          // {
          // 	loader: "imports-loader?this=>window"
          // }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/, //匹配文件规则
        use: {
          //url-loader与file-loader功能差不多
          loader: 'url-loader',
          options: {
            //placeholder 占位符
            name: '[name].[ext]',
            outputPath: 'images/',
            limit: 2048 //如果图片大小小于过2048字节(200kb)的话，就把图片转换为base64注入到js里，减少http请求。否则就生成一个新的图片文件。
          }
        }
      },
      {
        test: /\.(eot|ttf|svg|woff|woff2)$/, //匹配文件规则
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'font/'
          }
        }
      },
      { //用于处理CSV、TSV后缀的数据文件
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
      },
      { //处理XML后缀文件
        test: /\.xml$/i,
        use: ['xml-loader'],
      }
    ]
  },
  output: {
    // publicPath: 'http://cdn.com.cn', //给打包后生成的js文件添加一个路径（常用场景为当将资源托管到 CDN 时。）
    publicPath: '/',
    // filename: 'bundle.js', //打包后的文件名，如不指定则以entry指定生成为准，默认为main.js
    path: path.resolve(__dirname, '../dist') //打包后的存放位置
  },
  optimization: {
    //mode为development时才需要该配置项usedExports，记得还需要在package.json里配置sideEffects，把必须使用到的模块用数组的形式列出，不然就会被tree shaking机制剔除掉
    usedExports: true, //哪些模块被使用了，再打包
    splitChunks: { //我要去做代码分割了，webpack会自动帮我们做分割
      chunks: 'all', //async只对异步引入的代码做分割，all则是对同步异步引入的都做代码分割
      minSize: 20000, //大于20kb就进行分割
      minRemainingSize: 0,
      maxSize: 0,
      minChunks: 1, //只需引入一次都进行分割
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: { //缓存组，符合哪个组的要求，就分割到哪个组里面去
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/, //如果发现这个库是在node_modules里的话，就把这个库分割
          priority: -10, //优先级，当同时满足N个组的条件时，值越大优先级越高
          reuseExistingChunk: true,
          // filename: 'vendors.js'
        },
        default: {
          minChunks: 2, //至少引用了两次
          priority: -20,
          reuseExistingChunk: true, //如果一个模块已经被打包过了，如果再出现，则忽略
          // filename: 'common.js'
        }
      }
    }
  },
  plugins //实例化插件
}

module.exports = (production) => {
  if (production) { //线上环境
    return merge(commonConfig, prodConfig)
  } else {
    return merge(commonConfig, devConfig)
  }
}
