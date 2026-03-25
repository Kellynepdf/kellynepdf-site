/**
 * KellynePDF - Professional Merge Logic (Final Fix)
 */

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('tool-container');
    const fileInput = document.getElementById('pdf-input');
    let selectedFiles = [];

    // 1. CLICK TO SELECT FIX
    // This ensures the manual button works
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    });

    // 2. DRAG AND DROP FIX
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    });

    // 3. FILE PROCESSING
    async function handleFiles(files) {
        // Filter only PDFs
        const pdfs = files.filter(f => f.type === "application/pdf");

        if (pdfs.length < 2) {
            alert("Please select at least 2 PDF files to merge.");
            return;
        }

        selectedFiles = pdfs;

        // Change UI INSIDE the box
        const originalUI = dropZone.innerHTML;
        
        dropZone.innerHTML = `
            <div style="width:100%; padding:20px; z-index:100;">
                <h3 style="font-size:14px; color:var(--dark); margin-bottom:10px;">${selectedFiles.length} FILES SELECTED</h3>
                <div style="max-height:120px; overflow-y:auto; background:rgba(255,255,255,0.5); border-radius:15px; padding:10px; margin-bottom:15px;">
                    ${selectedFiles.map(f => `<p style="font-size:11px; margin:5px 0; font-weight:700;">📄 ${f.name}</p>`).join('')}
                </div>
                <button id="start-merge-btn" class="btn-action" style="width:100%; margin:0;">MERGE PDF</button>
                <p id="cancel-merge" style="margin-top:10px; font-size:11px; color:var(--red); cursor:pointer; font-weight:800;">CANCEL</p>
            </div>
        `;

        // Cancel Button
        document.getElementById('cancel-merge').onclick = () => {
            dropZone.innerHTML = originalUI;
            selectedFiles = [];
        };

        // Start Merge Button
        document.getElementById('start-merge-btn').onclick = async () => {
            await runMerge(originalUI);
        };
    }

    // 4. THE MERGE CORE
    async function runMerge(originalUI) {
        dropZone.innerHTML = `<div class="loader-spinner"></div><h2 style="font-weight:900;">MERGING...</h2>`;

        try {
            // Check if PDFLib is loaded
            if (typeof PDFLib === 'undefined') {
                throw new Error("PDF Library not loaded. Please check internet connection.");
            }

            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of selectedFiles) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const finalName = `kellynepdf_merged_${Date.now()}`;

            // ZIP logic if > 10 files
            if (selectedFiles.length > 10) {
                const zip = new JSZip();
                zip.file(`${finalName}.pdf`, pdfBlob);
                const zipContent = await zip.generateAsync({ type: "blob" });
                triggerDownload(zipContent, `${finalName}.zip`);
            } else {
                triggerDownload(pdfBlob, `${finalName}.pdf`);
            }

            dropZone.innerHTML = `<i class="fa-solid fa-check-circle" style="font-size:50px; color:#16a34a;"></i><h2 style="color:#16a34a;">SUCCESS!</h2>`;
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
            dropZone.innerHTML = originalUI;
        } finally {
            setTimeout(() => {
                dropZone.innerHTML = originalUI;
                selectedFiles = [];
            }, 3000);
        }
    }

    function triggerDownload(blob, name) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
    }
});