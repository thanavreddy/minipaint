const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSizeSlider = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveBtn = document.getElementById('saveBtn');

let drawing = false;
let currentColor = colorPicker.value;
let brushSize = brushSizeSlider.value;
let undoStack = [];
let redoStack = [];

function resizeCanvas() {
  // Save canvas state before resizing
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.putImageData(image, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing events
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseout', stopDraw);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchend', stopDraw);
canvas.addEventListener('touchcancel', stopDraw);
canvas.addEventListener('touchmove', draw, { passive: false });

// Controls
colorPicker.addEventListener('input', e => currentColor = e.target.value);
brushSizeSlider.addEventListener('input', e => brushSize = e.target.value);

clearBtn.addEventListener('click', () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Drawing logic
function getPosition(e) {
  return e.touches ? {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  } : {
    x: e.clientX,
    y: e.clientY
  };
}

function startDraw(e) {
  saveState();
  drawing = true;
  const pos = getPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function stopDraw() {
  drawing = false;
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPosition(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// Undo/Redo logic
function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(canvas.toDataURL());
  const previous = undoStack.pop();
  loadImage(previous);
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(canvas.toDataURL());
  const next = redoStack.pop();
  loadImage(next);
}

function loadImage(dataUrl) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}
