// js/organize/merge-pdf.js

window.runMerge = async function(files) {
    const titleBox = document.getElementById('tool-title-box');
    const btn = document.getElementById('action-button');

    if (files.length < 2) {
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

    // STEP 2: File Upload (Ready State)
    btn.innerHTML = `<span class="upload-label-text" id="status-label" style="color: white; font-weight: 900;">READY TO MERGE</span>`;
    btn.style.backgroundColor = "#e5322d"; 
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.classList.add('download-ready');

    btn.onclick = async (e) => {
        e.stopPropagation(); // Prevent file input modal from popping up again
        
        // STEP 3: Processing (Merging State)
        btn.innerHTML = `<span style="color: white; font-weight: 900;">KELLYNE MERGE PDF</span> <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
        
        try {
            // Initiate pdf-lib merging logic
            let mergedPdf = await PDFLib.PDFDocument.create();
            let mergedCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                if (!isPdf) continue;
                
                try {
                    let fileArrayBuffer = await file.arrayBuffer();
                    // Load with ignoreEncryption to suppress minor metadata errors
                    let sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
                    let copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                    
                    mergedCount++; // Track successful additions

                    // Keep memory clean
                    sourcePdf = null;
                    fileArrayBuffer = null;
                    copiedPages = null;
                } catch (innerErr) {
                    console.warn(`Skipping file ${file.name} due to parse warning:`, innerErr);
                    // Silently ignore minor PDF parsing issues
                }
            }

            if (mergedCount === 0) {
                throw new Error("No valid PDF pages could be extracted from the uploaded files.");
            }

            let mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Naming Convention
            const filename = "KELLYNE PDF_Merged.pdf";

            // Automatically Trigger Download First
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Dynamic Green Success State
            if (titleBox) {
                titleBox.innerText = 'MERGE SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';
                titleBox.style.fontSize = '24px'; // Sleek professional font
                titleBox.style.fontWeight = '900';
            }
            
            const dropZone = document.getElementById('drop-zone');
            if (dropZone) {
                dropZone.classList.remove('active-tool');
                dropZone.classList.add('success-tool-glow');
            }

            // Immediately reveal BACK TO HOME (sleek, chinnaga)
            btn.innerHTML = `<span style="color: white; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
            btn.style.backgroundColor = "#000"; 
            btn.style.border = "none";
            btn.style.padding = "12px 30px";
            btn.style.borderRadius = "25px";
            btn.style.width = "auto";
            btn.style.margin = "0 auto";
            btn.style.display = "flex";
            btn.style.justifyContent = "center";
            btn.style.alignItems = "center";
            
            btn.onclick = (e2) => {
                e2.stopPropagation();
                if (titleBox) {
                    titleBox.style.color = ''; // Revert core styling
                    titleBox.style.fontSize = ''; // Revert to base css size
                }
                window.resetUI();
            };

            // Memory cleanup
            mergedPdf = null;
            mergedPdfBytes = null;
            
        } catch (error) {
            console.error("Critical Merge Failure:", error);
            if (titleBox) {
                titleBox.innerText = 'MERGE FAILED';
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
};
