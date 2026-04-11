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

    // ── STEP 2: "READY TO CONVERT" UI ──
    if (statusLabel) {
        statusLabel.innerHTML = `${imageFiles.length} IMAGES READY`;
        statusLabel.style.color = '#e5322d';
        statusLabel.style.fontWeight = '900';
        statusLabel.style.fontSize = '18px';
    }

    // Show "CLICK TO CONVERT" button — Solid Red (#e5322d)
    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">CLICK TO CONVERT</span>`;
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

    // ── STEP 3: Conversion Execution ──
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
            if (!window.PDFLib) throw new Error("PDFLib not loaded");
            const pdfDoc = await PDFLib.PDFDocument.create();

            for (let i = 0; i < imageFiles.length; i++) {
                const imgFile = imageFiles[i];
                if (statusLabel) statusLabel.innerText = `Converting: ${imgFile.name} (${i+1}/${imageFiles.length})`;
                
                const imgBytes = await imgFile.arrayBuffer();
                let image;
                
                const lowerName = imgFile.name.toLowerCase();
                if (imgFile.type === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
                    image = await pdfDoc.embedJpg(imgBytes);
                } else if (imgFile.type === 'image/png' || lowerName.endsWith('.png')) {
                    image = await pdfDoc.embedPng(imgBytes);
                } else {
                    continue; // Skip unknown
                }

                // Add A4 page (595.28 x 841.89)
                const page = pdfDoc.addPage([595.28, 841.89]);
                const { width, height } = image.scale(1);
                
                const pageWidth = page.getWidth();
                const pageHeight = page.getHeight();
                
                // Calculate scale to fit page while maintaining aspect ratio
                const scale = Math.min(pageWidth / width, pageHeight / height);
                const drawWidth = width * scale;
                const drawHeight = height * scale;

                page.drawImage(image, {
                    x: (pageWidth - drawWidth) / 2,
                    y: (pageHeight - drawHeight) / 2,
                    width: drawWidth,
                    height: drawHeight,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // ── SUCCESS UI & DOWNLOAD ──
            const link = document.createElement('a');
            link.href = url;
            link.download = 'KELLYNEPDF_JPG_TO_PDF.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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

            // ── "BACK TO HOME" Button — Solid Black (#111) ──
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; text-transform: uppercase;">BACK TO HOME</span>`;
            
            // Force styling
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
