/* KellynePDF - Professional Merge Logic 
   Features: Drag & Drop, 10+ Files ZIP, Custom Naming, Success UI 
*/

let selectedMergeFiles = [];

const dropZone = document.getElementById('tool-container');
const fileInput = document.getElementById('pdf-input');

// 1. --- DRAG AND DROP LOGIC ---
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { 
            e.preventDefault(); 
            e.stopPropagation(); 
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            if (document.getElementById('tool-title').innerText === "Merge PDF") {
                dropZone.style.border = '2px dashed #e53935';
                dropZone.style.background = '#fff5f5';
            }
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.border = '1px solid #f1f5f9';
            dropZone.style.background = 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 25%, #fecaca 50%, #fdf2f8 75%, #f5f3ff 100%)';
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        if (document.getElementById('tool-title').innerText === "Merge PDF") {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
            if (files.length > 0) handleMergeFiles(files);
        }
    }, false);
}

// 2. --- FILE INPUT LOGIC ---
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (document.getElementById('tool-title').innerText === "Merge PDF") {
            const files = Array.from(e.target.files);
            handleMergeFiles(files);
        }
    });
}

function handleMergeFiles(files) {
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

// 3. --- MAIN EXECUTION (MERGE OR ZIP) ---
async function executeMergeTask() {
    if (selectedMergeFiles.length === 0) return;
    document.getElementById('tool-title').innerText = "Merging... Please Wait";
    
    try {
        const { PDFDocument } = PDFLib;
        
        // CASE A: More than 10 files -> ZIP Download
        if (selectedMergeFiles.length > 10) {
            if (typeof JSZip === "undefined") {
                alert("JSZip library is missing!");
                return;
            }
            const zip = new JSZip();
            for (let i = 0; i < selectedMergeFiles.length; i++) {
                const fileData = await selectedMergeFiles[i].arrayBuffer();
                zip.file(`Kellyne_Merge_Part_${i + 1}.pdf`, fileData);
            }
            const content = await zip.generateAsync({ type: "blob" });
            saveFile(content, "Kellyne_Merge_PDF_Bundle.zip");
        } 
        // CASE B: 10 or fewer files -> Single PDF
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
            saveFile(blob, "Kellyne_Merge_PDF.pdf");
        }

        showMergeSuccessUI();
    } catch (err) {
        console.error(err);
        alert("Merge failed. Check console for details.");
    }
}

function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// 4. --- SUCCESS UI ---
function showMergeSuccessUI() {
    const container = document.getElementById('tool-container');
    container.innerHTML = `
        <div id="tool-icon" style="color:#16a34a; font-size:90px;"><i class="fa-solid fa-circle-check"></i></div>
        <h2 style="color:#16a34a;">SUCCESSFUL MERGE COMPLETED!</h2>
        <p style="font-weight:bold; color:#475569;">Your "Kellyne Merge PDF" file is ready.</p>
        <button class="btn-action" onclick="window.location.reload()" style="background:#0f172a; margin-top:20px; padding:15px 50px;">BACK TO HOME</button>
    `;
}