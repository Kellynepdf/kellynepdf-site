// merge.js - Logic for KellynePDF
let pdfFiles = [];
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('drop-zone');
const previewContainer = document.getElementById('file-list-preview');

// Function to check if the user is on Mobile
const isMobile = () => window.innerWidth <= 768;

// 1. Handle File Selection (Button Click)
fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    processFiles(files);
});

// 2. Handle Drag and Drop
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    processFiles(files);
});

// 3. Process Logic based on Device
async function processFiles(files) {
    if (files.length === 0) return;

    if (isMobile()) {
        // MOBILE: Add to list for user to see/manage
        pdfFiles = [...pdfFiles, ...files];
        renderMobileList();
    } else {
        // DESKTOP: Instant Merge and Download
        if (files.length < 2) {
            alert("Please select at least 2 PDF files to merge instantly.");
            return;
        }
        pdfFiles = files;
        await executeInstantMerge();
    }
}

// 4. Execution: PDF-Lib Merging & Auto-Download
async function executeInstantMerge() {
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
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `KellynePDF_Merged_${Date.now()}.pdf`;
        
        // Trigger download immediately
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Instant Download Triggered for Desktop");
    } catch (err) {
        console.error("Merge Error:", err);
    }
}

// 5. Mobile UI Rendering (Shows the list in your screenshot)
function renderMobileList() {
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = pdfFiles.map((file, index) => `
        <div class="file-card">
            <span>${file.name}</span>
            <div class="three-dots-menu">⋮
                <div class="dropdown-menu">
                    <button onclick="shareFile('whatsapp', ${index})">WhatsApp</button>
                    <button onclick="shareFile('email', ${index})">Email</button>
                    <button onclick="removeFile(${index})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function removeFile(index) {
    pdfFiles.splice(index, 1);
    renderMobileList();
}