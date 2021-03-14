const {
  template
} = require('lodash');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //作用：htmlWebpackPlugin插件会在打包结束后，自动生成一个html文件，并把打包生成的js自动引入到这个html文件中(打包后运行)
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin'); //作用：每次打包的时候先清空dist目录(打包前执行)
const webpack = require('webpack');

// plugins 可以在webpack运行到某个时刻的时候，帮你做一些事情
// sourceMap 假设在知道dist目录下main.js的某一行出了错，sourceMap是一个映射关系，它知道dist目录下的js报错相对应的是src目录下的js某一行

module.exports = {
  mode: 'development', //development开发者环境不压缩 production 生产环境
  // 开发环境中，可以用 eval-cheap-module-source-map 这样的提示会比较全面，且打包速度快
  // 生产环境中，可以用 cheap-module-source-map 
  devtool: 'eval-cheap-module-source-map', //none或(source-map或eval) 是否开启映射 开启状态下，因为需要构建映射关系，打包速度会变慢 source-map会生成.map文件，而inline-source-map则把生成.map以base64的方式整合到main.js的底部 cheap-inline-source-map：加上cheap表示只提示错误在第几行，不用提示第几列，且加上以后只会处理业务代码的映射，不会处理其余module插件，除非加上module- 而eval则是打包效率最高的方法
  // entry: './src/index.js', //需要打包的文件(入口文件)
  entry: {
    main: './src/index.js', //等价于直接写字符串，打包生成的名称为默认为main.js
    // sub: './src/index.js'
  },
  //WebpackDevServer提供了一个简单的 web server，并且具有 live reloading(实时重新加载) 功能
  devServer: {
    overlay: true,
    contentBase: './dist', //服务器要启动在哪个文件夹下
    // open: true //自动打开浏览器，自动访问服务器地址 也可在运行指令是添加--open
    // proxy: { //配置跨域代理
    //   '/api': 'http://localhost:3000'
    // },
    port: 8080, //端口号
    hot: true, //开启Hot Module Replacement功能，用于检测到代码变动时，不需要重新加载页面
    hotOnly: true, //开启状态时，即使HMR出了问题，也不要帮我重刷，就让它报错就好
    historyApiFallback: true, //针对单页应用，只在开发环境中有效
    proxy: {
      '/react/api': { //用户如果请求了含有该路径的地址，会从target指向的服务器上去拿数据，且遵循一个规则，取demo.json下的数据即可
        target: 'http://www.dell-lee.com', //代理地址
        secure: false, //如果请求地址是https的话，还需要额外配置这一项，才能实现转发
        bypass: function (req, res, proxyOptions) {
          if (req.headers.accept.indexOf('html') !== -1) { //拦截器，如果请求的链接含有html，则跳过这次转发，直接返回本项目根目录下的.html文件
            console.log('Skipping proxy for browser request');
            return '/index.html';
          }
        },
        pathRewrite: { //路径重写
          'header.json': 'demo.json'
        },
        changeOrigin: true, //突破orgin限制
        headers: { //模拟请求头
          // host: 'www.tom-chen.cn'
        }
      }
    }
  },
  module: { //不同文件模块打包方式
    rules: [{
        test: /\.m?js$/,
        exclude: /node_modules/, //如果文件处于node_modules里，则不使用此规则(exclude：排除在外)
        // use: {
        // loader: "babel-loader" //语法解析工具
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
        // }
        use: ['babel-loader', {
          loader: 'eslint-loader',
          options: {
            fix: true //浅显问题自动修复
          },
          force: 'pre' //虽然看起来后执行，force强制，pre首先执行
        }] //ES6转译语法及语法检测插件，先检测语法，再进行转译，但eslint会减慢webpack打包速度
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
          loader: 'file-loader'
        }
      },
      {
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
    filename: '[name].js', //跟随entry指定的打包名字
    path: path.resolve(__dirname, 'dist') //打包后的存放位置
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
      template: 'src/index.html' //接收一个模版文件
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }), //防止watch 触发增量构建后删除 index.html 文件
    new webpack.HotModuleReplacementPlugin()
  ], //实例化插件
  optimization: { //mode为development时才需要该配置项，记得还需要在package.json里配置sideEffects，把必须使用到的模块用数组的形式列出，不然就会被tree shaking机制剔除掉
    usedExports: true //哪些模块被使用了，再打包
  }
};