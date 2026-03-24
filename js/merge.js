/* KellynePDF - PDF Merge Logic */
let selectedMergeFiles = [];

// Function to handle File Selection
document.getElementById('pdf-input').addEventListener('change', function(e) {
    selectedMergeFiles = Array.from(e.target.files);
    
    if (selectedMergeFiles.length > 0) {
        // Update the UI to show how many files are selected
        const descMain = document.getElementById('tool-desc-main');
        descMain.innerText = `${selectedMergeFiles.length} files selected. Ready to merge!`;
        descMain.style.color = "#16a34a"; // Change text color to green

        // Change the button text and function
        const mainBtn = document.getElementById('main-btn');
        mainBtn.innerText = "MERGE PDF NOW";
        mainBtn.style.background = "#16a34a"; // Professional Green
        mainBtn.onclick = startMergingProcess;
    }
});

// Main function to Merge PDFs using pdf-lib
async function startMergingProcess() {
    if (selectedMergeFiles.length < 2) {
        alert("Please select at least 2 PDF files to merge.");
        return;
    }

    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        // Loop through each selected file
        for (const file of selectedMergeFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Save the merged PDF as bytes
        const pdfBytes = await mergedPdf.save();

        // Create a download link and trigger it
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "KellynePDF_Merged_Document.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("Success! Your PDF files have been merged.");
        location.reload(); // Refresh to reset the tool

    } catch (error) {
        console.error("Merge Error:", error);
        alert("Oops! Something went wrong during merging. Please try again.");
    }
}