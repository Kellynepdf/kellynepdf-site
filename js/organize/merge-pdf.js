// js/organize/merge-pdf.js
// KELLYNE PDF - Professional Merge Engine

window.runMerge = async function(files) {
    const titleBox = document.getElementById('tool-title-box');
    const btn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const statusLabel = document.getElementById('status-label');

    // ── Validation: Require 2+ PDFs ──
    if (!files || files.length < 2) {
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

    // ── STEP 1: "CLICK TO MERGE" — Red Background Button ──
    if (statusLabel) {
        statusLabel.innerHTML = `${files.length} PDF files selected — Ready to merge`;
        statusLabel.style.color = '#444';
        statusLabel.style.fontWeight = '500';
    }

    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1px;">CLICK TO MERGE</span>`;
    btn.style.backgroundColor = '#e5322d';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.display = 'flex';
    btn.style.justifyContent = 'center';
    btn.style.alignItems = 'center';
    btn.style.padding = '15px 40px';
    btn.style.borderRadius = '25px';
    btn.style.cursor = 'pointer';
    btn.style.width = 'auto';
    btn.style.margin = '0 auto';
    btn.style.transition = 'background-color 0.3s ease, transform 0.15s ease';
    btn.disabled = false;
    btn.classList.add('download-ready');

    // ── STEP 2: On Click — Execute Merge ──
    btn.onclick = async (e) => {
        e.stopPropagation(); // Prevent file-input modal from firing

        // ── STEP 3: "KELLYNE MERGING..." with Spinner ──
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE MERGING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = 'Processing your files, please wait...';
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = 'bold';
        }

        try {
            // ── pdf-lib Merge Logic ──
            let mergedPdf = await PDFLib.PDFDocument.create();
            let mergedCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                if (!isPdf) continue;

                if (statusLabel) {
                    statusLabel.innerText = `Merging file ${i + 1} of ${files.length}...`;
                }

                try {
                    let fileArrayBuffer = await file.arrayBuffer();
                    // ignoreEncryption: bypass minor metadata/encryption issues
                    let sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
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

            // ✅ CRITICAL: Strict filename = KELLYNE_MERGED.pdf
            const filename = 'KELLYNE_MERGED.pdf';

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

            // Status: Show merge details
            if (statusLabel) {
                statusLabel.innerHTML = `${mergedCount} files merged successfully | Final size: ${finalSizeMB} MB`;
                statusLabel.style.color = '#008000';
                statusLabel.style.fontWeight = '600';
                statusLabel.style.fontSize = '15px';
            }

            // ── STEP 5: "BACK TO HOME" Button — Solid Black #111, White text ──
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<span style="color: white; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
            btn.style.backgroundColor = '#111';
            btn.style.border = 'none';
            btn.style.padding = '12px 30px';
            btn.style.borderRadius = '25px';
            btn.style.width = 'auto';
            btn.style.margin = '0 auto';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'center';
            btn.style.alignItems = 'center';
            btn.style.transition = 'background-color 0.3s ease, transform 0.15s ease';

            btn.onclick = (e2) => {
                e2.stopPropagation();
                // Full reset back to home
                window.currentActiveTool = 'SELECT PDF FILES';
                if (titleBox) {
                    titleBox.style.color = '';
                    titleBox.style.fontSize = '';
                    titleBox.style.fontWeight = '';
                    titleBox.innerText = 'SELECT PDF FILES';
                }
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
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px;">RESTORE HOME</span>`;
            btn.style.backgroundColor = 'transparent';
            btn.style.border = '1.5px solid #e5322d';
            btn.style.padding = '10px 25px';
            btn.style.borderRadius = '25px';
            btn.style.width = 'auto';
            btn.style.margin = '0 auto';
            btn.style.cursor = 'pointer';

            btn.onclick = (e2) => {
                e2.stopPropagation();
                window.currentActiveTool = 'SELECT PDF FILES';
                if (titleBox) {
                    titleBox.style.color = '';
                    titleBox.style.fontSize = '';
                    titleBox.style.fontWeight = '';
                }
                window.resetUI();
            };
        }
    };
};
