/**
 * KellynePDF - Split Logic
 * This function separates each page of a PDF into individual files.
 * The output is always provided as a ZIP file.
 */
async function runSplit(file) {
    try {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);
        const totalPages = pdfDoc.getPageCount();
        const zip = new JSZip();

        // Loop through each page of the uploaded PDF
        for (let i = 0; i < totalPages; i++) {
            // Create a new PDF for each individual page
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);

            // Save the single-page PDF
            const pdfBytes = await newPdf.save();
            
            // Add the page to the ZIP folder
            zip.file(`Kellyne_Page_${i + 1}.pdf`, pdfBytes);
        }

        // Generate the ZIP file and trigger download
        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveBlob(content, "Kellyne_Split_Pages.zip");
            
            // Update UI to show success
            if (typeof finish === "function") finish();
        });

    } catch (error) {
        console.error("Splitting Error:", error);
        alert("An error occurred while splitting the PDF. Please try again.");
        if (typeof resetUI === "function") resetUI();
    }
}