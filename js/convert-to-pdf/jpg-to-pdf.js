/**
 * KELLYNE PDF - Bulk JPG to PDF Engine
 * Logic: Convert multiple images into a single professional PDF document.
 */

// ── FIXED EVENT BINDING FOR MANUAL UPLOADS (ISOLATED) ──

(function() {
    if (window._jpgToPdfInitDone) return;
    window._jpgToPdfInitDone = true;

    const dropZone = document.getElementById('drop-zone');
    
    // 1. Clean up and force fresh input
    let oldInput = document.getElementById('jpg-upload-input');
    if (oldInput) oldInput.remove();
    
    document.body.insertAdjacentHTML('beforeend', '<input type="file" id="jpg-upload-input" multiple accept="image/*, .jpg, .jpeg, .png, .PNG, .JPG, .JPEG" style="display: none;">');
    let forceInput = document.getElementById('jpg-upload-input');

    // Bind Change Listener directly to the input, completely outside the click listener
    forceInput.addEventListener('change', (e) => {
        if (window.currentActiveTool === 'JPG TO PDF') {
            e.preventDefault();
            e.stopPropagation();

            const rawFiles = e.target.files;
            if (!rawFiles || rawFiles.length === 0) return;

            const validFiles = Array.from(rawFiles).filter(file => {
                if (!file) return false;
                const isImageMime = file.type.startsWith('image/');
                const hasImageExt = /\.(jpg|jpeg|png)$/i.test(file.name);
                return isImageMime || hasImageExt;
            });

            if (!window.jpgGlobalState) window.jpgGlobalState = [];
            
            validFiles.forEach(file => {
                window.jpgGlobalState.push(file);
            });

            if (window.jpgGlobalState.length > 0) {
                window.renderPreviewGallery();
            }

            // CRITICAL RESET
            e.target.value = '';
        }
    });

    if (dropZone) {
        // 2. DUMB CLICK HANDLER
        dropZone.addEventListener('click', (e) => {
            if (window.currentActiveTool === 'JPG TO PDF') {
                // Do not intercept clicks on interactive elements like buttons or selects
                if (e.target.closest('button') || e.target.closest('select')) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const uploadInput = document.getElementById('jpg-upload-input');
                if(uploadInput) uploadInput.click();
            }
        }, true);

        // Add isolated drop binding to overwrite default if present
        dropZone.addEventListener('dragover', (e) => {
            if (window.currentActiveTool === 'JPG TO PDF') {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        dropZone.addEventListener('drop', (e) => {
            if (window.currentActiveTool === 'JPG TO PDF') {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = document.getElementById('action-button');
                if (!btn || !btn.classList.contains('download-ready')) {
                    if (e.dataTransfer && e.dataTransfer.files) {
                        const rawFiles = e.dataTransfer.files;
                        if (!rawFiles || rawFiles.length === 0) return;
                        
                        const validFiles = Array.from(rawFiles).filter(file => {
                            if (!file) return false;
                            const isImageMime = file.type.startsWith('image/');
                            const hasImageExt = /\.(jpg|jpeg|png)$/i.test(file.name);
                            return isImageMime || hasImageExt;
                        });
                        
                        if (!window.jpgGlobalState) window.jpgGlobalState = [];
                        
                        validFiles.forEach(file => {
                            window.jpgGlobalState.push(file);
                        });
                        
                        if (window.jpgGlobalState.length > 0) {
                            window.renderPreviewGallery();
                        }
                    }
                }
            }
        }, true);
    }
})();

window.runJpgToPdf = function(files) {
    if (!files || files.length === 0) return;

    if (files !== window.jpgGlobalState) {
        if (!window.jpgGlobalState) window.jpgGlobalState = [];
        const newValidFiles = Array.from(files).filter(file => {
            if (!file) return false;
            const isImageMime = file.type.startsWith('image/');
            const hasImageExt = /\.(jpg|jpeg|png)$/i.test(file.name);
            return isImageMime || hasImageExt;
        });
        window.jpgGlobalState = window.jpgGlobalState.concat(newValidFiles);
    }

    if (window.jpgGlobalState.length > 0) {
        window.renderPreviewGallery();
    }
};

window.renderPreviewGallery = function() {
    const imageFiles = window.jpgGlobalState || [];

    const titleBox = document.getElementById('tool-title-box');
    let btn = document.getElementById('action-button');
    const statusLabel = document.getElementById('status-label');
    const defaultIcon = document.getElementById('default-upload-icon');

    if (imageFiles.length === 0) {
        if (statusLabel) {
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">NO VALID IMAGES FOUND</span>`;
            setTimeout(() => window.resetUI(), 2500);
        }
        return;
    }

    // Hide cloud icon during processing
    if (defaultIcon) defaultIcon.style.display = 'none';

    // ── UI Implementation: Options & Dynamic Layout Preview ──
    const existingDropdowns = document.getElementById('jpg-settings-container');
    if (existingDropdowns) existingDropdowns.remove();

    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'jpg-settings-container';
    dropdownContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; margin: 15px 0; z-index: 100; position: relative; width: 100%;';

    const selectsDiv = document.createElement('div');
    selectsDiv.style.cssText = 'display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;';
    selectsDiv.innerHTML = `
        <select id="jpg-orientation" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="p" selected>Portrait (Default)</option>
            <option value="l">Landscape</option>
        </select>
        <select id="jpg-size" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="a4" selected>A4 (Default)</option>
            <option value="a3">A3</option>
            <option value="letter">US Letter</option>
        </select>
        <select id="jpg-margin" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="0" selected>No margin (Default - 0px)</option>
            <option value="15">Small (~15px/10mm)</option>
            <option value="30">Big (~30px/20mm)</option>
        </select>
    `;

    // Preview Gallery Container
    const galleryWrapper = document.createElement('div');
    galleryWrapper.id = 'jpg-preview-gallery-wrapper';
    galleryWrapper.style.cssText = 'margin-top: 15px; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 800px;';
    
    galleryWrapper.innerHTML = `
        <span style="font-size: 13px; font-weight: 800; color: #888; margin-bottom: 12px; text-transform: uppercase;">Preview Gallery</span>
        <div id="jpg-preview-gallery" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%; max-height: 400px; overflow-y: auto; padding: 10px; border-radius: 8px; background: #f9f9f9; border: 1px dashed #ccc;">
        </div>
    `;

    dropdownContainer.appendChild(selectsDiv);
    dropdownContainer.appendChild(galleryWrapper);
    
    // Re-inject the ACTION BUTTON dynamically below the gallery container
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'action-button';
    }
    
    // Append button properly ensuring it stays separate from the gallery div updating layout
    dropdownContainer.appendChild(btn);
    
    // Safely insert the container into the UI
    const targetDropZone = document.getElementById('drop-zone');
    if (targetDropZone && targetDropZone.parentNode) {
        targetDropZone.parentNode.insertBefore(dropdownContainer, targetDropZone.nextSibling);
    }

    const gallery = galleryWrapper.querySelector('#jpg-preview-gallery');

    // Populate gallery with proper DOM safely generated IDs
    imageFiles.forEach((file, index) => {
        const id = 'img-preview-box-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now() + '-' + index;
        const pagePreviewBox = document.createElement('div');
        pagePreviewBox.id = id;
        pagePreviewBox.className = 'page-preview-box';
        pagePreviewBox.style.cssText = 'background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; border-radius: 4px; flex-shrink: 0; padding: 5px;';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.cssText = 'max-width: 100%; max-height: 80%; object-fit: contain; pointer-events: none;';
        
        // Per-Image Orientation Control
        const select = document.createElement('select');
        select.className = 'image-orientation-select';
        select.style.cssText = 'margin-top:5px; font-size:12px; width:100%; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-weight: bold;';
        select.innerHTML = `
            <option value="p" selected>Portrait</option>
            <option value="l">Landscape</option>
        `;
        
        pagePreviewBox.appendChild(img);
        pagePreviewBox.appendChild(select);
        gallery.appendChild(pagePreviewBox);

        // Individual selection updates its own box
        select.onchange = () => {
            if (select.value === 'l') {
                pagePreviewBox.style.aspectRatio = '1.414 / 1';
                pagePreviewBox.style.width = '200px';
                pagePreviewBox.style.borderColor = '#4a90e2';
            } else {
                pagePreviewBox.style.aspectRatio = '1 / 1.414';
                pagePreviewBox.style.width = '150px';
                pagePreviewBox.style.borderColor = '#e5322d'; 
            }
        };
    });

    const updateLayoutPreview = () => {
        const globalOri = document.getElementById('jpg-orientation').value;
        const previewBoxes = document.querySelectorAll('.page-preview-box');
        const individualSelects = document.querySelectorAll('.image-orientation-select');
        
        previewBoxes.forEach((box, i) => {
            const select = individualSelects[i];
            if (select) select.value = globalOri;

            if (globalOri === 'l') {
                box.style.aspectRatio = '1.414 / 1';
                box.style.width = '200px';
                box.style.borderColor = '#4a90e2';
            } else {
                box.style.aspectRatio = '1 / 1.414';
                box.style.width = '150px';
                box.style.borderColor = '#e5322d'; 
            }
        });
    };

    // Listen for orientation or size changes to update box dynamically
    document.getElementById('jpg-orientation').addEventListener('change', updateLayoutPreview);
    document.getElementById('jpg-size').addEventListener('change', updateLayoutPreview);
    
    // Initialize preview with defaults immediately
    updateLayoutPreview();

    // ── STEP 2: "READY TO CONVERT" UI ──
    if (statusLabel) {
        statusLabel.innerHTML = `${imageFiles.length} IMAGES READY`;
        statusLabel.style.color = '#e5322d';
        statusLabel.style.fontWeight = '900';
        statusLabel.style.fontSize = '18px';
    }

    // Show "CONVERT TO PDF" button — Solid Red (#e5322d)
    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">CONVERT TO PDF</span>`;
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
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 10px 25px rgba(229, 50, 45, 0.3);
    `;
    btn.disabled = false;
    btn.classList.add('download-ready');

    // ── STEP 3: Conversion Execution (jsPDF) ──
    btn.onclick = async (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        // Loading State: "KELLYNE CONVERTING..."
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE CONVERTING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) statusLabel.innerText = "Processing Images...";

        try {
            if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("jsPDF not loaded");

            const globalOrientation = document.getElementById('jpg-orientation').value;
            const pageSize = document.getElementById('jpg-size').value;
            const marginValue = parseInt(document.getElementById('jpg-margin').value, 10);
            
            const individualSelects = Array.from(document.querySelectorAll('.image-orientation-select'));

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: individualSelects[0] ? individualSelects[0].value : globalOrientation,
                unit: 'mm',
                format: pageSize
            });

            for (let i = 0; i < imageFiles.length; i++) {
                const imgFile = imageFiles[i];
                const individualOrientation = individualSelects[i] ? individualSelects[i].value : globalOrientation;

                if (statusLabel) statusLabel.innerText = `Converting: ${imgFile.name} (${i+1}/${imageFiles.length})`;

                if (i > 0) {
                    doc.addPage(pageSize, individualOrientation);
                }

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                const imageUrl = URL.createObjectURL(imgFile);
                const safeId = 'img-j-' + Date.now() + '-' + i;

                const img = await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.id = safeId;
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = imageUrl;
                });

                const maxW = pageWidth - marginValue;
                const maxH = pageHeight - marginValue;
                const imgRatio = img.width / img.height;
                const pageRatio = maxW / maxH;
                
                let drawW, drawH;
                if (imgRatio > pageRatio) {
                    drawW = maxW;
                    drawH = drawW / imgRatio;
                } else {
                    drawH = maxH;
                    drawW = drawH * imgRatio;
                }

                const x = (pageWidth - drawW) / 2;
                const y = (pageHeight - drawH) / 2;

                const fileExt = imgFile.name.split('.').pop().toLowerCase();
                let imgFormat = fileExt === 'png' ? 'PNG' : 'JPEG';
                if (imgFile.type === 'image/png') imgFormat = 'PNG';

                doc.addImage(img, imgFormat, x, y, drawW, drawH);
                
                // Release object URL memory for performance on 10MB+ images
                URL.revokeObjectURL(imageUrl);
            }

            // ── SUCCESS UI & DOWNLOAD ──
            doc.save('KELLYNEPDF_JPG_TO_PDF.pdf');

            // NUCLEAR FIX: Physically destroy the input so it CANNOT be triggered
            const hiddenInput = document.getElementById('jpg-upload-input');
            if (hiddenInput) hiddenInput.remove();

            if (titleBox) titleBox.style.display = 'none';

            // Fully remove extra elements to prevent ID collisions
            if (dropdownContainer) dropdownContainer.remove();

            // Clear global state on success
            window.jpgGlobalState = [];

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) {
                // Sever any label/for connections
                dropZone.removeAttribute('for');
                
                dropZone.classList.add('success-tool-glow');
                dropZone.innerHTML = `
                  <div style="color: green; font-weight: bold; padding: 30px 0 10px; font-size: 22px;">CONVERSION SUCCESSFULLY COMPLETED</div>
                  <div style="font-weight: bold; margin-bottom: 25px; font-size: 14px;">${imageFiles.length} IMAGES CONVERTED SUCCESSFULLY</div>
                  <button type="button" onclick="window.location.href = window.location.pathname; window.location.reload(true);" style="background-color: #111111; color: #ffffff; padding: 12px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; display: block; margin: 0 auto; max-width: 280px; width: 100%; font-size: 14px;">BACK TO HOME</button>
                `;
            }

        } catch (err) {
            console.error("Conversion Error:", err);
            if (statusLabel) {
                statusLabel.innerHTML = `<span style="color: #ff0000; font-weight: 900;">CONVERSION FAILED</span>`;
            }
            setTimeout(() => window.resetUI(), 3000);
        }
    };
};
