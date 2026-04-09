// js/optimize/compress-pdf.js

window.runCompress = async function(files) {
    const file = files[0];
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');
    const dropZone = document.getElementById('drop-zone');

    // 1. Live File Size & Estimation (The 'Ready' State)
    const mbSize = (file.size / (1024 * 1024)).toFixed(2);
    // target ~40% reduction means final size is ~60% of original. Prompt says "target ~40% reduction".
    // "Calculate an Estimated Compressed Size (target ~40% reduction)" 
    const estimatedSize = (mbSize * 0.6).toFixed(2); 

    if (titleBox) {
        titleBox.innerText = `ORIGINAL: ${mbSize} MB | ESTIMATED: ${estimatedSize} MB`;
        titleBox.style.color = '#e5322d'; 
    }

    if (dropZone) {
        dropZone.classList.add('active-tool');
        dropZone.classList.remove('success-tool-glow');
    }

    if (statusLabel) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">READY TO COMPRESS</span>`;
    }

    // Action Button
    btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 16px;">CLICK TO COMPRESS</span>`;
    btn.style.backgroundColor = "#e5322d";
    btn.style.border = "none";
    btn.style.padding = "15px 30px";
    btn.style.borderRadius = "25px";
    btn.style.width = "auto";
    btn.style.margin = "0 auto";

    btn.onclick = async (e) => {
        e.stopPropagation();
        
        // 2. Execution & Processing State
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 16px;">KELLYNE COMPRESSING...</span> <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
        btn.style.backgroundColor = "#e5322d";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.padding = "15px 30px";
        
        if (titleBox) {
            titleBox.innerText = 'COMPRESSING...';
        }
        if (statusLabel) {
            statusLabel.innerHTML = `<span style="color: #444; font-weight: bold;">Optimizing objects...</span>`;
        }

        try {
            // pdf-lib compression
            const fileArrayBuffer = await file.arrayBuffer();
            let sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer);
            let newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save({ useObjectStreams: false });
            const finalSizeMB = (pdfBytes.length / (1024 * 1024)).toFixed(2);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            // Memory Management
            sourcePdf = null;
            newPdf = null;
            
            // 3. Professional Naming & Green Success UI
            const finalName = "KELLYNE PDF_Compressed.pdf";
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = finalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if (titleBox) {
                titleBox.innerText = 'COMPRESSION SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';
                titleBox.style.fontSize = '22px';
            }
            if (dropZone) {
                dropZone.classList.remove('active-tool');
                dropZone.classList.add('success-tool-glow');
            }
            if (statusLabel) {
                statusLabel.innerHTML = `<span style="color: #008000; font-weight: 900; font-size: 18px;">Final Size: ${finalSizeMB} MB</span>`;
            }

            btn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
            btn.style.backgroundColor = "transparent"; 
            btn.style.border = "1.5px solid #e5322d";
            btn.style.padding = "10px 25px";
            btn.style.borderRadius = "25px";
            
            btn.onclick = (e2) => {
                e2.stopPropagation();
                if (titleBox) {
                    titleBox.style.color = ''; 
                    titleBox.style.fontSize = ''; 
                }
                window.resetUI();
            };

        } catch (err) {
            console.error("Compress Error:", err);
            if (titleBox) titleBox.innerText = 'COMPRESSION FAILED';
            if (dropZone) {
                dropZone.classList.remove('active-tool');
                dropZone.classList.remove('success-tool-glow');
            }
            btn.innerHTML = `<span style="color: #e5322d; font-weight: 700;">BACK TO HOME</span>`;
            btn.style.backgroundColor = "transparent";
            btn.style.border = "1.5px solid #e5322d";
            btn.onclick = (e2) => { e2.stopPropagation(); window.resetUI(); };
        }
    };
};
