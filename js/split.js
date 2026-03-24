/* KellynePDF - Professional Split Logic */
let selectedSplitFile = null;

// 1. This function is called when user clicks 'Split PDF'
function handleSplitSelection() {
    const descMain = document.getElementById('tool-desc-main');
    const mainBtn = document.getElementById('main-btn');
    const fileInput = document.getElementById('pdf-input');

    // Resetting UI for Split Mode
    fileInput.multiple = false; // Split only needs one file
    descMain.innerText = "Upload a PDF to split every page.";
    descMain.style.color = "#475569";
    
    mainBtn.innerText = "SELECT FILE"; // Initial Button Text
    mainBtn.style.background = "#e53935"; // Reset to Red

    // Handle File Selection
    fileInput.onchange = (e) => {
        selectedSplitFile = e.target.files[0];
        if (selectedSplitFile) {
            descMain.innerText = `File Loaded: ${selectedSplitFile.name}`;
            descMain.style.color = "#16a34a"; // Green
            
            // --- UPDATED BUTTON TEXT FOR SPLIT ---
            mainBtn.innerText = "START SPLIT PDF"; 
            mainBtn.style.background = "#16a34a";
            mainBtn.onclick = executeSplitTask;
        }
    };
}

// 2. Main Execution Logic
async function executeSplitTask() {
    if (!selectedSplitFile) return alert("Please select a PDF file!");
    
    document.getElementById('tool-title').innerText = "Splitting Pages...";
    
    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await selectedSplitFile.arrayBuffer();
        const mainPdf = await PDFDocument.load(arrayBuffer);
        const pageCount = mainPdf.getPageCount();
        
        const zip = new JSZip();
        const folder = zip.folder("Kellyne_Split_Pages");

        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(mainPdf, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            folder.file(`Kellyne_Split_Page_${i + 1}.pdf`, pdfBytes);
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipContent);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Kellyne_Split_PDF.zip";
        a.click();

        showSplitSuccessUI();
    } catch (err) {
        alert("Split failed. Ensure it's a valid PDF.");
    }
}

function showSplitSuccessUI() {
    const container = document.getElementById('tool-container');
    container.innerHTML = `
        <div id="tool-icon" style="color:#16a34a; font-size:90px;"><i class="fa-solid fa-scissors"></i></div>
        <h2 style="color:#16a34a;">SUCCESSFUL SPLIT COMPLETED!</h2>
        <p style="font-weight:bold;">All pages extracted into "Kellyne Split PDF" ZIP.</p>
        <button class="btn-action" onclick="window.location.reload()" style="background:#0f172a; margin-top:20px; padding:15px 50px;">BACK TO HOME</button>
    `;
}

// Auto-trigger if mode is already Split PDF
if (document.getElementById('tool-title').innerText === "Split PDF") {
    handleSplitSelection();
}