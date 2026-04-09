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

    // Display Sizes
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const estimatedSizeMB = (originalSizeMB * 0.5).toFixed(2); // Estimated 50% reduction

    titleBox.innerHTML = `ORIGINAL: ${originalSizeMB} MB | <span style="color: #e5322d;">ESTIMATED: ${estimatedSizeMB} MB</span>`;
    statusLabel.innerText = "READY TO COMPRESS";
    statusLabel.style.color = "#e5322d";

    actionBtn.innerHTML = `CLICK TO COMPRESS`;
    actionBtn.style.backgroundColor = "#e5322d";
    actionBtn.style.color = "white";
    actionBtn.disabled = false;

    actionBtn.onclick = async (e) => {
        e.stopPropagation();
        await startAdvancedCompression(file, titleBox, statusLabel, actionBtn);
    };
};

async function startAdvancedCompression(file, titleBox, statusLabel, actionBtn) {
    try {
        actionBtn.innerHTML = `KELLYNE COMPRESSING... <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style><svg class="spinner-small" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;vertical-align:middle;margin-left:8px;"><circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle></svg>`;
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

        // Moderate compression DPI (96)
        const scale = 1.0; 

        for (let i = 1; i <= pdf.numPages; i++) {
            statusLabel.innerText = `Processing page ${i} of ${pdf.numPages}...`;
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport }).promise;
            
            // Compress quality set to 0.4 (40%)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
            const base64Data = dataUrl.split(',')[1];
            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const imgBytes = new Uint8Array(len);
            for (let j = 0; j < len; j++) {
                imgBytes[j] = binaryString.charCodeAt(j);
            }
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

        // Success UI
        titleBox.innerText = "COMPRESSION SUCCESSFULLY COMPLETED";
        titleBox.style.color = "#008000";
        titleBox.style.fontSize = "22px";
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.add('success-tool-glow');
        }

        statusLabel.innerHTML = `Final Size: <b>${finalSizeMB} MB</b>. File saved successfully!`;
        statusLabel.style.color = "#008000";

        actionBtn.disabled = false;
        actionBtn.innerHTML = `DOWNLOAD COMPRESSED PDF`;
        actionBtn.style.backgroundColor = "#008000";

        actionBtn.onclick = (e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = url;
            link.download = `KELLYNE PDF_Compressed.pdf`;
            link.click();
            
            setTimeout(() => {
                actionBtn.innerHTML = "BACK TO HOME";
                actionBtn.style.backgroundColor = "#111"; // A sleek dark fallback
                actionBtn.style.color = "white";
                actionBtn.onclick = () => window.resetUI();
            }, 2000);
        };

    } catch (err) {
        console.error(err);
        statusLabel.innerText = "Error during compression. Please try again.";
        actionBtn.disabled = false;
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool');
            dropZone.classList.remove('success-tool-glow');
        }
        actionBtn.innerHTML = `BACK TO HOME`;
        actionBtn.style.backgroundColor = "transparent";
        actionBtn.style.border = "1.5px solid #e5322d";
        actionBtn.onclick = (e2) => { e2.stopPropagation(); window.resetUI(); };
    }
}
