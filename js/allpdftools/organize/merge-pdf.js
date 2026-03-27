/**
 * KellynePDF - Merge PDF Actual Processing Logic
 */

async function processMergePDF(files) {
    if (files.length < 2) {
        alert("Please select at least 2 PDF files to merge.");
        return;
    }

    try {
        // Simple loading message
        const uploadText = document.querySelector('.upload-label-text');
        const originalText = uploadText.innerText;
        uploadText.innerText = "Merging PDFs... Please wait.";
        uploadText.style.color = "#0073b1"; // Blue while processing

        // 1. Create a new PDF Document
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const file of files) {
            if (file.type !== "application/pdf") continue;

            const fileArrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer);
            const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
            
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // 2. Save and Download
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `KellynePDF_Merged_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        uploadText.innerText = originalText;
        uploadText.style.color = "#444";
        alert("Success! Your merged PDF has been downloaded.");

    } catch (error) {
        console.error("Merge Error:", error);
        alert("An error occurred during merging. Please ensure the files are valid PDFs.");
    }
}

// Ippudu handleGlobalFiles ni direct ga Merge logic ki connect chestunnam
window.handleGlobalFiles = async function(files) {
    const currentTool = document.getElementById('tool-title-box').innerText;
    
    if (currentTool === "MERGE PDF") {
        await processMergePDF(files);
    } else {
        // Vere tools inka build chestunnam ani alert
        alert(`${currentTool} logic is being integrated. Please try Merge PDF for now.`);
    }
};