/**
 * js/convert-to-pdf/word-to-pdf.js
 * Professional Word to PDF Engine with Bulk Support & Scroll Fixes
 */

window.runWordToPdf = async function(files) {
    if (!files || files.length === 0) return;
    
    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const titleBox = document.getElementById('tool-title-box');

    // Filter valid .docx files
    const docxFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.docx'));
    
    if (docxFiles.length === 0) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: PLEASE UPLOAD .DOCX FILES</span>`;
        setTimeout(window.resetUI, 3000);
        return;
    }

    // UI Update - Ready to Convert
    if (defaultIcon) defaultIcon.style.display = 'none';
    statusLabel.innerText = docxFiles.length > 1 ? `${docxFiles.length} FILES SELECTED` : `FILE: ${docxFiles[0].name}`;
    
    actionBtn.style.setProperty('display', 'block', 'important');
    actionBtn.className = "download-ready";
    actionBtn.innerHTML = `<span>CLICK TO CONVERT</span>`;
    actionBtn.style.backgroundColor = "#e5322d"; 
    actionBtn.style.color = "#fff"; 
    actionBtn.style.padding = "15px 40px";
    actionBtn.style.borderRadius = "50px";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.fontSize = "18px";
    actionBtn.style.fontWeight = "900";
    actionBtn.style.border = "none";
    actionBtn.style.opacity = "1";
    actionBtn.style.pointerEvents = "auto";

    // Action Logic
    actionBtn.onclick = async () => {
        actionBtn.innerHTML = `<span>CONVERTING...</span>`;
        actionBtn.style.pointerEvents = "none";
        actionBtn.style.opacity = "0.7";

        try {
            const results = [];
            const zip = docxFiles.length > 1 ? new JSZip() : null;

            for (let i = 0; i < docxFiles.length; i++) {
                const file = docxFiles[i];
                statusLabel.innerText = `Processing (${i + 1}/${docxFiles.length}): ${file.name}`;

                // 1. OFF-SCREEN CONTAINER WITH FONT ENFORCEMENT
                const tempDiv = document.createElement('div');
                tempDiv.id = 'render-container';
                tempDiv.style.cssText = `
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    width: 800px; 
                    z-index: -1; 
                    background-color: #ffffff; 
                    color: #000000 !important; 
                    font-family: Arial, sans-serif; 
                    min-height: 1122px;
                    visibility: visible;
                    opacity: 1;
                `;
                document.body.appendChild(tempDiv);

                const arrayBuffer = await file.arrayBuffer();
                
                // 2. RENDER & WAIT FOR REPAINT (2 SECONDS)
                await docx.renderAsync(arrayBuffer, tempDiv, tempDiv, {
                    inWrapper: false,
                    ignoreWidth: false,
                    ignoreHeight: false
                });

                // Wait for images and DOM paint
                const imgs = tempDiv.querySelectorAll('img');
                await Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : new Promise(r => img.onload = img.onerror = r)));
                await new Promise(r => setTimeout(r, 2000)); // Repaint wait

                // 3. BLANK PAGE SCROLL FIX
                const opt = {
                    margin: 10,
                    filename: file.name.replace(/\.docx$/i, '.pdf'),
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        scrollY: 0, 
                        scrollX: 0, 
                        logging: true 
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                if (zip) {
                    const blob = await html2pdf().set(opt).from(tempDiv).output('blob');
                    zip.file(opt.filename, blob);
                } else {
                    await html2pdf().set(opt).from(tempDiv).save();
                }

                // Cleanup
                document.body.removeChild(tempDiv);
            }

            if (zip) {
                const zipBlob = await zip.generateAsync({ type: "blob" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(zipBlob);
                link.download = "KELLYNEPDF_WORD_TO_PDF.zip";
                link.click();
            }

            // SUCCESS STATE
            if (titleBox) {
                titleBox.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
                titleBox.style.color = "#008000";
                titleBox.style.fontSize = "22px";
            }

            // BACK TO HOME
            actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
            actionBtn.style.backgroundColor = "#111";
            actionBtn.style.color = "#fff";
            actionBtn.style.opacity = "1";
            actionBtn.style.pointerEvents = "auto";
            actionBtn.onclick = () => window.location.reload(true);

        } catch (error) {
            console.error("Conversion Error:", error);
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">FAILED. PLEASE REFRESH.</span>`;
            setTimeout(window.resetUI, 3000);
        }
    };
};
