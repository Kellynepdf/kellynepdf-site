// KellynePDF - Integrated & Clean Workspace Logic
let pdfFiles = [];
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');

// 1. Handle Selection & Drop
async function handleFiles(files) {
    const validPdfs = files.filter(f => f.type === "application/pdf");
    
    if (validPdfs.length < 2) {
        alert("Please select at least 2 PDF files to merge.");
        return;
    }

    pdfFiles = validPdfs;

    // STEP 1: UI Change - Show processing INSIDE the box only
    const originalContent = dropZone.innerHTML;
    dropZone.innerHTML = `
        <div class="loader-spinner"></div>
        <p style="color: #0044ff; font-weight: bold; margin-top: 15px;">
            Merging ${pdfFiles.length} files...
        </p>
    `;
    dropZone.style.pointerEvents = "none"; // Disable interaction while processing

    // STEP 2: Execute Merge & Download
    await executeMergeAndDownload();

    // STEP 3: Reset Workspace back to original look
    setTimeout(() => {
        dropZone.innerHTML = originalContent;
        dropZone.style.pointerEvents = "auto";
        pdfFiles = []; // Clear array for next use
    }, 2500);
}

// 2. Logic: PDF Merging & ZIP Handling
async function executeMergeAndDownload() {
    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileNameBase = `KellynePDF_merged_${Date.now()}`;

        // Decision: ZIP if > 10 files, else PDF
        if (pdfFiles.length > 10) {
            const zip = new JSZip();
            zip.file(`${fileNameBase}.pdf`, pdfBlob);
            const zipContent = await zip.generateAsync({ type: "blob" });
            triggerDownload(zipContent, `${fileNameBase}.zip`);
        } else {
            triggerDownload(pdfBlob, `${fileNameBase}.pdf`);
        }

    } catch (error) {
        console.error("Merge failed:", error);
        alert("Merge process failed. Check your files.");
    }
}

// 3. Simple Download Trigger
function triggerDownload(blob, name) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 4. Event Listeners (No changes needed here)
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
});
fileInput.addEventListener('change', (e) => handleFiles(Array.from(e.target.files)));