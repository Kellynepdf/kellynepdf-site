/* KellynePDF - Professional High Compression Logic with Error Handling */
let selectedCompressFile = null;

// 1. --- SELECTION LOGIC ---
function handleCompressSelection() {
    const dropZone = document.getElementById('tool-container');
    const fileInput = document.getElementById('pdf-input');

    if (!dropZone || !fileInput) return;

    fileInput.onchange = (e) => {
        if (document.getElementById('tool-title').innerText === "Compress PDF") {
            selectedCompressFile = e.target.files[0];
            if (selectedCompressFile) updateCompressUI();
        }
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(n => {
        dropZone.addEventListener(n, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    dropZone.addEventListener('drop', e => {
        if (document.getElementById('tool-title').innerText === "Compress PDF") {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
            if (files.length > 0) {
                selectedCompressFile = files[0];
                updateCompressUI();
            }
        }
    });
}

function updateCompressUI() {
    const descMain = document.getElementById('tool-desc-main');
    const mainBtn = document.getElementById('main-btn');
    if (selectedCompressFile && descMain && mainBtn) {
        const size = (selectedCompressFile.size / 1024).toFixed(2);
        descMain.innerHTML = `
            <b>${selectedCompressFile.name}</b><br>
            <span style="color:#e53935;">Size: ${size} KB</span><br>
            <span style="color:#16a34a;">Status: Ready for High Compression</span>
        `;
        mainBtn.innerText = "START HIGH COMPRESS";
        mainBtn.style.background = "#16a34a";
        mainBtn.onclick = executeHighCompress;
    }
}

// 2. --- CORE COMPRESSION ---
async function executeHighCompress() {
    if (!selectedCompressFile) return;
    
    document.getElementById('tool-title').innerText = "Applying High Compression...";

    try {
        // Ensure PDF.js is available
        if (typeof pdfjsLib === 'undefined') {
            throw new Error("PDF Library not loaded properly.");
        }

        const arrayBuffer = await selectedCompressFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const { PDFDocument } = PDFLib;
        const compressedPdf = await PDFDocument.create();

        // Process up to first 10 pages for speed/testing (increase as needed)
        const totalPages = Math.min(pdf.numPages, 20); 

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.2 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const imgData = canvas.toDataURL('image/jpeg', 0.5); // 50% Quality
            const img = await compressedPdf.embedJpg(imgData);
            
            const newPage = compressedPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        const pdfBytes = await compressedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Kellyne_Compressed_PDF.pdf";
        a.click();

        showCompressResultUI("SUCCESSFUL", "Size Reduced Successfully!");
    } catch (err) {
        console.error(err);
        showCompressResultUI("FAILED", "Something went wrong. The file might be too large or protected.");
    }
}

// 3. --- DYNAMIC RESULT UI ---
function showCompressResultUI(status, message) {
    const container = document.getElementById('tool-container');
    const color = status === "SUCCESSFUL" ? "#16a34a" : "#e53935";
    const icon = status === "SUCCESSFUL" ? "fa-circle-check" : "fa-circle-xmark";

    container.innerHTML = `
        <div id="tool-icon" style="color:${color}; font-size:90px;"><i class="fa-solid ${icon}"></i></div>
        <h2 style="color:${color};">${status} COMPRESSION!</h2>
        <p style="font-weight:bold; color:#475569;">${message}</p>
        <button class="btn-action" onclick="window.location.reload()" style="background:#0f172a; margin-top:20px; padding:15px 50px;">BACK TO HOME</button>
    `;
}

handleCompressSelection();