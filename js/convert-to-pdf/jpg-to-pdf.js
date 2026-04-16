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
    let forceInput = document.getElementById('force-jpg-input');
    if (!forceInput) {
        forceInput = document.createElement('input');
        forceInput.type = 'file';
        forceInput.id = 'force-jpg-input';
        forceInput.multiple = true;
        forceInput.accept = 'image/jpeg, image/png, image/jpg';
        forceInput.style.display = 'none';
        document.body.appendChild(forceInput);
    }
    
    if (dropZone) {
        // 2. Aggressive Click Binding
        dropZone.addEventListener('click', (e) => {
            if (window.currentActiveTool === 'JPG TO PDF') {
                const btn = document.getElementById('action-button');
                if (!btn || !btn.classList.contains('download-ready')) {
                    document.getElementById('force-jpg-input').click();
                }
            }
        });
    }

    // 3. Robust Change Event & Reset
    forceInput.addEventListener('change', (e) => {
        if (window.currentActiveTool === 'JPG TO PDF') {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            
            const extractedFiles = Array.from(files);
            window.runJpgToPdf(extractedFiles);
            
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

    // Ignore internal init calls with empty array or undefined
    if (!files || files.length === 0) return;

    const titleBox = document.getElementById('tool-title-box');
    const btn = document.getElementById('action-button');
    const statusLabel = document.getElementById('status-label');
    const defaultIcon = document.getElementById('default-upload-icon');

    // ── STEP 1: Filter for valid images ──
    const imageFiles = files.filter(f => {
        const type = f.type.toLowerCase();
        const name = f.name.toLowerCase();
        return type.includes('image/jpeg') || type.includes('image/png') || 
               name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
    });

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
    dropdownContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; margin: 15px 0; z-index: 100; position: relative;';

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

    // Dynamic Visual Feedback Box
    const previewBoxWrapper = document.createElement('div');
    previewBoxWrapper.style.cssText = 'margin-top: 10px; display: flex; flex-direction: column; align-items: center;';
    previewBoxWrapper.innerHTML = `
        <span style="font-size: 13px; font-weight: 800; color: #888; margin-bottom: 8px; text-transform: uppercase;">Layout Preview</span>
        <div id="layout-preview-box" style="height: 85px; aspect-ratio: 210/297; border: 2.5px solid #e5322d; background: #fffdfd; border-radius: 4px; box-shadow: 0 6px 12px rgba(229,50,45,0.1); transition: aspect-ratio 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
    `;

    dropdownContainer.appendChild(selectsDiv);
    dropdownContainer.appendChild(previewBoxWrapper);
    
    // Inject dropdowns and preview directly before the action button
    btn.parentNode.insertBefore(dropdownContainer, btn);

    const updateLayoutPreview = () => {
        const ori = document.getElementById('jpg-orientation').value;
        const size = document.getElementById('jpg-size').value;
        const preview = document.getElementById('layout-preview-box');
        if (!preview) return;
        
        let w, h;
        if (size === 'a4') { w = 210; h = 297; }
        else if (size === 'a3') { w = 297; h = 420; }
        else if (size === 'letter') { w = 215.9; h = 279.4; }
        else { w = 210; h = 297; }

        if (ori === 'l') {
            const temp = w; w = h; h = temp;
        }
        
        preview.style.aspectRatio = `${w} / ${h}`;
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

                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = ev => resolve(ev.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imgFile);
                });

                const img = await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = dataUrl;
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

                doc.addImage(dataUrl, imgFormat, x, y, drawW, drawH);
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
