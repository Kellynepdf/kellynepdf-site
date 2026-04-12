/**
 * js/convert-from-pdf/pdf-to-jpg.js
 * Professional PDF to JPG Conversion Engine
 * Features: Bulk Processing, High Resolution, Sequential Queue, and Memory Cleanup
 */

window.runPDFtoJPG = window.runPdfToJpg = async function(files) {
    if (!files || files.length === 0) return;

    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const titleBox = document.getElementById('tool-title-box');

    // Filter valid .pdf files
    const pdfFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');

    if (pdfFiles.length === 0) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: PLEASE UPLOAD PDF FILES</span>`;
        setTimeout(window.resetUI, 3000);
        return;
    }

    // UI Update - Ready to Convert
    if (defaultIcon) defaultIcon.style.display = 'none';
    statusLabel.innerText = pdfFiles.length > 1 ? `${pdfFiles.length} PDFS SELECTED` : `PDF: ${pdfFiles[0].name}`;
    
    actionBtn.style.setProperty('display', 'block', 'important');
    actionBtn.className = "download-ready";
    actionBtn.innerHTML = `<span>CONVERT TO JPG</span>`;
    actionBtn.style.backgroundColor = "#e5322d"; 
    actionBtn.style.color = "#fff"; 
    actionBtn.style.padding = "15px 40px";
    actionBtn.style.borderRadius = "50px";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.fontSize = "18px";
    actionBtn.style.fontWeight = "900";
    actionBtn.style.border = "none";
    actionBtn.style.opacity = "1";
    actionBtn.style.pointerEvents = "auto";

    actionBtn.onclick = async () => {
        actionBtn.innerHTML = `<span>PROCESSING...</span>`;
        actionBtn.style.pointerEvents = "none";
        actionBtn.style.opacity = "0.7";

        try {
            const zip = new JSZip();
            const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
            if (!pdfjsLib) throw new Error("PDF.js library not found");
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            let pdfCount = 0;
            // 2. SEQUENTIAL ASYNC QUEUE
            for (const file of pdfFiles) {
                pdfCount++;
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                
                // 3. PAGE-BY-PAGE EXTRACTION
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    // Update UI Progress
                    if (titleBox) {
                        titleBox.innerText = `CONVERTING PDF [${pdfCount}/${pdfFiles.length}] (PAGE [${pageNum}/${pdf.numPages}])...`;
                    }
                    statusLabel.innerText = `Extracting Page ${pageNum} of ${file.name}`;

                    const page = await pdf.getPage(pageNum);
                    
                    // CRITICAL - High Resolution
                    const scale = 2.0; 
                    const viewport = page.getViewport({ scale: scale });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // CRITICAL - White Background
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    await page.render(renderContext).promise;

                    // 4. GENERATING & ZIPPING
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                    const fileName = `${file.name.replace(/\.pdf$/i, '')}_Page_${pageNum}.jpg`;
                    zip.file(fileName, blob);

                    // CLEANUP
                    canvas.width = 0;
                    canvas.height = 0;
                }
            }

            statusLabel.innerText = "Finalizing ZIP archive...";
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = "KELLYNEPDF_PDF_TO_JPG.zip";
            link.click();

            // 6. FINAL RESET LOGIC
            if (titleBox) {
                titleBox.innerText = "CONVERSION SUCCESSFULLY COMPLETED";
                titleBox.style.color = "#008000";
                titleBox.style.fontSize = "22px";
            }

            actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
            actionBtn.style.backgroundColor = "#111";
            actionBtn.style.color = "#fff";
            actionBtn.style.opacity = "1";
            actionBtn.style.pointerEvents = "auto";
            actionBtn.onclick = () => window.location.reload(true);

        } catch (error) {
            console.error("PDF to JPG Error:", error);
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">FAILED. PLEASE REFRESH.</span>`;
            setTimeout(window.resetUI, 3000);
        }
    };
};
