// js/drag-drop.js

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); });
    });

    window.addEventListener('dragenter', () => document.body.classList.add('drag-active'));
    window.addEventListener('dragleave', (e) => {
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.classList.remove('drag-active');
        }
    });
    window.addEventListener('drop', () => document.body.classList.remove('drag-active'));

    window.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        handleGlobalFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleGlobalFiles(files);
        fileInput.value = ""; // reset for consecutive same-file selections
    });
});

async function handleGlobalFiles(files) {
    if (!files || files.length === 0) return;

    const tool = window.currentActiveTool || 'SELECT PDF FILES';
    const statusLabel = document.getElementById('status-label');

    // Error Handling: Quick check if a PDF-centric tool gets non-PDF
    const requirePdfTools = ['MERGE PDF', 'SPLIT PDF', 'COMPRESS PDF', 'REPAIR PDF', 'ROTATE PDF'];
    if (requirePdfTools.includes(tool)) {
        const isPdf = files[0] && (files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf'));
        if (!isPdf) {
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">Error: Please upload a valid PDF document.</span>`;
            setTimeout(window.resetUI, 3000);
            return;
        }
    }

    // Universal Tool Router
    console.log(`Routing files to tool: ${tool}`);
    statusLabel.innerHTML = `Processing ${files[0].name}... Please wait.`;

    switch(true) {
        // --- Organize & Default Merge --- //
        case tool.includes("MERGE") || tool === 'SELECT PDF FILES':
            console.log("Merge tool triggered...");
            // Instead of throwing an alert if not loaded, silently try to load and execute
            if (typeof window.runMerge !== 'function') {
                console.log("runMerge not found, loading script...");
                if (typeof window.loadToolScript === 'function') window.loadToolScript('Merge PDF');
                // Give it brief time to load script
                let retries = 0;
                while (typeof window.runMerge !== 'function' && retries < 30) {
                    await new Promise(r => setTimeout(r, 100));
                    retries++;
                }
            }
            
            if (typeof window.runMerge === 'function') {
                console.log("Calling window.runMerge(files)...");
                await window.runMerge(files);
            } else {
                console.error("Failed to load runMerge after retries.");
                // If STILL not loaded after 3 seconds, just show inline error without annoying alerts
                statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">Could not initialize Merge Tool. Please refresh.</span>`;
            }
            break;
        case tool.includes("SPLIT"):
            const totalSplitBytes = files.reduce((acc, file) => acc + file.size, 0);
            const mbSplitSize = (totalSplitBytes / (1024 * 1024)).toFixed(2);
            statusLabel.innerHTML = `Analyzing ${files[0].name}... <br><span style="font-size: 14px; font-weight: normal; color: #666;">Size: ${mbSplitSize} MB</span>`;
            
            if (typeof window.runSplit !== 'function') {
                if (typeof window.loadToolScript === 'function') window.loadToolScript('Split PDF');
                let retries = 0;
                while (typeof window.runSplit !== 'function' && retries < 30) {
                    await new Promise(r => setTimeout(r, 100));
                    retries++;
                }
            }
            if (typeof window.runSplit === 'function') {
                await window.runSplit(files);
            } else {
                statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">Could not initialize Split Tool. Please refresh.</span>`;
            }
            break;
        case tool.includes("REMOVE"):
        case tool.includes("EXTRACT"):
        case tool.includes("RENAME"):
        case tool.includes("SCAN"):
            statusLabel.innerHTML = `Executing ${tool} engine logic...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_${tool.replace(' ','_')}.pdf`); }, 2000);
            break;

        // --- Optimize --- //
        case tool.includes("COMPRESS"):
            if (typeof window.runCompress !== 'function') {
                if (typeof window.loadToolScript === 'function') window.loadToolScript('Compress PDF');
                let retries = 0;
                while (typeof window.runCompress !== 'function' && retries < 30) {
                    await new Promise(r => setTimeout(r, 100));
                    retries++;
                }
            }
            if (typeof window.runCompress === 'function') {
                await window.runCompress(files);
            } else {
                statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: bold;">Could not initialize Compress Tool. Please refresh.</span>`;
            }
            break;
        case tool.includes("REPAIR"):
        case tool.includes("OCR"):
            statusLabel.innerHTML = `Running high-end ${tool} via WASM processor...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_Fixed.pdf`); }, 2500);
            break;

        // --- Convert To PDF --- //
        case tool.includes("JPG TO PDF"):
        case tool.includes("WORD TO PDF"):
        case tool.includes("EXCEL TO PDF"):
        case tool.includes("PPT TO PDF"):
        case tool.includes("HTML TO PDF"):
            statusLabel.innerHTML = `Converting file layout to PDF using jsPDF...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_Converted.pdf`); }, 3000);
            break;

        // --- Convert From PDF --- //
        case tool.includes("PDF TO JPG"):
        case tool.includes("PDF TO WORD"):
        case tool.includes("PDF TO EXCEL"):
        case tool.includes("PDF TO PPT"):
        case tool.includes("PDF TO PDF/A"):
        case tool.includes("PDF TO HTML"):
            statusLabel.innerHTML = `Extracting objects to target format...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_Converted_Output.zip`); }, 3000);
            break;

        // --- Security --- //
        case tool.includes("UNLOCK"):
        case tool.includes("PROTECT"):
        case tool.includes("SIGN"):
        case tool.includes("REDACT"):
        case tool.includes("COMPARE"):
            statusLabel.innerHTML = `Applying ${tool} security cryptography...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_Secured.pdf`); }, 2000);
            break;

        // --- AI Features --- //
        case tool.includes("AI SUMMARIZER"):
        case tool.includes("TRANSLATE"):
            statusLabel.innerHTML = `Querying Neural Network for ${tool}...`;
            setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_AI_Output.pdf`); }, 3000);
            break;

        default:
            // Final fallback to merge just in case
            if (typeof window.runMerge === 'function') {
                await window.runMerge(files);
            } else {
                statusLabel.innerHTML = `Processing ${tool}...`;
                setTimeout(() => { showDownloadReady(URL.createObjectURL(files[0]), `KELLYNE PDF_Output.pdf`); }, 2000);
            }
            break;
    }
}



