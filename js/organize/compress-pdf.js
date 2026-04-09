/**
 * KELLYNE PDF - Advanced Compression Engine
 * Logic: Page-to-Image Rendering for Maximum Size Reduction
 */

window.runCompress = async function(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');

    // Hide cloud icon during processing
    if (defaultIcon) defaultIcon.style.display = 'none';

    // Display Sizes
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const estimatedSizeMB = (originalSizeMB * 0.2).toFixed(2); // Estimated 80% reduction

    titleBox.innerHTML = `ORIGINAL: ${originalSizeMB} MB | <span style="color: #e5322d;">ESTIMATED: ${estimatedSizeMB} MB</span>`;

    if (statusLabel) {
        statusLabel.innerText = "Compressing...";
        statusLabel.style.color = "#e5322d";
        statusLabel.style.fontWeight = "bold";
    }

    actionBtn.style.display = 'flex';
    actionBtn.style.flexDirection = 'column';
    actionBtn.style.justifyContent = 'center';
    actionBtn.style.alignItems = 'center';
    actionBtn.style.padding = '15px 40px';
    actionBtn.style.borderRadius = '20px';
    actionBtn.style.border = '2px solid transparent';
    
    // ZERO-CLICK FLOW: Start compression automatically
    await startAdvancedCompression(file, titleBox, statusLabel, actionBtn, originalSizeMB);
};

async function startAdvancedCompression(file, titleBox, statusLabel, actionBtn, originalSizeMB) {
    try {
        actionBtn.innerHTML = `KELLYNE COMPRESSING... <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner-small" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
        actionBtn.style.backgroundColor = "#e5322d";
        actionBtn.style.color = "white";
        actionBtn.disabled = true;

        if (!window.pdfjsLib) throw new Error('pdfjsLib is not loaded');
        // pdf.js worker config (global if needed)
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        }

        // Load PDF using PDF.js
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const newDoc = await PDFLib.PDFDocument.create();

        // High compression target (Scale 0.6)
        const scale = 0.6; 

        for (let i = 1; i <= pdf.numPages; i++) {
            if (statusLabel) {
                statusLabel.innerText = `Processing page ${i} of ${pdf.numPages}...`;
            }
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport }).promise;
            
            // Compress quality set to 0.2 (20% for High Compression target)
            const imgBytes = await new Promise(resolve => {
                canvas.toBlob(async (blob) => {
                    const buffer = await blob.arrayBuffer();
                    resolve(new Uint8Array(buffer));
                }, 'image/jpeg', 0.2);
            });
            const img = await newDoc.embedJpg(imgBytes);
            
            const p = newDoc.addPage([viewport.width, viewport.height]);
            p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        let pdfBytes = await newDoc.save();
        
        // Smart Check: use original if compressed size is worse
        if (pdfBytes.length >= file.size) {
            const freshBuffer = await file.arrayBuffer();
            pdfBytes = new Uint8Array(freshBuffer);
        }
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        const url = URL.createObjectURL(blob);

        // ✅ Standardized Success UI
        if (titleBox) {
            titleBox.innerText = 'COMPRESS SUCCESSFULLY COMPLETED';
            titleBox.style.color = '#008000';    // Bright Green
            titleBox.style.fontSize = '22px';    // Strict 22px
            titleBox.style.fontWeight = '900';
        }
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.add('success-tool-glow');
        }

        // ✅ Status Label: Show compression details
        if (statusLabel) {
            statusLabel.innerHTML = `Original: ${originalSizeMB} MB → Final: ${finalSizeMB} MB`;
            statusLabel.style.color = '#008000';
            statusLabel.style.fontWeight = '600';
            statusLabel.style.fontSize = '15px';
        }

        // Auto Download with ✅ Strict Naming Convention
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Kellynepdf_compressed.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ✅ BACK TO HOME Button — Pill/Rounded, Black #111, White text
        actionBtn.disabled = false;
        actionBtn.innerHTML = `<span style="color: white; font-weight: 700; font-size: 14px; text-transform: uppercase;">BACK TO HOME</span>`;
        actionBtn.style.backgroundColor = "#111";
        actionBtn.style.border = "none";
        actionBtn.style.padding = "12px 30px";
        actionBtn.style.borderRadius = "25px";
        actionBtn.style.width = "auto";
        actionBtn.style.margin = "0 auto";
        actionBtn.style.display = "flex";
        actionBtn.style.justifyContent = "center";
        actionBtn.style.alignItems = "center";
        actionBtn.style.cursor = "pointer";
        
        actionBtn.onclick = (e2) => {
            e2.stopPropagation();
            window.currentActiveTool = 'SELECT PDF FILES';
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
                titleBox.innerText = 'SELECT PDF FILES';
            }
            window.resetUI();
        };
        
    } catch (err) {
        console.error("Compression Error:", err);
        if (statusLabel) {
            statusLabel.innerText = "Error during compression. Please try again.";
            statusLabel.style.color = "#e5322d";
        }
        actionBtn.disabled = false;
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.remove('success-tool-glow');
        }

        actionBtn.innerHTML = `<span style="color: #e5322d; font-weight: 700; font-size: 14px;">RESTORE HOME</span>`;
        actionBtn.style.backgroundColor = "transparent";
        actionBtn.style.border = "1.5px solid #e5322d";
        actionBtn.style.padding = "10px 25px";
        actionBtn.style.borderRadius = "25px";
        actionBtn.style.width = "auto";
        actionBtn.style.margin = "0 auto";
        actionBtn.style.cursor = "pointer";
        actionBtn.onclick = (e2) => {
            e2.stopPropagation();
            window.currentActiveTool = 'SELECT PDF FILES';
            if (titleBox) {
                titleBox.style.color = ''; 
                titleBox.style.fontSize = ''; 
            }
            window.resetUI();
        };
    }
}
