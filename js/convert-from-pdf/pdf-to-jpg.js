/**
 * js/convert-from-pdf/pdf-to-jpg.js
 * Advanced PDF to JPG Conversion Engine
 * Features: Recursive Folder Support, Sequential Bulk Queue, High Resolution
 */

window.runPDFtoJPG = window.runPdfToJpg = async function(initialFiles) {
    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const titleBox = document.getElementById('tool-title-box');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    let processingQueue = [];

    // Helper: Traverse folder tree recursively
    async function traverseFileTree(item, path = "") {
        if (item.isFile) {
            const file = await new Promise((resolve) => item.file(resolve));
            if (file.name.toLowerCase().endsWith('.pdf')) {
                processingQueue.push(file);
            }
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const entries = await new Promise((resolve) => dirReader.readEntries(resolve));
            for (const entry of entries) {
                await traverseFileTree(entry, path + item.name + "/");
            }
        }
    }

    // Helper: Handle file list (flatten folders)
    async function collectFiles(items) {
        processingQueue = [];
        statusLabel.innerText = "Scanning folders...";
        
        for (const item of items) {
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry) await traverseFileTree(entry);
            } else if (item instanceof File) {
                if (item.name.toLowerCase().endsWith('.pdf')) processingQueue.push(item);
            }
        }
        
        if (processingQueue.length > 0) {
            showReadyState();
        } else {
            statusLabel.innerHTML = `<span style="color:#e5322d;">No PDF files found.</span>`;
            setTimeout(() => { if (processingQueue.length === 0) window.resetUI(); }, 3000);
        }
    }

    function showReadyState() {
        if (defaultIcon) defaultIcon.style.display = 'none';
        statusLabel.innerText = `${processingQueue.length} PDF(S) READY FOR CONVERSION`;
        statusLabel.style.color = "#111";
        statusLabel.style.fontWeight = "bold";

        actionBtn.style.setProperty('display', 'block', 'important');
        actionBtn.className = "download-ready";
        actionBtn.innerHTML = `<span>CONVERT TO JPG</span>`;
        actionBtn.style.backgroundColor = "#e5322d";
        actionBtn.style.pointerEvents = "auto";
        actionBtn.style.opacity = "1";

        actionBtn.onclick = startConversion;
    }

    async function startConversion() {
        actionBtn.innerHTML = `<span>PROCESSING...</span>`;
        actionBtn.style.pointerEvents = "none";
        actionBtn.style.opacity = "0.7";

        try {
            const zip = new JSZip();
            const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
            if (!pdfjsLib) throw new Error("PDF.js not loaded");
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            let pdfIdx = 0;
            for (const file of processingQueue) {
                pdfIdx++;
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    if (titleBox) {
                        titleBox.innerText = `CONVERTING PDF [${pdfIdx}/${processingQueue.length}] (PAGE [${pageNum}/${pdf.numPages}])...`;
                    }
                    statusLabel.innerText = `Processing: ${file.name} (Page ${pageNum})`;

                    const page = await pdf.getPage(pageNum);
                    const scale = 2.0;
                    const viewport = page.getViewport({ scale });
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    // Fix: White Background for Transparency
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    await page.render({ canvasContext: ctx, viewport }).promise;

                    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.95));
                    const safeName = file.name.replace(/\.[^/.]+$/, "");
                    zip.file(`${safeName}_Page_${pageNum}.jpg`, blob);

                    // Memory Cleanup
                    canvas.width = canvas.height = 0;
                }
            }

            statusLabel.innerText = "Finalizing ZIP Archive...";
            const zipContent = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `KELLYNEPDF_PDF_TO_JPG.zip`;
            link.click();

            // Success & Final Reset Button
            if (titleBox) {
                titleBox.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
                titleBox.style.color = "#008000";
            }
            statusLabel.innerText = "All files processed successfully.";
            
            actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
            actionBtn.style.background = "#111";
            actionBtn.style.opacity = "1";
            actionBtn.style.pointerEvents = "auto";
            actionBtn.onclick = () => window.location.reload(true);

        } catch (err) {
            console.error(err);
            statusLabel.innerHTML = `<span style="color:#e5322d;">CRITICAL ERROR. PLEASE REFRESH.</span>`;
        }
    }

    // --- OVERRIDE LISTENERS FOR ADVANCED DROP SUPPORT ---
    if (dropZone) {
        dropZone.ondragover = (e) => { e.preventDefault(); e.stopPropagation(); };
        dropZone.ondrop = async (e) => {
            e.preventDefault(); e.stopPropagation();
            if (e.dataTransfer.items) {
                await collectFiles(Array.from(e.dataTransfer.items));
            }
        };
    }

    if (fileInput) {
        fileInput.onchange = async (e) => {
            await collectFiles(Array.from(e.target.files));
        };
    }

    // Handle initial passed files (from global drop)
    if (initialFiles && initialFiles.length > 0) {
        statusLabel.innerText = "Processing selection...";
        // If they were passed as Files, check if we need to re-scan
        // But since we can't get webkit entries from a passed File array easily,
        // we'll just process them directly as PDFs.
        processingQueue = initialFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        if (processingQueue.length > 0) showReadyState();
    }
};
