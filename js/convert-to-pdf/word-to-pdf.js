/**
 * js/convert-to-pdf/word-to-pdf.js
 * High-Quality Word to PDF Conversion Logic
 * KELLYNEPDF Standardized Implementation
 */

window.runWordToPdf = async function(files) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const titleBox = document.getElementById('tool-title-box');

    // Validation
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx')) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: PLEASE UPLOAD A .DOCX FILE</span>`;
        if (fileName.endsWith('.doc')) {
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: .DOC NOT SUPPORTED. PLEASE CONVERT TO .DOCX FIRST.</span>`;
        }
        setTimeout(window.resetUI, 3000);
        return;
    }

    // UI Update - Ready to Convert
    if (defaultIcon) defaultIcon.style.display = 'none';
    statusLabel.innerText = "Word Document Prepared: " + file.name;
    
    actionBtn.style.setProperty('display', 'block', 'important');
    actionBtn.className = "download-ready";
    actionBtn.innerHTML = `<span>CLICK TO CONVERT</span>`;
    actionBtn.style.backgroundColor = "#e5322d"; // Solid Red
    actionBtn.style.color = "#fff"; // White text
    actionBtn.style.padding = "15px 40px";
    actionBtn.style.borderRadius = "50px";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.fontSize = "18px";
    actionBtn.style.fontWeight = "900";
    actionBtn.style.border = "none";
    actionBtn.style.transition = "all 0.3s ease";
    actionBtn.style.opacity = "1";
    actionBtn.style.pointerEvents = "auto";

    // Action Logic
    actionBtn.onclick = async () => {
        actionBtn.innerHTML = `<span>PROCESSING...</span>`;
        actionBtn.style.pointerEvents = "none";
        actionBtn.style.opacity = "0.7";

        try {
            // Create a hidden container for rendering docx
            const container = document.createElement('div');
            container.id = 'docx-preview-container';
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px'; // Consistent width for rendering
            container.style.backgroundColor = '#fff';
            document.body.appendChild(container);

            const arrayBuffer = await file.arrayBuffer();
            
            // Render docx to HTML using docx-preview
            await docx.renderAsync(arrayBuffer, container, container, {
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                debug: false
            });

            // Conversion Options for html2pdf
            const opt = {
                margin: 0.5,
                filename: 'KELLYNEPDF_WORD_TO_PDF.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Trigger PDF generation and download
            await html2pdf().set(opt).from(container).save();

            // Cleanup container
            document.body.removeChild(container);

            // Success State
            if (titleBox) {
                titleBox.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
                titleBox.style.color = "#008000"; // Bright Green
                titleBox.style.fontSize = "22px";
            }

            // BACK TO HOME Button State
            actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
            actionBtn.style.backgroundColor = "#111"; // Solid Black
            actionBtn.style.color = "#fff"; // White font
            actionBtn.style.opacity = "1";
            actionBtn.style.pointerEvents = "auto";
            actionBtn.onclick = () => {
                window.location.reload(true); // Hard Refresh
            };

        } catch (error) {
            console.error("Conversion Error:", error);
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">CONVERSION FAILED. PLEASE TRY AGAIN.</span>`;
            setTimeout(window.resetUI, 3000);
            
            // Cleanup on error
            const container = document.getElementById('docx-preview-container');
            if (container) document.body.removeChild(container);
        }
    };
};
