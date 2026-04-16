/**
 * KELLYNE PDF - Bulk JPG to PDF Engine
 * Logic: Convert multiple images into a single professional PDF document.
 */

// ── FIXED EVENT BINDING FOR MANUAL UPLOADS (ISOLATED) ──
(function() {
    if (window._jpgToPdfInitDone) return;
    window._jpgToPdfInitDone = true;

    const dropZone = document.getElementById('drop-zone');
    
    // 1. Force Create the Input (If Missing)
    let forceInput = document.getElementById('jpg-upload-input');
    if (!forceInput) {
        forceInput = document.createElement('input');
        forceInput.type = 'file';
        forceInput.id = 'jpg-upload-input';
        forceInput.multiple = true;
        forceInput.accept = '.jpg, .jpeg, .png, image/jpeg, image/png';
        forceInput.style.display = 'none';
        document.body.appendChild(forceInput);
    }
    
    if (dropZone) {
        // 2. Aggressive Click Binding
        dropZone.addEventListener('click', (e) => {
            if (window.currentActiveTool === 'JPG TO PDF') {
                e.preventDefault();
                e.stopPropagation();
                const btn = document.getElementById('action-button');
                if (!btn || !btn.classList.contains('download-ready')) {
                    document.getElementById('jpg-upload-input').click();
                }
            }
        });

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
                        const filesArr = Array.from(rawFiles);
                        if (filesArr.length === 0) return;
                        
                        if (!window.jpgGlobalState) window.jpgGlobalState = [];
                        
                        const isValidImage = (file) => {
                            if (!file) return false;
                            return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
                        };
                        
                        filesArr.forEach(file => {
                            if (isValidImage(file)) {
                                window.jpgGlobalState.push(file);
                            }
                        });
                        
                        if (window.jpgGlobalState.length > 0) {
                            window.runJpgToPdf(window.jpgGlobalState);
                        }
                    }
                }
            }
        }, true);
    }

    // 3. Robust Change Event & Reset
    forceInput.addEventListener('change', (e) => {
        if (window.currentActiveTool === 'JPG TO PDF') {
            e.preventDefault();
            e.stopPropagation();

            const rawFiles = e.target.files;
            if (!rawFiles || rawFiles.length === 0) return;

            const filesArr = Array.from(rawFiles);
            if (!window.jpgGlobalState) window.jpgGlobalState = [];

            const isValidImage = (file) => {
                if (!file) return false;
                return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
            };

            filesArr.forEach(file => {
                if (isValidImage(file)) {
                    window.jpgGlobalState.push(file);
                }
            });

            if (window.jpgGlobalState.length > 0) {
                window.runJpgToPdf(window.jpgGlobalState);
            }

            // CRITICAL RESET
            e.target.value = '';
        }
    });

})();

