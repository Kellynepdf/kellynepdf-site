/**
 * js/esign-pdf/digital-sign.js
 * Advanced Digital Sign & Stamp Master - Modal Viewer Edition
 */

window.runDigitalSign = async function(files) {
    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const dropZone = document.getElementById('drop-zone');

    // 1. PDF PROCESSING ENGINE
    const handleFile = async (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            statusLabel.innerHTML = `<span style="color:#e5322d; font-weight:bold;">ERROR: ONLY PDF FILES SUPPORTED</span>`;
            return;
        }

        try {
            statusLabel.innerText = "OPENING SECURE VIEWER...";
            const buffer = await file.arrayBuffer();
            window.originalPdfBuffer = buffer; 

            const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
            if (!pdfjsLib) throw new Error("PDF.js library not found");
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const loadingTask = pdfjsLib.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.id = 'pdf-render-canvas';
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // 2. OPEN FULLSCREEN MODAL VIEWER
            showViewerModal(canvas, viewport);

            statusLabel.innerText = "PDF LOADED IN VIEWER";
            statusLabel.style.color = "#008000";

        } catch (err) {
            console.error(err);
            statusLabel.innerText = "ERROR LOADING PDF. PLEASE REFRESH.";
        }
    };

    function showViewerModal(canvas, viewport) {
        // Remove any existing viewer
        const old = document.getElementById('esign-viewer-modal');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.id = 'esign-viewer-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #f0f0f0; z-index: 10000; overflow: auto;
            display: flex; flex-direction: column; align-items: center;
            padding: 40px 0; font-family: 'Inter', sans-serif;
        `;

        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            position: sticky; top: 0; width: 100%; background: #111; color: #fff;
            padding: 15px 40px; display: flex; justify-content: space-between;
            align-items: center; z-index: 10001; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        `;
        toolbar.innerHTML = `
            <div style="font-weight:900; font-size:18px;">KELLYNEPDF <span style="font-weight:400; font-size:14px; opacity:0.7;">| SIGN DOCUMENT</span></div>
            <div style="display:flex; gap:15px;">
                <button id="add-signature-btn" style="background:#e5322d; color:#fff; border:none; padding:10px 25px; border-radius:50px; font-weight:700; cursor:pointer;">+ ADD SIGNATURE / STAMP</button>
                <button id="finish-btn" style="background:#008000; color:#fff; border:none; padding:10px 25px; border-radius:50px; font-weight:700; cursor:pointer;">APPLY & DOWNLOAD</button>
                <button id="close-viewer" style="background:transparent; color:#fff; border:1px solid #fff; padding:10px 20px; border-radius:50px; cursor:pointer;">CANCEL</button>
            </div>
        `;

        const viewerContainer = document.createElement('div');
        viewerContainer.id = 'esign-viewer-container';
        viewerContainer.style.cssText = `
            position: relative;
            background: #fff;
            box-shadow: 0 10px 50px rgba(0,0,0,0.1);
            margin-bottom: 50px;
            width: ${viewport.width}px;
            height: ${viewport.height}px;
        `;
        viewerContainer.appendChild(canvas);

        modal.appendChild(toolbar);
        modal.appendChild(viewerContainer);
        document.body.appendChild(modal);

        // Bind Actions
        document.getElementById('add-signature-btn').onclick = createSignatureModal;
        document.getElementById('close-viewer').onclick = () => {
            if (confirm("Are you sure you want to cancel? Your work will be lost.")) {
                modal.remove();
                window.location.reload(true);
            }
        };

        const finishBtn = document.getElementById('finish-btn');
        finishBtn.onclick = async () => {
            finishBtn.innerText = "BAKING PDF...";
            finishBtn.disabled = true;
            try {
                const { PDFDocument } = window.PDFLib;
                const pdfDoc = await PDFDocument.load(window.originalPdfBuffer);
                const firstPage = pdfDoc.getPages()[0];
                const { width, height } = firstPage.getSize();

                const overlays = viewerContainer.querySelectorAll('.esign-overlay');
                for (let el of overlays) {
                    const imgData = el.querySelector('img').src;
                    const embedImage = imgData.includes('png') ? await pdfDoc.embedPng(imgData) : await pdfDoc.embedJpg(imgData);

                    const scaleX = width / canvas.offsetWidth;
                    const scaleY = height / canvas.offsetHeight;

                    const ox = el.offsetLeft * scaleX;
                    const oy = (canvas.offsetHeight - (el.offsetTop + el.offsetHeight)) * scaleY;
                    const ow = el.offsetWidth * scaleX;
                    const oh = el.offsetHeight * scaleY;

                    firstPage.drawImage(embedImage, { x: ox, y: oy, width: ow, height: oh });
                }

                const bakedBytes = await pdfDoc.save();
                const blob = new Blob([bakedBytes], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'KELLYNEPDF_SIGNED.pdf';
                link.click();
                
                modal.innerHTML = `
                    <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#fff;">
                        <h1 style="color:#008000; font-size:32px; font-weight:900;">SUCCESSFULLY SIGNED!</h1>
                        <p style="margin-top:10px; color:#666;">Your document has been downloaded.</p>
                        <button onclick="window.location.reload(true)" style="margin-top:30px; background:#111; color:#fff; border:none; padding:15px 40px; border-radius:50px; font-weight:900; cursor:pointer;">BACK TO HOME</button>
                    </div>
                `;
            } catch (err) {
                console.error(err);
                alert("Error baking PDF.");
                finishBtn.innerText = "APPLY & DOWNLOAD";
                finishBtn.disabled = false;
            }
        };

        window.viewerContainerInstance = viewerContainer;
        window.viewerCanvasInstance = canvas;
    }

    // --- SIGNATURE MODAL LOGIC (Simplified & Polished) ---
    function createSignatureModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20000; display:flex; justify-content:center; align-items:center;`;
        
        const content = document.createElement('div');
        content.style.cssText = `background:#fff; width:600px; padding:30px; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.5);`;
        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h2 style="margin:0; font-weight:900;">SIGN / STAMP</h2>
                <span id="close-sm" style="cursor:pointer; font-size:24px;">&times;</span>
            </div>
            <div style="display:flex; gap:10px; border-bottom:1px solid #eee; margin-bottom:20px;">
                <button class="m-tab active" data-t="sign" style="flex:1; padding:10px; border:none; background:none; cursor:pointer; font-weight:700;">SIGNATURE</button>
                <button class="m-tab" data-t="initials" style="flex:1; padding:10px; border:none; background:none; cursor:pointer; font-weight:700;">INITIALS</button>
                <button class="m-tab" data-t="stamp" style="flex:1; padding:10px; border:none; background:none; cursor:pointer; font-weight:700;">STAMP</button>
            </div>
            <div id="m-sub-tabs" style="display:flex; gap:10px; margin-bottom:15px; justify-content:center;">
                <button class="s-tab active" data-s="text">TEXT</button>
                <button class="s-tab" data-s="draw">DRAW</button>
                <button class="s-tab" data-s="image">IMAGE</button>
            </div>
            <div id="m-input" style="border:2px dashed #eee; height:180px; display:flex; justify-content:center; align-items:center;"></div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                <button id="sm-cancel" style="padding:10px 20px; border:none; background:none; cursor:pointer;">Cancel</button>
                <button id="sm-create" style="padding:10px 30px; background:#e5322d; color:#fff; border:none; border-radius:5px; font-weight:700; cursor:pointer;">INSERT</button>
            </div>
            <style>
                .m-tab.active { border-bottom: 3px solid #e5322d !important; color:#e5322d; }
                .s-tab { padding:8px 20px; border:1px solid #ddd; border-radius:30px; background:#f9f9f9; cursor:pointer; font-size:12px; font-weight:700; }
                .s-tab.active { background:#111 !important; color:#fff !important; }
            </style>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        let curMain = 'sign', curSub = 'text';
        const inputDiv = content.querySelector('#m-input');

        function redraw() {
            inputDiv.innerHTML = '';
            if (curSub === 'text') {
                const i = document.createElement('input');
                i.type = 'text'; i.placeholder = 'Type here...';
                i.style.cssText = `width:80%; padding:15px; font-size:24px; text-align:center; font-family:${curMain === 'stamp' ? 'Inter' : "'Caveat', cursive"};`;
                inputDiv.appendChild(i);
            } else if (curSub === 'draw') {
                const c = document.createElement('canvas'); c.width = 500; c.height = 150; c.style.background = '#fff';
                inputDiv.appendChild(c);
                const ctx = c.getContext('2d'); ctx.lineWidth = 2; let d = false;
                c.onmousedown = (e) => { d = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); };
                c.onmousemove = (e) => { if (d) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } };
                c.onmouseup = () => d = false;
            } else {
                const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; inputDiv.appendChild(i);
            }
        }
        redraw();

        content.querySelectorAll('.m-tab').forEach(b => b.onclick = () => { content.querySelectorAll('.m-tab').forEach(x => x.classList.remove('active')); b.classList.add('active'); curMain = b.dataset.t; redraw(); });
        content.querySelectorAll('.s-tab').forEach(b => b.onclick = () => { content.querySelectorAll('.s-tab').forEach(x => x.classList.remove('active')); b.classList.add('active'); curSub = b.dataset.s; redraw(); });
        
        document.getElementById('sm-cancel').onclick = document.getElementById('close-sm').onclick = () => modal.remove();
        document.getElementById('sm-create').onclick = async () => {
            let data = null;
            if (curSub === 'text') {
                const v = inputDiv.querySelector('input').value; if (!v) return;
                const tc = document.createElement('canvas'); tc.width = 400; tc.height = 100;
                const ctx = tc.getContext('2d'); ctx.font = curMain === 'stamp' ? 'bold 30px Inter' : '40px Caveat';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, 200, 50);
                data = tc.toDataURL();
            } else if (curSub === 'draw') { data = inputDiv.querySelector('canvas').toDataURL(); }
            else { const f = inputDiv.querySelector('input').files[0]; if (!f) return; data = await new Promise(r => { const rd = new FileReader(); rd.onload = (e) => r(e.target.result); rd.readAsDataURL(f); }); }
            
            if (data) { placeOverlay(data); modal.remove(); }
        };
    }

    function placeOverlay(data) {
        const overlay = document.createElement('div');
        overlay.className = 'esign-overlay';
        overlay.style.cssText = `position:absolute; top:100px; left:100px; width:150px; height:60px; cursor:move; z-index:1000; border:1px dashed #e5322d;`;
        
        const img = document.createElement('img'); img.src = data; img.style.cssText = 'width:100%; height:100%; pointer-events:none;';
        overlay.appendChild(img);

        const rh = document.createElement('div');
        rh.style.cssText = `position:absolute; bottom:-5px; right:-5px; width:12px; height:12px; background:#e5322d; border-radius:50%; cursor:nwse-resize;`;
        overlay.appendChild(rh);

        const db = document.createElement('button');
        db.innerHTML = '&times;';
        db.style.cssText = `position:absolute; top:-10px; right:-10px; width:20px; height:20px; background:#e5322d; color:#fff; border:none; border-radius:50%; cursor:pointer;`;
        db.onclick = () => overlay.remove();
        overlay.appendChild(db);

        window.viewerContainerInstance.appendChild(overlay);

        // Movement Logic
        let dr = false, rs = false, sx, sy, sw, sh, sl, st;
        const start = (cx, cy, t) => {
            if (t === db) return; if (t === rh) rs = true; else dr = true;
            sx = cx; sy = cy; sw = overlay.offsetWidth; sh = overlay.offsetHeight; sl = overlay.offsetLeft; st = overlay.offsetTop;
            document.addEventListener('mousemove', move); document.addEventListener('mouseup', end);
            document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', end);
        };
        const move = (e) => {
            if (!dr && !rs) return; e.preventDefault();
            const cx = e.clientX || e.touches[0].clientX; const cy = e.clientY || e.touches[0].clientY;
            if (dr) { overlay.style.left = (sl + (cx - sx)) + 'px'; overlay.style.top = (st + (cy - sy)) + 'px'; }
            else { overlay.style.width = Math.max(30, sw + (cx - sx)) + 'px'; overlay.style.height = Math.max(15, sh + (cx - sx) * (sh/sw)) + 'px'; }
        };
        const end = () => { dr = rs = false; document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move); };

        overlay.addEventListener('mousedown', (e) => start(e.clientX, e.clientY, e.target));
        overlay.addEventListener('touchstart', (e) => start(e.touches[0].clientX, e.touches[0].clientY, e.target), { passive: false });
    }

    // --- MAIN EXECUTION ---
    if (files && files.length > 0) {
        handleFile(files[0]);
    } else {
        // Just ensure status is ready
        statusLabel.innerText = "Click or Drag & Drop PDF to Sign";
    }

    // Secondary Upload Binding
    document.getElementById('file-input').onchange = (e) => { if (window.currentActiveTool.includes('DIGITAL SIGN')) handleFile(e.target.files[0]); };
    dropZone.ondrop = (e) => { e.preventDefault(); e.stopPropagation(); if (window.currentActiveTool.includes('DIGITAL SIGN')) handleFile(e.dataTransfer.files[0]); };
};
