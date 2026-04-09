1. The Professional Code(js / organize / compress - pdf.js)

JavaScript
/**
 * KELLYNE PDF - Advanced Compression Engine
 * Logic: Page-to-Image Rendering for Maximum Size Reduction
 */

window.runCompress = async function (files) {
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
    actionBtn.disabled = false;

    actionBtn.onclick = async (e) => {
        e.stopPropagation();
        await startAdvancedCompression(file, titleBox, statusLabel, actionBtn);
    };
};

async function startAdvancedCompression(file, titleBox, statusLabel, actionBtn) {
    try {
        actionBtn.innerHTML = `KELLYNE COMPRESSING... <div class="spinner-small"></div>`;
        actionBtn.disabled = true;

        // Load PDF using PDF.js
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const newDoc = await PDFLib.PDFDocument.create();

        // High compression DPI (72-150 is ideal for screen)
        const scale = 1.5;

        for (let i = 1; i <= pdf.numPages; i++) {
            statusLabel.innerText = `Processing page ${i} of ${pdf.numPages}...`;

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport }).promise;

            // Compress quality set to 0.6 (60%)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            const imgBytes = await (await fetch(dataUrl)).arrayBuffer();
            const img = await newDoc.embedJpg(imgBytes);

            const p = newDoc.addPage([viewport.width, viewport.height]);
            p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        const url = URL.createObjectURL(blob);

        // Success UI
        titleBox.innerText = "COMPRESSION SUCCESSFULLY COMPLETED";
        titleBox.style.color = "#008000";
        titleBox.style.fontSize = "22px";

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
                actionBtn.style.backgroundColor = "#111";
                actionBtn.onclick = () => window.resetUI();
            }, 2000);
        };

    } catch (err) {
        console.error(err);
        statusLabel.innerText = "Error during compression. Please try again.";
        actionBtn.disabled = false;
    }
}
2. Agent ki ivvalsina Instruction(Guide)

Agent chat box lo idi paste cheyyandi:

"Agent, please update @workspace js/organize/compress-pdf.js with the provided high-compression logic.

Technical Guide for Agent:

    Dependencies: Ensure pdfjsLib and PDFLib are available globally in index.html.

UI Integration: When runCompress is called, it should update #tool - title - box, #status - label, and #action - button as per the KellynePDF design.

Logic Flow: The PDF must be rendered to canvas images(JPEG) to ensure actual file size reduction, then re - assembled into a new PDF.

    Cleanup: After download, ensure the button reverts to 'BACK TO HOME' to reset the system."