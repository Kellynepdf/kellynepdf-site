/**
 * js/esign-pdf/digital-sign.js
 * Advanced Digital Sign & Stamp Master
 * Features: Professional Signature/Stamp Overlay with Resizing & Draggable Logic
 */

window.runDigitalSign = async function(files) {
    const statusLabel = document.getElementById('status-label');
    const toolContainer = document.querySelector('.tool-box-container');
    const actionBtn = document.getElementById('action-button');

    // 1. INITIALIZE VIEWER UI (EMPTY STATE)
    let viewerContainer = document.getElementById('esign-viewer-container');
    if (!viewerContainer) {
        viewerContainer = document.createElement('div');
        viewerContainer.id = 'esign-viewer-container';
        viewerContainer.style.cssText = `
            position: relative;
            margin: 20px auto;
            max-width: 100%;
            width: 800px;
            height: 500px;
            border: 2px dashed #ddd;
            border-radius: 12px;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: visible;
            transition: all 0.3s ease;
        `;
        
        const placeholder = document.createElement('div');
        placeholder.id = 'esign-placeholder';
        placeholder.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" style="width:60px; opacity:0.3; margin-bottom:15px;">
            <p style="color:#888; font-weight:700;">No PDF uploaded. Drag or select a file to begin.</p>
        `;
        placeholder.style.textAlign = 'center';
        viewerContainer.appendChild(placeholder);
        
        toolContainer.appendChild(viewerContainer);
    }

    // 2. ROBUST UPLOAD BINDING
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    const handleFile = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            statusLabel.innerHTML = `<span style="color:#e5322d;">ERROR: PLEASE UPLOAD A VALID PDF</span>`;
            return;
        }

        try {
            statusLabel.innerText = "Rendering PDF...";
            const buffer = await file.arrayBuffer();
            window.originalPdfBuffer = buffer; // Store globally for pdf-lib later

            const pdfjs = window['pdfjs-dist/build/pdf'];
            pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const loadingTask = pdfjs.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.id = 'pdf-render-canvas';
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Update Viewer UI
            viewerContainer.innerHTML = ''; 
            viewerContainer.style.width = viewport.width + 'px';
            viewerContainer.style.height = viewport.height + 'px';
            viewerContainer.style.border = "none";
            viewerContainer.style.background = "#fff";
            viewerContainer.appendChild(canvas);

            statusLabel.innerText = "PDF Loaded. You can now Add Signature.";
            
            // Enable 'ADD SIGNATURE' buttons
            if (window.showEsignControls) window.showEsignControls();

        } catch (err) {
            console.error(err);
            statusLabel.innerText = "Failed to render PDF.";
        }
    };

    // If initial call has files, process them
    if (files && files.length > 0) {
        handleFile(files[0]);
    }

    // Attach listeners for subsequent uploads (Specific to Digital Sign)
    fileInput.onchange = (e) => {
        if (window.currentActiveTool.includes('DIGITAL SIGN')) handleFile(e.target.files[0]);
    };

    dropZone.ondragover = dropZone.ondragenter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.currentActiveTool.includes('DIGITAL SIGN')) dropZone.classList.add('drag-active');
    };

    dropZone.ondragleave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-active');
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-active');
        if (window.currentActiveTool.includes('DIGITAL SIGN')) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    };

    // 2. SIGNATURE MODAL UI (DocuSign Style)
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'esign-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 10000;
            display: flex; justify-content: center; align-items: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: #fff; width: 600px; padding: 25px; border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: 'Inter', sans-serif;
        `;
        
        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0; font-weight:900;">ADOPT YOUR SIGNATURE</h2>
                <span id="close-esign-modal" style="cursor:pointer; font-size:24px; font-weight:900;">&times;</span>
            </div>

            <!-- Main Tabs -->
            <div style="display:flex; border-bottom:1px solid #eee; margin-bottom:20px;">
                <button class="esign-main-tab active" data-tab="sign" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; font-weight:700; color:#666; transition: all 0.2s;">SIGNATURE</button>
                <button class="esign-main-tab" data-tab="initials" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; font-weight:700; color:#666; transition: all 0.2s;">INITIALS</button>
                <button class="esign-main-tab" data-tab="stamp" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; font-weight:700; color:#666; transition: all 0.2s;">STAMP</button>
            </div>

            <!-- Content Area -->
            <div id="esign-subtask-container">
                <div style="display:flex; gap:10px; margin-bottom:15px; justify-content:center;">
                    <button class="esign-sub-tab active" data-sub="text" style="padding:8px 20px; border:1px solid #ddd; border-radius:30px; background:#f9f9f9; cursor:pointer; font-size:12px; font-weight:700;">TEXT</button>
                    <button class="esign-sub-tab" data-sub="draw" style="padding:8px 20px; border:1px solid #ddd; border-radius:30px; background:#f9f9f9; cursor:pointer; font-size:12px; font-weight:700;">DRAW</button>
                    <button class="esign-sub-tab" data-sub="image" style="padding:8px 20px; border:1px solid #ddd; border-radius:30px; background:#f9f9f9; cursor:pointer; font-size:12px; font-weight:700;">IMAGE</button>
                </div>

                <div id="esign-input-area" style="border:2px dashed #eee; border-radius:10px; min-height:180px; display:flex; justify-content:center; align-items:center; background:#fff; position:relative;">
                    <!-- Input will be dynamic here -->
                </div>
            </div>

            <style>
                .esign-main-tab.active { color: #e5322d !important; border-bottom: 3px solid #e5322d !important; }
                .esign-sub-tab.active { background: #111 !important; color: #fff !important; border-color: #111 !important; }
            </style>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                <button id="esign-cancel" style="padding:10px 25px; border-radius:5px; border:1px solid #ccc; background:#fff; cursor:pointer;">Cancel</button>
                <button id="esign-create" style="padding:10px 25px; border-radius:5px; border:none; background:#e5322d; color:#fff; font-weight:700; cursor:pointer;">Create</button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        let activeMainTab = 'sign';
        let activeSubTab = 'text';

        const inputArea = content.querySelector('#esign-input-area');

        function updateInputArea() {
            inputArea.innerHTML = '';
            if (activeSubTab === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = activeMainTab === 'sign' ? 'Type your signature...' : (activeMainTab === 'initials' ? 'Initials...' : 'Company Name...');
                input.style.cssText = `
                    width: 70%; padding: 15px; border: 1px solid #ddd; border-radius: 5px;
                    font-size: 24px; text-align: center;
                    font-family: ${activeMainTab === 'stamp' ? 'Inter' : "'Caveat', cursive"};
                    color: #000;
                `;
                inputArea.appendChild(input);
            } else if (activeSubTab === 'draw') {
                const drawCanvas = document.createElement('canvas');
                drawCanvas.width = 500;
                drawCanvas.height = 150;
                drawCanvas.style.cssText = 'border:1px dashed #ccc; cursor:crosshair; background:#fff;';
                inputArea.appendChild(drawCanvas);
                
                const ctx = drawCanvas.getContext('2d');
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#000';
                let drawing = false;

                drawCanvas.onmousedown = (e) => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); };
                drawCanvas.onmousemove = (e) => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } };
                drawCanvas.onmouseup = () => drawing = false;

                const clearBtn = document.createElement('button');
                clearBtn.innerText = 'Clear';
                clearBtn.style.cssText = 'position:absolute; bottom:80px; left:40px;';
                clearBtn.onclick = () => ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
                // Actually prepend or append properly
                inputArea.style.position = 'relative';
                inputArea.appendChild(clearBtn);

            } else if (activeSubTab === 'image') {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                inputArea.appendChild(fileInput);
            }
        }

        updateInputArea();

        // Modal Events
        content.querySelectorAll('.esign-main-tab').forEach(btn => {
            btn.onclick = () => {
                content.querySelectorAll('.esign-main-tab').forEach(b => { b.style.borderBottom = 'none'; b.classList.remove('active'); });
                btn.classList.add('active');
                btn.style.borderBottom = '2px solid #e5322d';
                activeMainTab = btn.dataset.tab;
                updateInputArea();
            };
        });

        content.querySelectorAll('.esign-sub-tab').forEach(btn => {
            btn.onclick = () => {
                content.querySelectorAll('.esign-sub-tab').forEach(b => { b.style.background = '#fff'; b.classList.remove('active'); });
                btn.classList.add('active');
                btn.style.background = '#eee';
                activeSubTab = btn.dataset.sub;
                updateInputArea();
            };
        });

        document.getElementById('close-esign-modal').onclick = () => modal.remove();
        document.getElementById('esign-cancel').onclick = () => modal.remove();

        document.getElementById('esign-create').onclick = async () => {
            let imgData = null;
            if (activeSubTab === 'text') {
                const text = inputArea.querySelector('input').value;
                if (!text) return;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 400;
                tempCanvas.height = 100;
                const ctx = tempCanvas.getContext('2d');
                ctx.fillStyle = activeMainTab === 'stamp' ? '#000' : '#000'; // Default black
                ctx.font = activeMainTab === 'stamp' ? 'bold 30px Inter' : '40px Caveat';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 200, 50);
                imgData = tempCanvas.toDataURL('image/png');
            } else if (activeSubTab === 'draw') {
                const dc = inputArea.querySelector('canvas');
                imgData = dc.toDataURL('image/png');
            } else if (activeSubTab === 'image') {
                const file = inputArea.querySelector('input').files[0];
                if (!file) return;
                imgData = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            if (imgData) {
                placeOverlay(imgData);
                modal.remove();
            }
        };
    }

    // 3. INTERACTIVE OVERLAY (Drag & Resize)
    function placeOverlay(imgData) {
        const overlay = document.createElement('div');
        overlay.classList.add('esign-overlay');
        overlay.style.cssText = `
            position: absolute; top: 50px; left: 50px;
            width: 150px; height: 60px;
            cursor: move; transform-origin: top left;
            z-index: 1000;
        `;

        const img = document.createElement('img');
        img.src = imgData;
        img.style.cssText = 'width: 100%; height: 100%; display: block; border: 1px dashed rgba(229, 50, 45, 0.4); pointer-events:none;';
        overlay.appendChild(img);

        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute; bottom: -5px; right: -5px;
            width: 12px; height: 12px; background: #e5322d;
            border-radius: 50%; cursor: nwse-resize;
        `;
        overlay.appendChild(resizeHandle);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.style.cssText = `
            position: absolute; top: -10px; right: -10px;
            width: 20px; height: 20px; background: #e5322d; color: #fff;
            border: none; border-radius: 50%; cursor: pointer; font-size: 12px;
        `;
        deleteBtn.onclick = () => overlay.remove();
        overlay.appendChild(deleteBtn);

        viewerContainer.appendChild(overlay);

        // DRAG & RESIZE LOGIC
        let isDragging = false;
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        const startMove = (clientX, clientY, target) => {
            if (target === deleteBtn) return;
            if (target === resizeHandle) {
                isResizing = true;
            } else {
                isDragging = true;
            }
            startX = clientX;
            startY = clientY;
            startWidth = overlay.offsetWidth;
            startHeight = overlay.offsetHeight;
            startLeft = overlay.offsetLeft;
            startTop = overlay.offsetTop;
            
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        };

        const onMove = (e) => {
            if (!isDragging && !isResizing) return;
            if (e.cancelable) e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (isDragging) {
                overlay.style.left = (startLeft + (clientX - startX)) + 'px';
                overlay.style.top = (startTop + (clientY - startY)) + 'px';
            } else if (isResizing) {
                const diffX = clientX - startX;
                overlay.style.width = Math.max(30, startWidth + diffX) + 'px';
                overlay.style.height = Math.max(15, startHeight + (diffX * (startHeight / startWidth))) + 'px';
            }
        };

        const onTouchMove = (e) => onMove(e);
        const onEnd = () => {
            isDragging = isResizing = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onEnd);
        };

        overlay.addEventListener('mousedown', (e) => startMove(e.clientX, e.clientY, e.target));
        overlay.addEventListener('touchstart', (e) => {
            if (e.target === deleteBtn) return;
            startMove(e.touches[0].clientX, e.touches[0].clientY, e.target);
        }, { passive: false });
    }

    // 4. ACTION UI & CONTROLS
    const controls = document.createElement('div');
    controls.id = 'esign-controls';
    controls.style.cssText = 'display:none; justify-content:center; gap:15px; margin-top:20px;';
    
    const addSignBtn = document.createElement('button');
    addSignBtn.innerText = 'ADD SIGNATURE / STAMP';
    addSignBtn.style.cssText = `
        padding: 12px 25px; border-radius: 50px; background: #111; color: #fff;
        border: none; cursor: pointer; font-weight: 700;
    `;
    addSignBtn.onclick = createModal;
    
    controls.appendChild(addSignBtn);
    viewerContainer.after(controls);

    // Global toggle to show controls
    window.showEsignControls = () => {
        controls.style.display = 'flex';
        actionBtn.style.display = 'block';
        actionBtn.className = 'download-ready';
        actionBtn.innerHTML = '<span>APPLY & DOWNLOAD</span>';
        actionBtn.style.backgroundColor = '#e5322d';
    };

    actionBtn.onclick = async () => {
        if (!window.originalPdfBuffer) {
            statusLabel.innerText = "No PDF buffer found. Please upload again.";
            return;
        }
        actionBtn.innerText = "BAKING PDF...";
        actionBtn.style.pointerEvents = 'none';

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(window.originalPdfBuffer);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();

            const overlays = viewerContainer.querySelectorAll('.esign-overlay');
            for (let el of overlays) {
                const imgEl = el.querySelector('img');
                const imgData = imgEl.src;
                
                // Embed image
                const embedImage = imgData.includes('png') 
                    ? await pdfDoc.embedPng(imgData) 
                    : await pdfDoc.embedJpg(imgData);

                // Math: Calculate relative coordinates
                const canvasEl = document.getElementById('pdf-render-canvas');
                const scaleX = width / canvasEl.offsetWidth;
                const scaleY = height / canvasEl.offsetHeight;

                const ox = el.offsetLeft * scaleX;
                const oy = (canvasEl.offsetHeight - (el.offsetTop + el.offsetHeight)) * scaleY;
                const ow = el.offsetWidth * scaleX;
                const oh = el.offsetHeight * scaleY;

                firstPage.drawImage(embedImage, {
                    x: ox,
                    y: oy,
                    width: ow,
                    height: oh
                });
            }

            const bakedBytes = await pdfDoc.save();
            const blob = new Blob([bakedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'KELLYNEPDF_SIGNED.pdf';
            link.click();

            // SUCCESS STATE
            toolTitle.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
            toolTitle.style.color = "#008000";
            
            actionBtn.innerHTML = '<span>BACK TO HOME</span>';
            actionBtn.style.backgroundColor = '#111';
            actionBtn.style.pointerEvents = 'auto';
            actionBtn.onclick = () => window.location.reload(true);

        } catch (err) {
            console.error(err);
            statusLabel.innerText = "Error baking PDF. Try again.";
            actionBtn.innerText = "APPLY & DOWNLOAD";
            actionBtn.style.pointerEvents = 'auto';
        }
    };
};
