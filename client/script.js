let leds = [];
let currentColor = [0,0,0];
let colors = [];
let state = {
  mousedown: false
};
let divs = [];

function setColor() {
  let red = document.getElementById('red');
  let grn = document.getElementById('grn');
  let blu = document.getElementById('blu');

  currentColor[0] = red.value;
  currentColor[1] = grn.value;
  currentColor[2] = blu.value;

  document.getElementById('exampleColor').style.backgroundColor = `rgb(${currentColor.join(',')})`;
}

function update() {
  const formData = new FormData();
  let data = colors.map(
    c => c.map(s => Number(s).toString(16).padStart(2, '0')).join('')
  ).join('').toUpperCase();

  formData.append('data', data);

  fetch("http://leds.local", {
    mode: 'no-cors',
    method: "post",
    body: formData
  }).then( (response) => {});
}

function setColer(div, color) {
  div.style.backgroundColor = `rgb(${color.join(',')})`;
  let index = divs.indexOf(div);
  colors[index][0] = color[0];
  colors[index][1] = color[1];
  colors[index][2] = color[2];
}

window.addEventListener('DOMContentLoaded', function() {
  let ledsContainer = document.getElementById('ledsContainer');

  let red = document.getElementById('red');
  let grn = document.getElementById('grn');
  let blu = document.getElementById('blu');

  red.addEventListener('change', setColor);
  grn.addEventListener('change', setColor);
  blu.addEventListener('change', setColor);

  window.addEventListener('mousedown', e => {
    state.mousedown = true;
  });

  window.addEventListener('mouseup', e => {
    state.mousedown = false;
  });

  for (let i = 0; i < 16; i++) {
    let divRow = document.createElement('div');
    divRow.className = 'led-row';

    for (let ii = 0; ii < 16; ii++) {
      let div = document.createElement('div');
      div.className = 'color-square';
      divRow.appendChild(div);

      colors[i * 16 + ii] = [0,0,0];

      div.addEventListener('mousedown', (e) => {
        e.target.style.backgroundColor = `rgb(${currentColor.join(',')})`;
        colors[i * 16 + ii][0] = currentColor[0];
        colors[i * 16 + ii][1] = currentColor[1];
        colors[i * 16 + ii][2] = currentColor[2];
      });

      div.addEventListener('mouseover', (e) => {
        if (state.mousedown) {
          e.target.style.backgroundColor = `rgb(${currentColor.join(',')})`;
          colors[i * 16 + ii][0] = currentColor[0];
          colors[i * 16 + ii][1] = currentColor[1];
          colors[i * 16 + ii][2] = currentColor[2];
        }
      });

      divs.push(div);
    }

    ledsContainer.appendChild(divRow)
  }

  document.getElementById('updater').addEventListener('click', (e) => {
    update();
  });

  document.getElementById('fill').addEventListener('click', e => {
    divs.forEach(d => {
      d.style.backgroundColor = `rgb(${currentColor.join(',')})`;
    });

    colors.forEach(c => {
      c[0] = currentColor[0];
      c[1] = currentColor[1];
      c[2] = currentColor[2];
    });
    update();
  });
});
