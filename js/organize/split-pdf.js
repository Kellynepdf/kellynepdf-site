// js/organize/split-pdf.js

window.runSplit = async function(files) {
    const file = files[0];
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const defaultIcon = document.getElementById('default-upload-icon');

    // Hide cloud icon during processing
    if (defaultIcon) defaultIcon.style.display = 'none';

    btn.innerHTML = `<span style="color: white; font-weight: 900;">PREPARING TO SPLIT</span> <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
    btn.style.backgroundColor = "#e5322d"; 
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.display = "flex";

    try {
        const fileArrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
        const pageCount = sourcePdf.getPageCount();
        
        // Update status
        const statusLabel = document.getElementById('status-label');
        if (statusLabel) {
            statusLabel.innerHTML = `Splitting ${pageCount} pages...`;
        }

        btn.innerHTML = `<span style="color: white; font-weight: 900;">SPLITTING PDF</span> <svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;

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

        // ✅ Standardized Success UI
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

        // ✅ Status Label: Show split details
        if (statusLabel) {
            statusLabel.innerHTML = `${pageCount} pages split successfully`;
            statusLabel.style.color = '#008000';
            statusLabel.style.fontWeight = '600';
            statusLabel.style.fontSize = '15px';
        }

        // ALWAYS BUNDLE AS ZIP (JSZip)
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip library not found for bundling.");
        }
        
        const zip = new JSZip();
        generatedPdfs.forEach(pdfObj => {
            zip.file(pdfObj.name, pdfObj.blob);
        });
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `Kellynepdf_split_bundle.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ✅ BACK TO HOME Button — Pill/Rounded, Black #111, White text
        btn.innerHTML = `<span style="color: white; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
        btn.style.backgroundColor = "#111"; 
        btn.style.border = "none";
        btn.style.padding = "12px 30px";
        btn.style.borderRadius = "25px";
        btn.style.width = "auto";
        btn.style.margin = "0 auto";
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.cursor = "pointer";
        
        btn.onclick = (e2) => {
            e2.stopPropagation();
            window.currentActiveTool = 'SELECT PDF FILES';
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
                titleBox.innerText = 'SELECT PDF FILES';
            }
            window.resetUI();
        };

    } catch (e) {
        console.error("Split Error:", e);
        if (titleBox) {
            titleBox.innerText = 'SPLIT FAILED';
            titleBox.style.color = '#e5322d';
            titleBox.style.fontSize = '22px';
        }
        
        btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px;">RESTORE HOME</span>`;
        btn.style.backgroundColor = "transparent"; 
        btn.style.border = "1.5px solid #e5322d";
        btn.style.padding = "10px 25px";
        btn.style.borderRadius = "25px";
        btn.style.width = "auto";
        btn.style.margin = "0 auto";
        btn.style.cursor = "pointer";
        
        btn.onclick = (e2) => {
            e2.stopPropagation();
            window.currentActiveTool = 'SELECT PDF FILES';
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
            }
            window.resetUI();
        };
    }
};
