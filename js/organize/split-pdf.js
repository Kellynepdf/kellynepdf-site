// js/organize/split-pdf.js

window.runSplit = async function(files) {
    const file = files[0];
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');

    btn.innerHTML = `<span style="color: white; font-weight: 900;">PREPARING TO SPLIT</span> <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
    btn.style.backgroundColor = "#e5322d"; 
    btn.style.color = "#fff";
    btn.style.border = "none";

    try {
        const fileArrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
        const pageCount = sourcePdf.getPageCount();
        
        // Use prompt for range (simple UX as requested initially per existing pattern)
        // Auto-Trigger: Once the user drops a file AND selects the split range.
        const range = prompt(`PDF has ${pageCount} pages. Enter numbers to extract/split (e.g., 1, 3-5) or "all" to split every page:`, "all");

        if (!range) {
            window.resetUI();
            return;
        }

        btn.innerHTML = `<span style="color: white; font-weight: 900;">SPLITTING PDF</span> <svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;

        const selectedPages = [];
        if (range.toLowerCase() === 'all') {
            for (let i = 1; i <= pageCount; i++) selectedPages.push(i);
        } else {
            range.split(',').forEach(p => {
                if (p.includes('-')) {
                    const [s, e] = p.split('-').map(Number);
                    for (let i = s; i <= e; i++) if (i > 0 && i <= pageCount) selectedPages.push(i);
                } else {
                    const n = Number(p);
                    if (n > 0 && n <= pageCount) selectedPages.push(n);
                }
            });
        }

        if (selectedPages.length === 0) {
            if (statusLabel) statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">No valid pages selected!</span>`;
            setTimeout(window.resetUI, 3000);
            return;
        }

        // Create individual PDFs for each selected page
        const generatedPdfs = [];
        for (let i = 0; i < selectedPages.length; i++) {
            const pageNum = selectedPages[i];
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
            newPdf.addPage(copiedPages[0]);
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            generatedPdfs.push({
                name: `Kellynepdf_split page ${pageNum}.pdf`,
                blob: blob
            });
        }

        btn.innerHTML = `<span class="upload-label-text" id="status-label" style="color: white; font-weight: 900;">Your split files are ready!</span>`;
        if (titleBox) {
            titleBox.innerText = 'SPLIT SUCCESSFULLY COMPLETED';
            titleBox.style.color = '#008000';
            titleBox.style.fontSize = '24px';
            titleBox.style.fontWeight = '900';
        }
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.add('success-tool-glow');
        }

        if (generatedPdfs.length > 10) {
            // BULK PROCESSING (ZIP AUTOMATION)
            if (typeof JSZip === 'undefined') {
                // Failsafe in case JSZip doesn't load
                throw new Error("JSZip library not found for bulk split.");
            }
            const zip = new JSZip();
            generatedPdfs.forEach(pdfObj => {
                zip.file(pdfObj.name, pdfObj.blob);
            });
            
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `KELLYNE PDF_Bulk_Split.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } else {
            // INDIVIDUAL DOWNLOADS (<= 10 files)
            for (let i = 0; i < generatedPdfs.length; i++) {
                const pdfObj = generatedPdfs[i];
                const url = URL.createObjectURL(pdfObj.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = pdfObj.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Small delay to prevent browser from blocking multiple rapid downloads
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // Reset UI Button to 'BACK TO HOME'
        btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
        btn.style.backgroundColor = "transparent"; 
        btn.style.border = "1.5px solid #e5322d";
        btn.style.padding = "10px 25px";
        btn.style.borderRadius = "25px";
        btn.style.width = "auto";
        btn.style.margin = "0 auto";
        
        btn.onclick = (e2) => {
            e2.stopPropagation();
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
            }
            window.resetUI();
        };

    } catch (e) {
        console.error("Split Error:", e);
        if (titleBox) {
            titleBox.innerText = 'SPLIT FAILED';
            titleBox.style.color = '#e5322d';
            titleBox.style.fontSize = '24px';
        }
        
        btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px;">RESTORE HOME</span>`;
        btn.style.backgroundColor = "transparent"; 
        btn.style.border = "1.5px solid #e5322d";
        btn.style.padding = "10px 25px";
        btn.style.borderRadius = "25px";
        btn.style.width = "auto";
        btn.style.margin = "0 auto";
        
        btn.onclick = (e2) => {
            e2.stopPropagation();
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
            }
            window.resetUI();
        };
    }
};
