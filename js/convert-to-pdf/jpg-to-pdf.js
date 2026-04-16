/**
 * KELLYNE PDF - Bulk JPG to PDF Engine
 * Logic: Convert multiple images into a single professional PDF document.
 */

window.runJpgToPdf = async function(files) {
    console.log("window.runJpgToPdf triggered with files:", files);
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

    // ── UI Implementation: Options ──
    const existingDropdowns = document.getElementById('jpg-settings-container');
    if (existingDropdowns) existingDropdowns.remove();

    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'jpg-settings-container';
    dropdownContainer.style.cssText = 'display: flex; justify-content: center; gap: 15px; margin: 15px 0; z-index: 100; position: relative; flex-wrap: wrap;';
    dropdownContainer.innerHTML = `
        <select id="jpg-orientation" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="p" selected>Portrait (Default)</option>
            <option value="l">Landscape</option>
        </select>
        <select id="jpg-size" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="a4" selected>A4 (Default)</option>
            <option value="letter">US Letter</option>
        </select>
        <select id="jpg-margin" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-weight: 700; color: #333; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <option value="0" selected>No margin (Default - 0px)</option>
            <option value="15">Small (~15px/10mm)</option>
            <option value="30">Big (~30px/20mm)</option>
        </select>
    `;
    
    // Inject dropdowns directly before the action button
    btn.parentNode.insertBefore(dropdownContainer, btn);

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
        margin: 20px auto 0;
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

            // Approximation of pixel to mm (1 px ~ 0.264583 mm) - but we can just use units in the standard mapping or simply treat 'margin' value mapped directly. The user requested: No margin=0px, Small=~15px/10mm, Big=~30px/20mm. Let's map directly to mm:
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
                // Also fallback to type if necessary
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
            
            // Remove dropdowns upon success for cleaner UI
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