window.runJpgToPdf = async function(files) {
    console.log("window.runJpgToPdf triggered with files:", files);
    
    // Prevent duplicate execution from simultaneous event listeners
    if (window._isJpgProcessing) return;
    window._isJpgProcessing = true;
    
    // Release the lock slightly later, allowing UI setup to complete before next possible trigger
    setTimeout(() => { window._isJpgProcessing = false; }, 500);

    if (!files || files.length === 0) return;

    // Resolve global state correctly in case called from outside bypassing our handleFiles
    if (files !== window.jpgGlobalState) {
        if (!window.jpgGlobalState) window.jpgGlobalState = [];
        const isValidImage = (file) => {
            if (!file) return false;
            return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
        };
        const newValidFiles = Array.from(files).filter(isValidImage);
        window.jpgGlobalState = window.jpgGlobalState.concat(newValidFiles);
    }

    const imageFiles = window.jpgGlobalState;

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
        pagePreviewBox.style.cssText = 'background: #fff; display: flex; justify-content: center; align-items: center; border: 2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; border-radius: 4px; flex-shrink: 0;';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none;';
        
        pagePreviewBox.appendChild(img);
        gallery.appendChild(pagePreviewBox);
    });

    const updateLayoutPreview = () => {
        const ori = document.getElementById('jpg-orientation').value;
        const previewBoxes = document.querySelectorAll('.page-preview-box');
        
        previewBoxes.forEach(box => {
            if (ori === 'l') {
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

            const orientation = document.getElementById('jpg-orientation').value;
            const pageSize = document.getElementById('jpg-size').value;
            const marginPx = parseInt(document.getElementById('jpg-margin').value, 10);

            // Approximation of pixel to mm 
            const marginMm = marginPx === 0 ? 0 : (marginPx === 15 ? 10 : 20);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: pageSize
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < imageFiles.length; i++) {
                const imgFile = imageFiles[i];
                if (statusLabel) statusLabel.innerText = `Converting: ${imgFile.name} (${i+1}/${imageFiles.length})`;

                if (i > 0) {
                    doc.addPage(pageSize, orientation);
                }

                const imageUrl = URL.createObjectURL(imgFile);
                const safeId = 'img-j-' + Date.now() + '-' + i;

                const img = await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.id = safeId;
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = imageUrl;
                });

                const maxW = pageWidth - (marginMm * 2);
                const maxH = pageHeight - (marginMm * 2);
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

                const x = marginMm + (maxW - drawW) / 2;
                const y = marginMm + (maxH - drawH) / 2;

                const fileExt = imgFile.name.split('.').pop().toLowerCase();
                let imgFormat = fileExt === 'png' ? 'PNG' : 'JPEG';
                if (imgFile.type === 'image/png') imgFormat = 'PNG';

                doc.addImage(img, imgFormat, x, y, drawW, drawH);
                
                // Release object URL memory for performance on 10MB+ images
                URL.revokeObjectURL(imageUrl);
            }

            // ── SUCCESS UI & DOWNLOAD ──
            doc.save('KELLYNEPDF_JPG_TO_PDF.pdf');

            if (titleBox) {
                titleBox.innerText = 'CONVERSION SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';
                titleBox.style.fontSize = '22px';
                titleBox.style.fontWeight = '900';
            }

            if (statusLabel) {
                statusLabel.innerHTML = `${imageFiles.length} IMAGES CONVERTED SUCCESSFULLY`;
                statusLabel.style.color = '#008000';
            }

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) dropZone.classList.add('success-tool-glow');
            
            // Remove dropdowns and preview upon success for cleaner UI
            if (dropdownContainer) dropdownContainer.style.display = 'none';

            // Clear global state on success
            window.jpgGlobalState = [];

            // ── "BACK TO HOME" Button — Solid Black (#111) ──
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; text-transform: uppercase;">BACK TO HOME</span>`;
            
            const finalStyles = {
                'display': 'inline-block',
                'background-color': '#111111',
                'color': '#ffffff',
                'border': 'none',
                'padding': '18px 45px',
                'border-radius': '35px',
                'width': 'auto',
                'margin': '25px auto 0',
                'cursor': 'pointer',
                'opacity': '1',
                'visibility': 'visible',
                'font-weight': '900',
                'box-shadow': '0 10px 25px rgba(0,0,0,0.2)',
                'text-align': 'center',
                'text-decoration': 'none',
                'z-index': '9999',
                'position': 'relative',
                'pointer-events': 'all'
            };

            Object.keys(finalStyles).forEach(key => {
                btn.style.setProperty(key, finalStyles[key], 'important');
            });

            btn.onclick = (e2) => {
                e2.stopPropagation();
                e2.stopImmediatePropagation();
                e2.preventDefault();
                console.log("Back to Home Clicked - Hard Refreshing...");
                window.location.reload(true);
            };

        } catch (err) {
            console.error("Conversion Error:", err);
            if (statusLabel) {
                statusLabel.innerHTML = `<span style="color: #ff0000; font-weight: 900;">CONVERSION FAILED</span>`;
            }
            setTimeout(() => window.resetUI(), 3000);
        }
    };
};
