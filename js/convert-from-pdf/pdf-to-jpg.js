/**
 * js/convert-from-pdf/pdf-to-jpg.js
 * Advanced PDF to Image Conversion Engine
 */

(function() {
    if (window._pdfToImgInitDone) return;
    window._pdfToImgInitDone = true;

    const dropZone = document.getElementById('drop-zone');
    
    // 1. Force hidden input
    let oldInput = document.getElementById('pdf-to-img-upload-input');
    if (oldInput) oldInput.remove();
    
    document.body.insertAdjacentHTML('beforeend', '<input type="file" id="pdf-to-img-upload-input" multiple accept="application/pdf, .pdf" style="display: none;">');
    let forceInput = document.getElementById('pdf-to-img-upload-input');

    forceInput.addEventListener('change', (e) => {
        if (window.currentActiveTool === 'PDF TO JPG') {
            e.preventDefault();
            e.stopPropagation();
            
            const rawFiles = e.target.files;
            if (!rawFiles || rawFiles.length === 0) return;
            
            const validFiles = Array.from(rawFiles).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
            
            if (!window.pdfImgGlobalState) window.pdfImgGlobalState = [];
            validFiles.forEach(f => window.pdfImgGlobalState.push(f));
            
            if (window.pdfImgGlobalState.length > 0) window.renderPdfImageGallery();
            
            e.target.value = '';
        }
    });

    if (dropZone) {
        // Dumb click handler
        dropZone.addEventListener('click', (e) => {
            if (window.currentActiveTool === 'PDF TO JPG') {
                if (e.target.closest('button') || e.target.closest('select')) return;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const upInput = document.getElementById('pdf-to-img-upload-input');
                if(upInput) upInput.click();
            }
        }, true);

        // Advanced Folder drag and drop support
        dropZone.addEventListener('dragover', (e) => {
            if (window.currentActiveTool === 'PDF TO JPG') {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        dropZone.addEventListener('drop', async (e) => {
            if (window.currentActiveTool === 'PDF TO JPG') {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = document.getElementById('action-button');
                if (!btn || !btn.classList.contains('download-ready')) {
                    if (e.dataTransfer && e.dataTransfer.items) {
                        const items = Array.from(e.dataTransfer.items);
                        const collectedPdfs = [];
                        
                        async function traverseFileTree(item) {
                            if (item.isFile) {
                                const file = await new Promise((resolve) => item.file(resolve));
                                if (file.name.toLowerCase().endsWith('.pdf')) collectedPdfs.push(file);
                            } else if (item.isDirectory) {
                                const dirReader = item.createReader();
                                const entries = await new Promise((resolve) => dirReader.readEntries(resolve));
                                for (const entry of entries) await traverseFileTree(entry);
                            }
                        }
                        
                        for (const item of items) {
                            if (item.webkitGetAsEntry) {
                                const entry = item.webkitGetAsEntry();
                                if (entry) await traverseFileTree(entry);
                            } else if (item.getAsFile) {
                                const file = item.getAsFile();
                                if (file && file.name.toLowerCase().endsWith('.pdf')) collectedPdfs.push(file);
                            }
                        }

                        if (collectedPdfs.length > 0) {
                            if (!window.pdfImgGlobalState) window.pdfImgGlobalState = [];
                            collectedPdfs.forEach(f => window.pdfImgGlobalState.push(f));
                            window.renderPdfImageGallery();
                        }
                    } else if (e.dataTransfer && e.dataTransfer.files) {
                        const rawFiles = Array.from(e.dataTransfer.files);
                        const validFiles = rawFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                        if (validFiles.length > 0) {
                            if (!window.pdfImgGlobalState) window.pdfImgGlobalState = [];
                            validFiles.forEach(f => window.pdfImgGlobalState.push(f));
                            window.renderPdfImageGallery();
                        }
                    }
                }
            }
        }, true);
    }
})();

window.runPDFtoJPG = window.runPdfToJpg = function(files) {
    if (!files || files.length === 0) return;

    if (files !== window.pdfImgGlobalState) {
        if (!window.pdfImgGlobalState) window.pdfImgGlobalState = [];
        const validFiles = Array.from(files).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
        window.pdfImgGlobalState = window.pdfImgGlobalState.concat(validFiles);
    }
    if (window.pdfImgGlobalState.length > 0) {
        window.renderPdfImageGallery();
    }
};

window.renderPdfImageGallery = async function() {
    const pdfFiles = window.pdfImgGlobalState || [];
    const titleBox = document.getElementById('tool-title-box');
    let btn = document.getElementById('action-button');
    const statusLabel = document.getElementById('status-label');
    const defaultIcon = document.getElementById('default-upload-icon');

    if (pdfFiles.length === 0) return;
    if (defaultIcon) defaultIcon.style.display = 'none';

    const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) {
        console.error("PDF.js not loaded");
        if (statusLabel) statusLabel.innerHTML = `<span style="color:red;">Error: PDF.js is required!</span>`;
        return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const existingContainer = document.getElementById('pdf-img-settings-container');
    if (existingContainer) existingContainer.remove();

    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'pdf-img-settings-container';
    dropdownContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; margin: 15px 0; z-index: 100; position: relative; width: 100%;';

    const galleryWrapper = document.createElement('div');
    galleryWrapper.id = 'pdf-img-preview-gallery-wrapper';
    galleryWrapper.style.cssText = 'margin-top: 15px; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 800px;';
    
    galleryWrapper.innerHTML = `
        <span style="font-size: 13px; font-weight: 800; color: #888; margin-bottom: 12px; text-transform: uppercase;">Preview Gallery (All Pages)</span>
        <div id="pdf-img-preview-gallery" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%; max-height: 400px; overflow-y: auto; padding: 10px; border-radius: 8px; background: #f9f9f9; border: 1px dashed #ccc;">
        </div>
    `;

    dropdownContainer.appendChild(galleryWrapper);
    
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'action-button';
    }
    dropdownContainer.appendChild(btn);

    const targetDropZone = document.getElementById('drop-zone');
    if (targetDropZone && targetDropZone.parentNode) {
        targetDropZone.parentNode.insertBefore(dropdownContainer, targetDropZone.nextSibling);
    }

    const gallery = galleryWrapper.querySelector('#pdf-img-preview-gallery');

    if (statusLabel) {
        statusLabel.innerHTML = `Extracting Previews...`;
        statusLabel.style.color = '#333';
    }
    
    for (let i = 0; i < pdfFiles.length; i++) {
        try {
            const file = pdfFiles[i];
            const buffer = await file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
            
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvasContext: ctx, viewport }).promise;

                const pagePreviewBox = document.createElement('div');
                pagePreviewBox.className = 'page-preview-box';
                pagePreviewBox.style.cssText = 'background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; border-radius: 4px; flex-shrink: 0; width: 130px; height: auto; padding: 5px;';
                
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/jpeg');
                img.style.cssText = 'max-width: 100%; max-height: 150px; object-fit: contain; pointer-events: none; margin-bottom: 5px;';
                
                const select = document.createElement('select');
                select.className = 'page-orientation-select';
                select.style.cssText = 'font-size:12px; width:100%; padding: 3px; border-radius: 4px; border: 1px solid #ccc; font-weight: bold; background: white;';
                select.innerHTML = `
                    <option value="original" selected>Original</option>
                    <option value="portrait">Force Portrait</option>
                    <option value="landscape">Force Landscape</option>
                `;
                
                pagePreviewBox.appendChild(img);
                pagePreviewBox.appendChild(select);
                gallery.appendChild(pagePreviewBox);
            }
        } catch(e) { console.error("Error previewing PDF", e); }
    }

    if (statusLabel) {
        statusLabel.innerHTML = `${pdfFiles.length} PDF(s) READY TO EXTRACT`;
        statusLabel.style.color = '#e5322d';
        statusLabel.style.fontWeight = '900';
    }

    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">CONVERT TO JPG</span>`;
    btn.style.cssText = `
        display: flex !important;
        justify-content: center;
        align-items: center;
        background-color: #e5322d !important;
        color: #fff !important;
        border: none;
        padding: 18px 45px;
        border-radius: 30px;
        cursor: pointer;
        width: auto;
        margin: 15px auto 0;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100;
        position: relative;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 10px 25px rgba(229, 50, 45, 0.3);
    `;
    btn.disabled = false;
    btn.classList.add('download-ready');

    btn.onclick = async (e) => {
        e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();

        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px;">KELLYNE CONVERTING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        try {
            const zip = new JSZip();
            const selects = document.querySelectorAll('.page-orientation-select');
            let globalPageIdx = 0;
            
            for (let i = 0; i < pdfFiles.length; i++) {
                const file = pdfFiles[i];
                if (statusLabel) statusLabel.innerText = `Extracting: ${file.name} (${i+1}/${pdfFiles.length})`;
                
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const pageOrientation = selects[globalPageIdx] ? selects[globalPageIdx].value : 'original';
                    globalPageIdx++;

                    const page = await pdf.getPage(pageNum);
                    const scale = 2.0; 
                    const viewport = page.getViewport({ scale });

                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = viewport.width;
                    tempCanvas.height = viewport.height;
                    tempCtx.fillStyle = "#ffffff";
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    await page.render({ canvasContext: tempCtx, viewport }).promise;

                    let finalCanvas = document.createElement('canvas');
                    
                    if (pageOrientation === 'landscape' && tempCanvas.height > tempCanvas.width) {
                        finalCanvas.width = tempCanvas.height;
                        finalCanvas.height = tempCanvas.width;
                        const ctx = finalCanvas.getContext('2d');
                        ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
                        ctx.rotate(90 * Math.PI / 180);
                        ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
                    } else if (pageOrientation === 'portrait' && tempCanvas.width > tempCanvas.height) {
                        finalCanvas.width = tempCanvas.height;
                        finalCanvas.height = tempCanvas.width;
                        const ctx = finalCanvas.getContext('2d');
                        ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
                        ctx.rotate(90 * Math.PI / 180);
                        ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
                    } else {
                        finalCanvas = tempCanvas;
                    }

                    const imageData = finalCanvas.toDataURL('image/jpeg', 0.95).split('base64,')[1];
                    const safeName = file.name.replace(/\.[^/.]+$/, "");
                    zip.file(`${safeName}_Page_${pageNum}.jpg`, imageData, {base64: true});

                    tempCanvas.width = tempCanvas.height = 0;
                    if (finalCanvas !== tempCanvas) finalCanvas.width = finalCanvas.height = 0;
                }
            }

            if (statusLabel) statusLabel.innerText = "Finalizing ZIP Archive...";
            const zipContent = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `KELLYNEPDF_IMAGES.zip`;
            link.click();

            // ── Nuclear Post-Conversion Reset ──
            const hiddenUpload = document.getElementById('pdf-to-img-upload-input');
            if (hiddenUpload) hiddenUpload.remove();

            if (titleBox) titleBox.style.display = 'none';
            if (dropdownContainer) dropdownContainer.remove();
            window.pdfImgGlobalState = [];

            const targetDropZone = document.getElementById('drop-zone');
            if (targetDropZone) {
                targetDropZone.removeAttribute('for');
                targetDropZone.classList.add('success-tool-glow');
                targetDropZone.innerHTML = `
                  <div style="color: green; font-weight: bold; padding: 30px 0 10px; font-size: 22px;">CONVERSION SUCCESSFULLY COMPLETED</div>
                  <div style="font-weight: bold; margin-bottom: 25px; font-size: 14px;">PDF(S) EXTRACTED TO IMAGES</div>
                  <button type="button" onclick="window.location.hash = 'merge-pdf'; window.location.reload(true);" style="background-color: #111111; color: #ffffff; padding: 12px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; display: block; margin: 0 auto; max-width: 280px; width: 100%; font-size: 14px;">BACK TO HOME</button>
                `;
            }

        } catch (err) {
            console.error(err);
            if (statusLabel) statusLabel.innerHTML = `<span style="color:red;">Error processing PDF</span>`;
            setTimeout(() => window.resetUI(), 3000);
        }
    };
};
