/**
 * KellynePDF - Split PDF Logic
 * Functionality: Extracts specific pages or ranges from a PDF
 */

async function processSplitPDF(files) {
    if (files.length === 0) return;
    const file = files[0]; // Split PDF usually works on one file at a time

    if (file.type !== "application/pdf") {
        alert("Please select a valid PDF file to split.");
        return;
    }

    try {
        const statusLabel = document.getElementById('status-label');
        statusLabel.innerText = "Analyzing PDF structure...";
        
        // 1. Load the existing PDF
        const fileArrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer);
        const pageCount = sourcePdf.getPageCount();

        // 2. Ask User for page range (Simulating a simple prompt for now)
        // Future update: We will build a visual page selector UI
        const range = prompt(`This PDF has ${pageCount} pages. Enter page numbers to extract (e.g., 1, 3, 5-8):`, "1");

        if (!range) {
            statusLabel.innerText = "Click or Drag & Drop Files";
            return;
        }

        statusLabel.innerText = "Splitting PDF... Please wait.";

        // 3. Parse the range string into an array of page numbers
        const selectedPages = parsePageRange(range, pageCount);

        if (selectedPages.length === 0) {
            alert("Invalid page range entered.");
            statusLabel.innerText = "Click or Drag & Drop Files";
            return;
        }

        // 4. Create a new PDF for the extracted pages
        const newPdf = await PDFLib.PDFDocument.create();
        
        // Indices are 0-based in pdf-lib, so we subtract 1
        const copiedPages = await newPdf.copyPages(sourcePdf, selectedPages.map(p => p - 1));
        copiedPages.forEach(page => newPdf.addPage(page));

        // 5. Save and Trigger Download
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KellynePDF_Split_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        statusLabel.innerText = "Click or Drag & Drop Files";
        alert("Success! Your split PDF is ready.");

    } catch (error) {
        console.error("Split Error:", error);
        alert("Error splitting the PDF. Please try a different file.");
    }
}

/**
 * Helper function to convert "1, 2, 5-8" into [1, 2, 5, 6, 7, 8]
 */
function parsePageRange(input, max) {
    const pages = new Set();
    const parts = input.split(',');

    parts.forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (start > 0 && end <= max) {
                for (let i = start; i <= end; i++) pages.add(i);
            }
        } else {
            const num = Number(part);
            if (num > 0 && num <= max) pages.add(num);
        }
    });

    return Array.from(pages).sort((a, b) => a - b);
}