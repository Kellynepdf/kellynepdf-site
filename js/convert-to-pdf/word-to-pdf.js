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

    // Validation
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: PLEASE UPLOAD A WORD FILE (.DOCX or .DOC)</span>`;
        setTimeout(window.resetUI, 3000);
        return;
    }

    // UI Update - Ready to Convert
    if (defaultIcon) defaultIcon.style.display = 'none';
    statusLabel.innerText = "Word Document Ready: " + file.name;
    
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
    actionBtn.style.transition = "all 0.3s ease";

    // Action Logic
    actionBtn.onclick = async () => {
        actionBtn.innerHTML = `<span>PROCESSING...</span>`;
        actionBtn.style.pointerEvents = "none";
        actionBtn.style.opacity = "0.7";

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                
                // Convert Word to HTML using Mammoth
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value;
                
                // Create a temporary container for rendering
                const container = document.createElement('div');
                container.innerHTML = html;
                container.style.padding = "40px";
                container.style.background = "#fff";
                container.style.width = "800px"; // Standard width for clarity
                container.style.fontFamily = "'Inter', sans-serif";
                
                // Conversion Options
                const opt = {
                    margin: 1,
                    filename: 'KELLYNEPDF_WORD_TO_PDF.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };

                // Trigger PDF generation and download
                await html2pdf().set(opt).from(container).save();

                // Success State
                const titleBox = document.getElementById('tool-title-box');
                if (titleBox) {
                    titleBox.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
                    titleBox.style.color = "#008000";
                    titleBox.style.fontSize = "22px";
                }

                // BACK TO HOME Button State
                actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
                actionBtn.style.backgroundColor = "#111";
                actionBtn.style.color = "#fff";
                actionBtn.style.opacity = "1";
                actionBtn.style.pointerEvents = "auto";
                actionBtn.onclick = () => {
                    window.location.reload(true);
                };
            };
            reader.readAsArrayBuffer(file);

        } catch (error) {
            console.error("Conversion Error:", error);
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">CONVERSION FAILED. PLEASE TRY AGAIN.</span>`;
            setTimeout(window.resetUI, 3000);
        }
    };
};
