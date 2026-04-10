// js/organize/split-pdf.js

window.runSplit = async function(files) {
    const file = files[0];
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const defaultIcon = document.getElementById('default-upload-icon');

    // Hide cloud icon during processing
    if (defaultIcon) defaultIcon.style.display = 'none';

    btn.innerHTML = `<span style="color: white; font-weight: 900;">PREPARING TO SPLIT</span> <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
    btn.style.cssText = `
        display: flex !important;
        justify-content: center;
        align-items: center;
        background-color: #e5322d !important;
        color: #fff !important;
        border: none;
        padding: 18px 45px;
        border-radius: 30px;
        cursor: not-allowed;
        width: auto;
        margin: 20px auto 0;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 50;
        position: relative;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 10px 25px rgba(229, 50, 45, 0.3);
    `;
    btn.disabled = true;

    try {
        const fileArrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
        const pageCount = sourcePdf.getPageCount();
        
        // Update status
        const statusLabel = document.getElementById('status-label');
        if (statusLabel) {
            statusLabel.innerHTML = `Splitting ${pageCount} pages...`;
        }

        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE SPLITTING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = 'KELLYNE SPLITTING...';
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = 'bold';
        }

        // Create individual PDFs for each page
        const generatedPdfs = [];
        for (let i = 1; i <= pageCount; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, [i - 1]);
            newPdf.addPage(copiedPages[0]);
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            // ✅ Strict Naming: Kellynepdf_split_page_[number].pdf
            generatedPdfs.push({
                name: `Kellynepdf_split_page_${i}.pdf`,
                blob: blob
            });

            // Update progress
            if (statusLabel) {
                statusLabel.innerHTML = `Processing page ${i} of ${pageCount}...`;
            }
        }

        // ✅ ALWAYS BUNDLE AS ZIP (JSZip)
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip library not found for bundling.");
        }
        
        const zip = new JSZip();
        generatedPdfs.forEach(pdfObj => {
            zip.file(pdfObj.name, pdfObj.blob);
        });
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const finalSizeMB = (zipBlob.size / (1024 * 1024)).toFixed(2);
        const zipUrl = URL.createObjectURL(zipBlob);

        // ✅ CRITICAL: Strict filename = KELLYNEPDF_SPLIT.zip
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `KELLYNEPDF_SPLIT.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ── SUCCESS UI — Green State (Matches Merge PDF Pattern) ──
        if (titleBox) {
            titleBox.innerText = 'SPLIT SUCCESSFULLY COMPLETED';
            titleBox.style.color = '#008000';    // Bright Green
            titleBox.style.fontSize = '22px';    // Strict 22px
            titleBox.style.fontWeight = '900';
        }
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.add('success-tool-glow');
        }

        // ✅ Status Label: Show split details in green
        if (statusLabel) {
            statusLabel.innerHTML = `${pageCount} Pages Split | Bundle: ${finalSizeMB} MB`;
            statusLabel.style.color = '#008000';
            statusLabel.style.fontWeight = '900';
            statusLabel.style.fontSize = '16px';
        }

        // ── "BACK TO HOME" Button — Solid Black (#111), White text (Matches Merge PDF) ──
        btn.disabled = false;
        btn.innerHTML = `<span style="color: white; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">BACK TO HOME</span>`;
        btn.style.cssText = `
            display: flex !important;
            justify-content: center;
            align-items: center;
            background-color: #111 !important;
            color: #fff !important;
            border: none;
            padding: 15px 35px;
            border-radius: 30px;
            width: auto;
            margin: 20px auto 0;
            cursor: pointer;
            opacity: 1 !important;
            visibility: visible !important;
            z-index: 50;
            position: relative;
            transition: all 0.3s ease;
            font-weight: 800;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        `;

        // ✅ CRITICAL: Fast Page Refresh — window.location.reload()
        // Must NOT open file explorer or download folder
        btn.onclick = (e2) => {
            e2.stopPropagation();
            e2.stopImmediatePropagation();
            e2.preventDefault();
            // Full logic restoration: Fast Page Refresh as requested
            window.location.reload();
        };

        // Memory cleanup
        URL.revokeObjectURL(zipUrl);

    } catch (e) {
        console.error("Split Error:", e);
        const statusLabel = document.getElementById('status-label');

        if (titleBox) {
            titleBox.innerText = 'SPLIT FAILED';
            titleBox.style.color = '#e5322d';
            titleBox.style.fontSize = '22px';
        }

        if (statusLabel) {
            statusLabel.innerText = e.message || 'An error occurred during split.';
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = '600';
        }

        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.remove('success-tool-glow');
        }

        btn.disabled = false;
        btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px;">RESTORE HOME</span>`;
        btn.style.cssText = `
            display: flex !important;
            justify-content: center;
            align-items: center;
            background-color: transparent;
            border: 1.5px solid #e5322d;
            padding: 10px 25px;
            border-radius: 25px;
            width: auto;
            margin: 15px auto 0;
            cursor: pointer;
            opacity: 1 !important;
            z-index: 50;
            position: relative;
        `;

        btn.onclick = (e2) => {
            e2.stopPropagation();
            e2.stopImmediatePropagation();
            e2.preventDefault();
            window.currentActiveTool = 'SELECT PDF FILES';
            window.resetUI();
        };
    }
};
