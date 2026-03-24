/**
 * KellynePDF - Merge Logic
 * Professional External JS for PDF Merging
 */

let selectedFiles = [];

// 1. File Selection Handler
// Uses the exact ID: 'pdf-input' from your HTML
document.getElementById('pdf-input').addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);
    
    // Using your existing IDs: 'tool-desc' and 'btn-action'
    const statusDisplay = document.getElementById('tool-desc'); 
    const actionButton = document.querySelector('.btn-action');

    if(selectedFiles.length > 0) {
        // Show how many files selected
        statusDisplay.innerText = selectedFiles.length + " files ready to merge.";
        statusDisplay.style.color = "#4ade80"; // Change to success green
        
        // Change Button state
        actionButton.innerText = "MERGE NOW";
        actionButton.style.backgroundColor = "#2e7d32"; // Dark green
        
        // Re-assign button click to merge function
        actionButton.onclick = mergePDFs;
    }
});

// 2. Main Processing Function
async function mergePDFs() {
    if (selectedFiles.length < 2) {
        alert("Please select at least 2 PDF files to merge!");
        return;
    }

    const actionButton = document.querySelector('.btn-action');
    actionButton.innerText = "Processing...";
    actionButton.disabled = true;

    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of selectedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Auto-download result
        const a = document.createElement('a');
        a.href = url;
        a.download = "KellynePDF_Merged.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        alert("Merge Successful!");
        location.reload(); // To reset workspace

    } catch (error) {
        console.error("Error:", error);
        alert("Merging failed. Please check if files are valid PDFs.");
        location.reload();
    }
}