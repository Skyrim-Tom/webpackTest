// import _ from 'lodash'; //鲁大师，用于code splitting代码分割 已转移到lodash.js引入并挂载到全局
// import "@babel/polyfill"; //usage状态下自动引入，这里可以注释掉

// 第一种方式
// 首次访问页面时，加载main.js(2Mb)
// 当页面逻辑发生改变时，也需要重载main.js(2Mb)

// 第二种方式
// main.js被拆成 lodash.js(1Mb)，main.js(1Mb)
// 当页面业务逻辑发生改变时，只要加载main.js即可(1Mb)

import React, {
  Component,
} from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';

// Tree Shaking只支持 ES Module 的引入方式(静态引入)
// package.json里配置 "sideEffects": ["@babel/polyfill"], //Tree Shaking不会把这些给筛选掉

// import './index.scss' //相当于全局引入，会影响到所有样式
import style from './index.scss';
// import './index.scss'
import creatAvatar from './creatAvatar';
import avatar from './Tom.jpeg';
import './style.css';
import counter from './counter';
import number from './number';

/// ///////////// 以下是lodash.js转移过来的代码 ///////////////
// 以下这种是同步加载的代码
// import _ from 'lodash'; //鲁大师，用于code splitting代码分割
// window._ = _; //加载lodash然后挂载到全局的window上

// 以下为异步加载的代码
// function getComponent() {
//     return import( /* webpackChunkName:"lodash" */ 'lodash').then(({
//         default: _
//     }) => {
//         let element = document.createElement('div');
//         element.innerHTML = _.join(['Hellow', 'World'], '-'); //鲁大师字符串连接，数组为需要连接的字符串，数组后为连接符，可以理解为以空格来连接Hello World
//         return element
//     })
// }

// Lazy Loading 懒加载
async function getComponent() {
  const {
    default: _,
  } = await import(/* webpackChunkName:"lodash" */ 'lodash');
  const element = document.createElement('div');
  element.innerHTML = _.join(['Hellow', 'World', 'Tom'], '-');
  return element;
}

// getComponent().then(element => {
// 	document.body.appendChild(element)
// })

document.addEventListener('click', () => {
  getComponent().then((element) => {
    document.body.appendChild(element);
  });
});

// 代码分割和webpack无关
// webpack实现代码分割有两种方式：
// 1. 同步代码：只需要在webpack.common.js中做optimization配置即可
// 2. 异步代码(import)：异步代码无需做任何配置，会自动进行代码分割

/// ///////////// 以上是lodash.js转移过来的代码 ///////////////

const img = new Image();
img.src = avatar;
// img.classList.add('avatar')
img.classList.add(style.avatar); // 只有style里面的avater样式起作用

const root = document.getElementById('root');
// root.append(img);

const fontElement = document.createElement('div');
fontElement.classList.add(style.iconfont);
fontElement.classList.add(style.icon_weixin);
// root.append(fontElement)

const btn = document.createElement('button');
btn.innerHTML = '新增';
document.body.appendChild(btn);

btn.onclick = function () {
  const div = document.createElement('div');
  div.innerHTML = 'item';
  document.body.appendChild(div);
};

// creatAvatar();

counter();
number();

console.warn(this === window);

/// ///////// react语法 //////////
class App extends Component {
  componentDidMount() {
    axios.get('/react/api/header.json')
      .then((res) => {
        console.log(res);
      });
  }

  render() {
    return <div> Hellow World </div>;
  }
}

ReactDom.render(<App />, document.getElementById('root'));
/// ////////// react /////////////

// PWA
// 1. 在webpack.prod.js中安装WorkboxPlugin插件；
// 2. 配置插件参数；
// 3. 在业务代码中再应用serviceWorker帮我们做点事情。
if ('serviceWorker' in navigator) { // 如果浏览器支持serviceWorker，打开一次以后，就算服务器挂掉，刷新依然可以正常显示
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('service-worker registed');
    }).catch((error) => {
      console.error('service-worker register error');
    });
  });
}

if (module.hot) { // 如果当前项目开启了HMR功能，则执行
  module.hot.accept('./number', () => {
    // 当检测到number发生变化，则获取到该dom元素，并将其删除掉，再执行
    document.body.removeChild(document.getElementById('number'));
    number();
  });
}
