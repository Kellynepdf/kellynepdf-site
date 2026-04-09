<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PDF & Image Compressor + KB → MB Converter</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js"></script>
  <style>
    body { font-family: Inter, sans-serif; background: linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%); }
    .main-card { transition: all .3s ease-in-out; }
    #drop-zone { transition: all .2s ease-in-out; }
    #drop-zone.dragover { border-color:#3b82f6; transform:scale(1.03); box-shadow:0 4px 6px rgba(0,0,0,0.1); }
    .loader { border-top-color:#3498db; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tab-button.active { border-bottom-color:#3b82f6; color:#3b82f6; }
    .controls-panel { display:none; }
    .controls-panel.active { display:block; }
    #preview-canvas { max-width:100%; height:auto; border-radius:0.5rem; }
  </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">

<div class="main-card bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-full">
  <div class="text-center mb-6">
    <h1 class="text-3xl font-bold text-gray-800">File Compressor & Editor</h1>
    <p class="text-gray-500 mt-2">Compress PDFs, edit images (rotate/reset) and convert KB → MB.</p>
  </div>

  <!-- Drop Zone -->
  <div id="drop-zone" class="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 mb-6">
    <div id="placeholder-view" class="text-center">
      <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
      <p id="drop-text" class="mt-2 text-gray-500">Drag & drop a PDF or Image here, or click to select</p>
      <p id="file-info" class="text-sm font-medium text-blue-600"></p>
    </div>
    <div id="preview-view" class="hidden">
      <canvas id="preview-canvas"></canvas>
    </div>
  </div>
  <input type="file" id="file-input" class="hidden" accept=".pdf,image/*">

  <!-- Tabs -->
  <div class="border-b border-gray-200 mb-4">
    <nav class="flex space-x-4" aria-label="Tabs">
      <button class="tab-button py-2 px-1 border-b-2 border-transparent text-gray-500" data-target="controls-pdf">PDF Compressor</button>
      <button class="tab-button py-2 px-1 border-b-2 border-transparent text-gray-500" data-target="controls-image">Image Editor</button>
      <button class="tab-button py-2 px-1 border-b-2 border-transparent text-gray-500" data-target="controls-converter">KB → MB Converter</button>
    </nav>
  </div>

  <!-- PDF Controls -->
  <div id="controls-pdf" class="controls-panel space-y-4">
    <label class="block text-sm font-medium text-gray-700">Compression Quality</label>
    <select id="pdf-quality" class="w-full p-2 border border-gray-300 rounded-md">
      <option value="72">Low (Screen)</option>
      <option value="150" selected>Medium (eBook)</option>
      <option value="300">High (Print)</option>
    </select>
  </div>

  <!-- Image Controls -->
  <div id="controls-image" class="controls-panel space-y-4">
    <label class="block text-sm font-medium text-gray-700">Quality: <span id="quality-value">92</span>%</label>
    <input id="image-quality" type="range" min="1" max="100" value="92" class="w-full h-2 bg-gray-200 rounded-lg">
    <div class="flex justify-around mt-4">
      <button id="rotate-left" class="bg-gray-200 px-3 py-2 rounded">Rotate Left</button>
      <button id="rotate-right" class="bg-gray-200 px-3 py-2 rounded">Rotate Right</button>
      <button id="reset-image" class="bg-gray-200 px-3 py-2 rounded">Reset</button>
    </div>
  </div>

  <!-- Converter Controls (KB -> MB only) -->
  <div id="controls-converter" class="controls-panel space-y-4">
    <label class="block text-sm font-medium text-gray-700">KB → MB Converter</label>
    <input id="convert-input" type="number" step="any" placeholder="Enter value in KB (e.g., 2048)" class="w-full p-2 border border-gray-300 rounded-md">
    <button id="convert-button" class="w-full bg-blue-600 text-white py-2 px-4 rounded">Convert KB → MB</button>
    <p id="convert-result" class="text-center text-green-600 mt-2"></p>
  </div>

  <!-- Action Button -->
  <div class="mt-8">
    <button id="process-button" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 flex items-center justify-center" disabled>
      <span id="button-text">Select a file</span>
      <div id="loader" class="loader w-5 h-5 rounded-full border-2 border-white border-t-blue-500 ml-2 hidden"></div>
    </button>
  </div>

  <div id="status" class="mt-6 text-center"></div>
</div>

<script>
  // pdf.js worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }
  const { PDFDocument } = window.PDFLib || {};

  // DOM refs
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const processButton = document.getElementById('process-button');
  const buttonText = document.getElementById('button-text');
  const loader = document.getElementById('loader');
  const statusDiv = document.getElementById('status');
  const dropText = document.getElementById('drop-text');
  const fileInfo = document.getElementById('file-info');
  const placeholderView = document.getElementById('placeholder-view');
  const previewView = document.getElementById('preview-view');
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');

  const convertInput = document.getElementById('convert-input');
  const convertButton = document.getElementById('convert-button');
  const convertResult = document.getElementById('convert-result');

  let currentFile = null;
  let currentMode = null; // 'image' or 'pdf'
  let imageObject = null;
  let rotation = 0;
  let originalImage = null;

  // Utility: format file size (nice)
  function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
  }

  // Tabs: clickable to switch panels
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target; // e.g., "controls-converter"
      const mode = target.split('-')[1]; // 'converter' or 'image' or 'pdf'
      // set active class on tabs
      document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // show/hide panels
      document.querySelectorAll('.controls-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id.includes(mode));
      });
    });
  });

  // file input / drag & drop
  dropZone.addEventListener('click', () => fileInput.click());
  ['dragenter','dragover','dragleave','drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); });
  });
  dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    dropZone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  function handleFile(file) {
    if (!file) return;
    currentFile = file;
    const mime = file.type || '';
    const type = mime.startsWith('image/') ? 'image' : (mime === 'application/pdf' ? 'pdf' : null);
    if (!type) {
      alert('Only PDF or Image allowed.');
      return;
    }
    currentMode = type;
    processButton.disabled = false;
    buttonText.textContent = `Process ${type.toUpperCase()}`;
    dropText.textContent = 'File selected:';
    fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;

    if (type === 'image') {
      imageObject = new Image();
      imageObject.onload = () => {
        originalImage = { width: imageObject.naturalWidth, height: imageObject.naturalHeight };
        rotation = 0;
        drawImage();
      };
      imageObject.src = URL.createObjectURL(file);
      placeholderView.classList.add('hidden');
      previewView.classList.remove('hidden');
      // auto-switch to image tab
      document.querySelector('.tab-button[data-target="controls-image"]').click();
    } else {
      // pdf selected
      placeholderView.classList.remove('hidden');
      previewView.classList.add('hidden');
      document.querySelector('.tab-button[data-target="controls-pdf"]').click();
    }
  }

  // Image controls
  document.getElementById('rotate-left').addEventListener('click', () => { rotation = (rotation - 90) % 360; drawImage(); });
  document.getElementById('rotate-right').addEventListener('click', () => { rotation = (rotation + 90) % 360; drawImage(); });
  document.getElementById('reset-image').addEventListener('click', () => { rotation = 0; drawImage(); });

  function drawImage() {
    if (!imageObject) return;
    const w = imageObject.naturalWidth;
    const h = imageObject.naturalHeight;
    const rotated = Math.abs(rotation) % 180 !== 0;
    canvas.width = rotated ? h : w;
    canvas.height = rotated ? w : h;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(imageObject, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Process button (compress image or pdf)
  processButton.addEventListener('click', async () => {
    if (!currentFile) return;
    loader.classList.remove('hidden');
    processButton.disabled = true;
    statusDiv.innerHTML = '';
    try {
      if (currentMode === 'image') {
        await processImage();
      } else if (currentMode === 'pdf') {
        await processPdf();
      }
    } catch (err) {
      statusDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    } finally {
      loader.classList.add('hidden');
      processButton.disabled = false;
      buttonText.textContent = `Process ${currentMode ? currentMode.toUpperCase() : ''}`;
    }
  });

  // Image compression (uses canvas.toBlob)
  async function processImage() {
    const q = parseFloat(document.getElementById('image-quality').value) / 100;
    // Apply current canvas content (already reflects rotation)
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      statusDiv.innerHTML = `
        <p class="text-green-600">Image compressed!</p>
        <p class="text-sm text-gray-600">Original: ${formatFileSize(currentFile.size)}, New: ${formatFileSize(blob.size)}</p>
        <a href="${url}" download="compressed-${currentFile.name}" class="mt-2 inline-block bg-green-500 text-white py-2 px-4 rounded">Download Image</a>`;
    }, 'image/jpeg', q);
  }

  // PDF compression: render each page to JPEG and rebuild
  async function processPdf() {
    if (!window.pdfjsLib) throw new Error('pdf.js not loaded');
    const dpi = parseInt(document.getElementById('pdf-quality').value, 10) || 150;
    const scale = dpi / 96;
    const arrayBuffer = await currentFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      statusDiv.innerHTML = `<p class="text-blue-600">Processing page ${i} / ${pdf.numPages}...</p>`;
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const tmp = document.createElement('canvas');
      tmp.width = Math.round(viewport.width);
      tmp.height = Math.round(viewport.height);
      const ctxTmp = tmp.getContext('2d');
      await page.render({ canvasContext: ctxTmp, viewport }).promise;
      const dataUrl = tmp.toDataURL('image/jpeg', 0.75);
      const imgBytes = await (await fetch(dataUrl)).arrayBuffer();
      const img = await newDoc.embedJpg(imgBytes);
      const p = newDoc.addPage([viewport.width, viewport.height]);
      p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    statusDiv.innerHTML = `
      <p class="text-green-600">PDF compressed!</p>
      <p class="text-sm text-gray-600">Original: ${formatFileSize(currentFile.size)}, New: ${formatFileSize(blob.size)}</p>
      <a href="${url}" download="compressed-${currentFile.name}" class="mt-2 inline-block bg-green-500 text-white py-2 px-4 rounded">Download PDF</a>`;
  }

  // ====== KB -> MB converter (fixed) ======
  function convertKbToMb() {
    const raw = convertInput.value.trim();
    if (raw === '') {
      convertResult.textContent = 'Please enter a number (KB).';
      convertResult.style.color = 'red';
      return;
    }
    const kb = parseFloat(raw);
    if (isNaN(kb) || !isFinite(kb)) {
      convertResult.textContent = 'Enter a valid numeric value.';
      convertResult.style.color = 'red';
      return;
    }
    const mb = kb / 1024;
    convertResult.style.color = 'green';
    convertResult.textContent = `${kb} KB = ${mb.toFixed(3)} MB`;
  }

  // Button + Enter key support
  convertButton.addEventListener('click', convertKbToMb);
  convertInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') convertKbToMb(); });

  // Auto-select converter tab at load (optional)
  document.querySelector('.tab-button[data-target="controls-converter"]').click();
</script>

</body>
</html>