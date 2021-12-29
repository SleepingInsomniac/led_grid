let leds = [];
let currentColor = [0,0,0];
let colors = [];
let state = {
  mousedown: false
};
let divs = [];

function leftPad(str, i, char = ' ') {
  while (str.length < i) { str = char + str; }
  return str;
}

function setColor() {
  let red = document.getElementById('red');
  let grn = document.getElementById('grn');
  let blu = document.getElementById('blu');

  currentColor[0] = parseInt(red.value);
  currentColor[1] = parseInt(grn.value);
  currentColor[2] = parseInt(blu.value);

  document.getElementById('exampleColor').style.backgroundColor = `rgb(${currentColor.join(',')})`;
}

function setValue(value) {
  let red = document.getElementById('red');
  let grn = document.getElementById('grn');
  let blu = document.getElementById('blu');

  if (value.match(/[a-z\d]{6}/i)) {
    let r = parseInt(value.substring(0, 2), 16);
    let g = parseInt(value.substring(2, 4), 16);
    let b = parseInt(value.substring(4, 6), 16);

    red.value = r;
    grn.value = g;
    blu.value = b;
  }
  setColor();
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

function setColorText() {
  document.getElementById('colorText').value = currentColor.map(c => leftPad(c.toString(16), 2, '0')).join('');
}

window.addEventListener('DOMContentLoaded', function() {
  let ledsContainer = document.getElementById('ledsContainer');

  let red = document.getElementById('red');
  let grn = document.getElementById('grn');
  let blu = document.getElementById('blu');

  red.addEventListener('change', e => {
    setColor();
    setColorText();
  });
  grn.addEventListener('change', e => {
    setColor();
    setColorText();
  });
  blu.addEventListener('change', e => {
    setColor();
    setColorText();
  });

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

  document.getElementById('clear').addEventListener('click', e => {
    divs.forEach(d => {
      d.style.backgroundColor = `rgb(0,0,0)`;
    });

    colors.forEach(c => {
      c[0] = 0;
      c[1] = 0;
      c[2] = 0;
    });
    // update();
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
    // update();
  });

  document.getElementById('save').addEventListener('click', (e) => {
    let canvas = document.createElement('canvas');
    let target = document.getElementById('frames');
    target.append(canvas);
    canvas.setAttribute('data-json', JSON.stringify(colors));
    canvas.width = '32';
    canvas.height = '32';
    canvas.style.width = '32px';
    canvas.style.height = '32px';
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,32,32);

    let scale = 2;

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = `rgb(${colors[y * 16 + x].join(',')})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    canvas.onclick = function(e) {
      colors = JSON.parse(e.target.getAttribute('data-json'));
      let leds = document.getElementById('ledsContainer').children;
      for (let y = 0; y < 16; y++) {
        let row = document.getElementById('ledsContainer').children[y];
        for (let x = 0; x < 16; x++) {
          let cell = row.children[x];
          let i = y * 16 + x;
          cell.style.backgroundColor = `rgb(${colors[i].join(',')})`;
        }
      }
    };
  });

  document.getElementById('colorText').addEventListener('keyup', (e) => {
    setValue(document.getElementById('colorText').value);
  });
});
