/* KellynePDF - Professional Merge & ZIP Logic */
let selectedMergeFiles = [];

const dropZone = document.getElementById('tool-container');
const fileInput = document.getElementById('pdf-input');

// 1. --- DRAG AND DROP LOGIC ---
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
            dropZone.style.border = '2px dashed #e53935';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
            dropZone.style.border = '1px solid #f1f5f9';
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
        if (files.length > 0) handleFiles(files);
    }, false);
}

// 2. --- FILE INPUT LOGIC ---
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
}

function handleFiles(files) {
    selectedMergeFiles = files;
    const descMain = document.getElementById('tool-desc-main');
    const mainBtn = document.getElementById('main-btn');

    if (descMain && mainBtn) {
        descMain.innerText = `${selectedMergeFiles.length} PDF Files Loaded! Ready to Merge.`;
        descMain.style.color = "#16a34a";
        mainBtn.innerText = "START MERGE PDF";
        mainBtn.style.background = "#16a34a";
        mainBtn.onclick = executeMergeTask;
    }
}

// 3. --- MAIN MERGE & ZIP EXECUTION ---
async function executeMergeTask() {
    if (selectedMergeFiles.length === 0) return;
    document.getElementById('tool-title').innerText = "Merging... Please Wait";
    
    try {
        const { PDFDocument } = PDFLib;
        
        // CASE A: More than 10 files -> Download as ZIP
        if (selectedMergeFiles.length > 10) {
            if (typeof JSZip === "undefined") {
                alert("JSZip library is missing in index.html!");
                return;
            }
            const zip = new JSZip();
            for (let i = 0; i < selectedMergeFiles.length; i++) {
                const fileBuffer = await selectedMergeFiles[i].arrayBuffer();
                zip.file(`Kellyne_Merge_Part_${i + 1}.pdf`, fileBuffer);
            }
            const content = await zip.generateAsync({ type: "blob" });
            downloadFile(content, "Kellyne_Merge_PDF_Bundle.zip");
        } 
        // CASE B: 10 or fewer files -> Merge into single PDF
        else {
            const mergedPdf = await PDFDocument.create();
            for (const file of selectedMergeFiles) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadFile(blob, "Kellyne_Merge_PDF.pdf");
        }

        showSuccessUI();
    } catch (err) {
        console.error(err);
        alert("Merging Failed. Ensure files are valid PDFs.");
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 4. --- SUCCESS UI ---
function showSuccessUI() {
    const container = document.getElementById('tool-container');
    container.innerHTML = `
        <div id="tool-icon" style="color:#16a34a; font-size:90px;"><i class="fa-solid fa-circle-check"></i></div>
        <h2 style="color:#16a34a;">SUCCESSFUL MERGE COMPLETED!</h2>
        <p style="font-weight:bold; color:#475569;">Your "Kellyne Merge PDF" file is ready.</p>
        <button class="btn-action" onclick="window.location.reload()" style="background:#0f172a; margin-top:20px; padding:15px 50px;">BACK TO HOME</button>
    `;
}