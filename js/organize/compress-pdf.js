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

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (titleBox) {
        titleBox.innerHTML = `ORIGINAL SIZE: ${originalSizeMB} MB`;
        titleBox.style.color = '#333';
        titleBox.style.fontSize = '20px';
        titleBox.style.fontWeight = '900';
    }

    // State variable for compression quality
    let selectedQuality = 0.6;

    // Ensure no existing options UI is present
    let existingOpts = document.getElementById('compression-options');
    if (existingOpts) existingOpts.remove();

    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'compression-options';
    optionsContainer.style.cssText = `
        position: relative;
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 25px auto;
        text-align: left;
        max-width: 550px;
        background: #ffffff;
        padding: 25px;
        border-radius: 12px;
        border: 2px solid #ccc;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    `;
    optionsContainer.innerHTML = `
        <label style="cursor:pointer; display:flex; align-items:center; gap:15px; font-size:16px; color:#000000 !important; font-weight:bold; padding:10px; border-radius:8px;">
            <input type="radio" name="pdf_quality" value="0.8" style="transform:scale(1.5); cursor:pointer; accent-color:#ff0000;">
            <span>High Quality <span style="font-weight:normal; color:#444;">(Less Compression - Best for Scanned & Images)</span></span>
        </label>
        <label style="cursor:pointer; display:flex; align-items:center; gap:15px; font-size:16px; color:#000000 !important; font-weight:bold; padding:10px; border-radius:8px;">
            <input type="radio" name="pdf_quality" value="0.6" checked style="transform:scale(1.5); cursor:pointer; accent-color:#ff0000;">
            <span>Standard / Recommended <span style="font-weight:normal; color:#444;">(Balances Size & Readability)</span></span>
        </label>
        <label style="cursor:pointer; display:flex; align-items:center; gap:15px; font-size:16px; color:#000000 !important; font-weight:bold; padding:10px; border-radius:8px;">
            <input type="radio" name="pdf_quality" value="0.3" style="transform:scale(1.5); cursor:pointer; accent-color:#ff0000;">
            <span>Minimum Size <span style="font-weight:normal; color:#444;">(High Compression - Text Only PDFs)</span></span>
        </label>
    `;
    actionBtn.parentNode.insertBefore(optionsContainer, actionBtn);

    // Expand the drop-zone height dynamically to prevent clipping the button
    if (actionBtn && actionBtn.parentNode) {
        actionBtn.parentNode.style.height = 'auto';
        actionBtn.parentNode.style.minHeight = '400px';
        actionBtn.parentNode.style.paddingBottom = '40px';
    }

    // Explicitly track changes to ensure quality target updates dynamically
    const radioInputs = optionsContainer.querySelectorAll('input[name="pdf_quality"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.checked) {
                selectedQuality = parseFloat(e.target.value);
            }
        });
    });


    // ── Status Label UI ──
    if (statusLabel) {
        statusLabel.innerHTML = `READY FOR COMPRESSION`;
        statusLabel.style.color = '#ff0000';
        statusLabel.style.fontWeight = '900';
        statusLabel.style.fontSize = '18px';
    }

    // ── "COMPRESS & DOWNLOAD" Button ──
    actionBtn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 15px; letter-spacing: 1.5px;">COMPRESS & DOWNLOAD</span>`;
    actionBtn.style.cssText = `
        display: flex !important;
        justify-content: center;
        align-items: center;
        background-color: #e5322d !important;
        color: #fff !important;
        border: none;
        padding: 20px 50px;
        border-radius: 35px;
        cursor: pointer;
        width: auto;
        margin: 25px auto 0;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100;
        position: relative;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 12px 30px rgba(255, 0, 0, 0.3);
    `;
    actionBtn.disabled = false;
    actionBtn.classList.add('download-ready');

    // ── STEP 2: On Click — Execute Compression ──
    actionBtn.onclick = async (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        // ── "COMPRESSING..." with Spinner ──
        actionBtn.disabled = true;
        actionBtn.style.cursor = 'not-allowed';
        actionBtn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">COMPRESSING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = 'OPTIMIZING ENGINE ACTIVE...';
            statusLabel.style.color = '#e5322d';
        }

        const qualityTarget = selectedQuality; // Grab the exact verified state
        
        try {
            if (!window.pdfjsLib) throw new Error('pdfjsLib is not loaded');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const newDoc = await PDFLib.PDFDocument.create();

            // Determine scale based on quality target
            let scale = 1.5; // Default for good quality
            if (qualityTarget <= 0.3) scale = 0.8;
            else if (qualityTarget <= 0.6) scale = 1.0;

            for (let i = 1; i <= pdf.numPages; i++) {
                if (statusLabel) statusLabel.innerText = `Shrinking page ${i} of ${pdf.numPages}...`;
                
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(viewport.width);
                canvas.height = Math.round(viewport.height);
                const ctx = canvas.getContext('2d');

                // White background to avoid black pages for transparent backgrounds
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;
                
                const imgBytes = await new Promise(resolve => {
                    canvas.toBlob(async (blob) => {
                        const buffer = await blob.arrayBuffer();
                        resolve(new Uint8Array(buffer));
                    }, 'image/jpeg', qualityTarget);

                });
                const img = await newDoc.embedJpg(imgBytes);
                
                const origViewport = page.getViewport({ scale: 1.0 });
                const p = newDoc.addPage([origViewport.width, origViewport.height]);
                p.drawImage(img, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
                
                // Memory Cleanup (Crucial for large PDFs)
                page.cleanup();
                canvas.width = 0;
                canvas.height = 0;
            }

            let pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const finalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            const url = URL.createObjectURL(blob);

            // ── SUCCESS UI & DOWNLOAD ──
            const link = document.createElement('a');
            link.href = url;
            link.download = 'KELLYNEPDF_COMPRESSED.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (titleBox) {
                titleBox.innerText = 'COMPRESSION SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';
                titleBox.style.fontSize = '22px';
                titleBox.style.fontWeight = '900';
            }
            
            if (statusLabel) {
                statusLabel.innerHTML = `Original: ${originalSizeMB} MB → Final: ${finalSizeMB} MB`;
                statusLabel.style.color = '#008000';
            }

            const dropZone = document.getElementById('drop-zone');
            if (dropZone) dropZone.classList.add('success-tool-glow');

            // ── "BACK TO HOME" — Solid Black (#111), White text ──
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
                window.location.reload(true);
            };

            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Compression Error:", err);
            window.location.assign('index.html');
        }
    };
};
