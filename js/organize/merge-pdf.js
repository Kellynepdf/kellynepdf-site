// js/organize/merge-pdf.js
// KELLYNE PDF - Professional Merge Engine

window.runMerge = async function(files) {
    console.log("window.runMerge triggered with files:", files);
    const titleBox = document.getElementById('tool-title-box');
    const btn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const statusLabel = document.getElementById('status-label');

    // ── Validation: Require 2+ PDFs ──
    if (!files || files.length < 2) {
        console.warn("Merge requires 2+ files, but received:", files ? files.length : 0);
        if (titleBox) {
            titleBox.innerText = 'NEED 2+ PDFS';
            titleBox.style.color = '#e5322d';
            setTimeout(() => {
                titleBox.style.color = '';
                window.resetUI();
            }, 2500);
        }
        return;
    }

    // Hide cloud icon during processing
    if (defaultIcon) defaultIcon.style.display = 'none';

    // ── STEP 1: Status Label → "READY TO MERGE" in Bold Red ──
    if (statusLabel) {
        statusLabel.innerHTML = `READY TO MERGE`;
        statusLabel.style.color = '#e5322d';
        statusLabel.style.fontWeight = '900';
        statusLabel.style.fontSize = '18px';
    }

    // ── "CLICK TO MERGE" Button — Solid Red (#e5322d), White text, fully opaque ──
    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">CLICK TO MERGE</span>`;
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
        z-index: 50;
        position: relative;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 10px 25px rgba(229, 50, 45, 0.3);
    `;
    btn.disabled = false;
    btn.classList.add('download-ready');

    // ── STEP 2: On Click — Execute Merge ──
    btn.onclick = async (e) => {
        console.log("CLICK TO MERGE button pressed.");
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        // ── STEP 3: "KELLYNE MERGING..." with Spinner ──
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE MERGING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = 'KELLYNE MERGING...';
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = 'bold';
        }

        try {
            console.log("Starting PDF merging process...");
            // ── pdf-lib Merge Logic ──
            const lib = window.PDFLib || window.pdfLib;
            if (!lib) {
                console.error("PDF processing engine (pdf-lib) not found. Checking window:", window);
                throw new Error("PDF processing engine not found.");
            }
            let mergedPdf = await lib.PDFDocument.create();
            console.log("Merged document created successfully.");
            let mergedCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                if (!isPdf) continue;

                if (statusLabel) {
                    statusLabel.innerText = `Adding: ${file.name}...`;
                }

                try {
                    let fileArrayBuffer = await file.arrayBuffer();
                    let sourcePdf = await lib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
                    let copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));

                    mergedCount++;

                    // Memory cleanup per iteration
                    sourcePdf = null;
                    fileArrayBuffer = null;
                    copiedPages = null;
                } catch (innerErr) {
                    console.warn(`Skipping file ${file.name} due to parse warning:`, innerErr);
                }
            }

            if (mergedCount === 0) {
                throw new Error('No valid PDF pages could be extracted from the uploaded files.');
            }

            let mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const finalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            const url = URL.createObjectURL(blob);

            // ✅ CRITICAL: Strict filename = KELLYNEPDF_MERGED.pdf
            const filename = 'KELLYNEPDF_MERGED.pdf';

            // Auto-download merged file
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // ── STEP 4: SUCCESS UI — Green State ──
            if (titleBox) {
                titleBox.innerText = 'MERGE SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';    // Bright Green
                titleBox.style.fontSize = '22px';    // Strict 22px
                titleBox.style.fontWeight = '900';
            }

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) {
                dropZone.classList.remove('active-tool');
                dropZone.classList.add('success-tool-glow');
            }

            // Status: Show merge details in green
            if (statusLabel) {
                statusLabel.innerHTML = `${mergedCount} PDFs Merged | Final: ${finalSizeMB} MB`;
                statusLabel.style.color = '#008000';
                statusLabel.style.fontWeight = '900';
                statusLabel.style.fontSize = '16px';
            }

            // ── STEP 5: "BACK TO HOME" Button — Solid Black (#111), White text ──
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

            btn.onclick = (e2) => {
                e2.stopPropagation();
                e2.stopImmediatePropagation();
                e2.preventDefault();
                // Full reset — NO folder/file dialog opens, only resetUI
                window.currentActiveTool = 'SELECT PDF FILES';
                window.resetUI();
            };

            // Memory cleanup
            mergedPdf = null;
            mergedPdfBytes = null;

        } catch (error) {
            console.error('Critical Merge Failure:', error);

            // ── Error State ──
            if (titleBox) {
                titleBox.innerText = 'MERGE FAILED';
                titleBox.style.color = '#e5322d';
                titleBox.style.fontSize = '22px';
            }

            if (statusLabel) {
                statusLabel.innerText = error.message || 'An error occurred during merge.';
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
};
