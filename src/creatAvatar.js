// const avatar = require('./WechatIMG4.jpeg')
import avatar from './Tom.jpeg';

function createAvatar() {
  const img = new Image();
  img.src = avatar;
  img.classList.add('avatar');

  const root = document.getElementById('root');
  root.append(img);
}

export default createAvatar;
