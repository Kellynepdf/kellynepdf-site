async function processMergePDF(files) {
    // Merge ki కనీసం 2 files ఉండాలి
    if (files.length < 2) {
        alert("Please select at least 2 PDF files to merge.");
        return;
    }

    try {
        const toolTitle = document.getElementById('tool-display-name');
        toolTitle.innerText = "Merging... Please wait.";

        // pdf-lib logic
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            // PDF file ani check cheyandi
            if (file.type !== "application/pdf") {
                console.warn(`Skipping non-pdf file: ${file.name}`);
                continue;
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        // Download as PDF
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KellynePDF_Merged_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toolTitle.innerText = "MERGE PDF - SUCCESS!";
        setTimeout(() => { toolTitle.innerText = "SELECT PDF FILES"; }, 3000);

    } catch (err) {
        console.error(err);
        alert("Merging process failed. Make sure files are not corrupted.");
        document.getElementById('tool-display-name').innerText = "MERGE PDF";
    }
}