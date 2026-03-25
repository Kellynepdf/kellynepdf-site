// KellynePDF - Merge Logic
let pdfFiles = [];

const fileInput = document.getElementById('fileInput');
const mergeBtn = document.getElementById('merge-btn');
const previewContainer = document.getElementById('file-list-preview');

// Handle File Selection
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    pdfFiles = [...pdfFiles, ...files];
    renderFileList();
    toggleMergeButton();
});

// Render the UI for uploaded files
function renderFileList() {
    previewContainer.innerHTML = '';
    pdfFiles.forEach((file, index) => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="three-dots-container">
                <button class="dots-btn" onclick="toggleMenu(${index})">⋮</button>
                <div id="menu-${index}" class="dropdown-menu">
                    <button onclick="shareFile('whatsapp', ${index})">Share to WhatsApp</button>
                    <button onclick="shareFile('email', ${index})">Share via Email</button>
                    <button onclick="shareFile('drive', ${index})">Save to Drive</button>
                    <button onclick="removeFile(${index})" style="color: #ff4d4d;">Remove File</button>
                </div>
            </div>
        `;
        previewContainer.appendChild(fileCard);
    });
}

// Toggle Merge Button state
function toggleMergeButton() {
    mergeBtn.disabled = pdfFiles.length < 2;
}

// Remove file from list
function removeFile(index) {
    pdfFiles.splice(index, 1);
    renderFileList();
    toggleMergeButton();
}

// Toggle 3-Dots Menu
function toggleMenu(index) {
    const menu = document.getElementById(`menu-${index}`);
    const allMenus = document.querySelectorAll('.dropdown-menu');
    allMenus.forEach(m => { if(m !== menu) m.style.display = 'none'; });
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Merge Logic using PDF-Lib
async function executeMerge() {
    mergeBtn.innerText = "Merging... Please wait";
    mergeBtn.disabled = true;

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
        link.click();

        mergeBtn.innerText = "Merge Successful!";
    } catch (error) {
        console.error("Error merging PDFs:", error);
        alert("An error occurred during merging. Please try again.");
    } finally {
        setTimeout(() => {
            mergeBtn.innerText = "Merge PDF";
            toggleMergeButton();
        }, 3000);
    }
}

// Share Logic Placeholder
function shareFile(platform, index) {
    const file = pdfFiles[index];
    alert(`Preparing to share ${file.name} via ${platform}...`);
    // Add specific API logic for WhatsApp/Email/Drive here
}

mergeBtn.addEventListener('click', executeMerge);

// Close dropdowns when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dots-btn')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
    }
}