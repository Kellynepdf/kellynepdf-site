/**
 * KELLYNE PDF - Advanced Compression Engine
 * Logic: Page-to-Image Rendering for Maximum Size Reduction (90% Target)
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

    // ── STEP 1: Instant Size Estimation — 90% Reduction Target ──
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const estimatedSizeMB = (originalSizeMB * 0.1).toFixed(2); // 10% of original = 90% reduction

    if (titleBox) {
        titleBox.innerHTML = `ORIGINAL: ${originalSizeMB} MB | <span style="color: #e5322d;">ESTIMATED: ${estimatedSizeMB} MB</span>`;
        titleBox.style.color = '';
        titleBox.style.fontSize = '';
        titleBox.style.fontWeight = '900';
    }

    // ── Status Label → "READY TO COMPRESS" in Bold Red ──
    if (statusLabel) {
        statusLabel.innerHTML = `<strong>READY TO COMPRESS</strong>`;
        statusLabel.style.color = '#ff0000'; // Bold Red
        statusLabel.style.fontWeight = '900';
        statusLabel.style.fontSize = '20px';
    }

    // ── "CLICK TO COMPRESS" Button — Solid Red, White text ──
    actionBtn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">CLICK TO COMPRESS</span>`;
    actionBtn.style.cssText = `
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
    actionBtn.disabled = false;
    actionBtn.classList.add('download-ready');

    // ── STEP 2: On Click — Execute Compression ──
    actionBtn.onclick = async (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        // ── STEP 3: "KELLYNE COMPRESSING..." with Spinner ──
        actionBtn.disabled = true;
        actionBtn.style.cursor = 'not-allowed';
        actionBtn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE COMPRESSING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = 'KELLYNE COMPRESSING...';
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = 'bold';
        }

        try {
            if (!window.pdfjsLib) throw new Error('pdfjsLib is not loaded');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const newDoc = await PDFLib.PDFDocument.create();

            // ── 90% Compression: scale 0.5, quality 0.1 ──
            const scale = 0.5;

            for (let i = 1; i <= pdf.numPages; i++) {
                if (statusLabel) statusLabel.innerText = `Compressing page ${i} of ${pdf.numPages}...`;
                
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(viewport.width);
                canvas.height = Math.round(viewport.height);
                const ctx = canvas.getContext('2d');

                await page.render({ canvasContext: ctx, viewport }).promise;
                
                const imgBytes = await new Promise(resolve => {
                    canvas.toBlob(async (blob) => {
                        const buffer = await blob.arrayBuffer();
                        resolve(new Uint8Array(buffer));
                    }, 'image/jpeg', 0.1); // Quality 0.1 for 90% reduction
                });
                const img = await newDoc.embedJpg(imgBytes);
                
                const origViewport = page.getViewport({ scale: 1.0 });
                const p = newDoc.addPage([origViewport.width, origViewport.height]);
                p.drawImage(img, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
            }

            let pdfBytes = await newDoc.save();
            
            // Auto-fallback if somehow larger
            if (pdfBytes.length >= file.size) {
                const freshBuffer = await file.arrayBuffer();
                pdfBytes = new Uint8Array(freshBuffer);
            }
            
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const finalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            const url = URL.createObjectURL(blob);

            // ── STEP 4: Success UI & Auto Download ──
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Kellynepdf_compressed.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (titleBox) {
                titleBox.innerText = 'COMPRESSION SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000'; // Bright Green
                titleBox.style.fontSize = '22px';
                titleBox.style.fontWeight = '900';
            }
            
            if (statusLabel) {
                statusLabel.innerHTML = `Original: ${originalSizeMB} MB → Final: ${finalSizeMB} MB`;
                statusLabel.style.color = '#008000';
                statusLabel.style.fontWeight = '900';
                statusLabel.style.fontSize = '18px';
            }

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) dropZone.classList.add('success-tool-glow');

            // ── Transform to "BACK TO HOME" — Black #111 ──
            actionBtn.disabled = false;
            actionBtn.style.cursor = 'pointer';
            actionBtn.innerHTML = `<span style="color: white; font-weight: 800; font-size: 15px; text-transform: uppercase;">BACK TO HOME</span>`;
            actionBtn.style.cssText = `
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
                z-index: 100;
                position: relative;
                transition: all 0.3s ease;
                font-weight: 800;
                box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            `;

            actionBtn.onclick = (e2) => {
                e2.preventDefault();
                window.location.reload();
            };

            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Compression Error:", err);
            if (titleBox) {
                titleBox.innerText = 'COMPRESSION FAILED';
                titleBox.style.color = '#e5322d';
            }
            if (statusLabel) {
                statusLabel.innerText = 'An error occurred during compression.';
                statusLabel.style.color = '#e5322d';
            }
            actionBtn.disabled = false;
            actionBtn.innerHTML = `<span>RETRY</span>`;
            actionBtn.onclick = () => window.location.reload();
        }
    };
};
