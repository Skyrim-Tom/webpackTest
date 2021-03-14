function counter() {
  const div = document.createElement('div');
  div.setAttribute('id', 'counter');
  div.innerHTML = 1;
  div.onclick = function () {
    div.innerHTML = parseInt(div.innerHTML, 10) + 1; // 以10进制的方式+1
  };
  document.body.appendChild(div);
}

export default counter;
