/* KellynePDF - Professional Split Logic */
let selectedSplitFile = null;

const dropZone = document.getElementById('tool-container');
const fileInput = document.getElementById('pdf-input');

// 1. --- DRAG AND DROP HANDLERS ---
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            if (document.getElementById('tool-title').innerText === "Split PDF") {
                dropZone.style.border = '2px dashed #e53935';
                dropZone.style.background = '#fff5f5';
            }
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.border = '1px solid #f1f5f9';
            dropZone.style.background = 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 25%, #fecaca 50%, #fdf2f8 75%, #f5f3ff 100%)';
        });
    });

    dropZone.addEventListener('drop', (e) => {
        if (document.getElementById('tool-title').innerText === "Split PDF") {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
            if (files.length > 0) {
                selectedSplitFile = files[0];
                updateSplitUI();
            }
        }
    });
}

// 2. --- FILE SELECTION ---
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'pdf-input') {
        if (document.getElementById('tool-title').innerText === "Split PDF") {
            selectedSplitFile = e.target.files[0];
            updateSplitUI();
        }
    }
});

function updateSplitUI() {
    const descMain = document.getElementById('tool-desc-main');
    const mainBtn = document.getElementById('main-btn');
    if (selectedSplitFile && descMain && mainBtn) {
        descMain.innerText = `File "${selectedSplitFile.name}" Loaded. Ready to Split!`;
        descMain.style.color = "#16a34a";
        mainBtn.innerText = "START SPLIT PDF"; 
        mainBtn.style.background = "#16a34a";
        mainBtn.onclick = executeSplitTask;
    }
}

// 3. --- CORE SPLIT LOGIC (With 10+ ZIP Support) ---
async function executeSplitTask() {
    if (!selectedSplitFile) return alert("Please select a PDF!");
    document.getElementById('tool-title').innerText = "Processing Split...";

    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await selectedSplitFile.arrayBuffer();
        const mainPdf = await PDFDocument.load(arrayBuffer);
        const pageCount = mainPdf.getPageCount();

        // 10 kante ekkuva pages unte ZIP logic start avtundi
        if (pageCount > 10) {
            const zip = new JSZip();
            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(mainPdf, [i]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();
                zip.file(`Kellyne_Split_Page_${i + 1}.pdf`, pdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveFile(zipBlob, "Kellyne_Split_PDF_Bundle.zip");
        } 
        // 10 kante takkuva unte direct download (Modati page matram demo ki)
        else {
            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(mainPdf, [i]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveFile(blob, `Kellyne_Split_Page_${i + 1}.pdf`);
            }
        }
        showSplitSuccessUI();
    } catch (err) {
        alert("Split failed.");
    }
}

function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

function showSplitSuccessUI() {
    const container = document.getElementById('tool-container');
    container.innerHTML = `
        <div id="tool-icon" style="color:#16a34a; font-size:90px;"><i class="fa-solid fa-scissors"></i></div>
        <h2 style="color:#16a34a;">SUCCESSFUL SPLIT!</h2>
        <p style="font-weight:bold;">Your "Kellyne Split PDF" is ready.</p>
        <button class="btn-action" onclick="window.location.reload()" style="background:#0f172a;">BACK TO HOME</button>
    `;
}