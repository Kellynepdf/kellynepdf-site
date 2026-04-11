// js/main.js - KELLYNE PDF Architectural Hub

const toolDocs = {
    'Merge PDF': { what: 'Combine multiple PDF files into one professional document instantly.', how: 'Upload 2 or more PDFs, arrange them in order, and click Merge.' },
    'Split PDF': { what: 'Divide a large PDF into smaller parts or extract individual pages.', how: 'Upload your file, specify the page ranges, and download segments.' },
    'Compress PDF': { what: 'Reduce file size while maintaining the highest possible quality.', how: 'Select a heavy PDF and let our optimization engine shrink it.' },
    'JPG to PDF': { what: 'Convert images into high-quality PDF files.', how: 'Upload images, adjust settings, and generate PDF.' },
    'WORD to PDF': { what: 'Transform Word documents into readable PDF format.', how: 'Upload Word file and download the converted PDF.' },
    'EXCEL to PDF': { what: 'Convert spreadsheets into organized PDF tables.', how: 'Select your .xlsx file and download PDF version.' },
    'PPT to PDF': { what: 'Transform PowerPoint slides into portable PDF documents.', how: 'Upload slides and get a PDF version.' },
    'HTML to PDF': { what: 'Save web pages as offline PDF documents with one click.', how: 'Paste URL or upload HTML to generate PDF.' },
    'PDF to JPG': { what: 'Extract every single page of your PDF as high-resolution images.', how: 'Upload PDF and receive a ZIP of images.' },
    'PDF to WORD': { what: 'Convert PDF back into editable Microsoft Word documents.', how: 'Upload PDF and rebuild the layout.' },
    'PDF to EXCEL': { what: 'Extract PDF tables directly into Excel spreadsheets.', how: 'Select PDF with tables and download .xlsx.' },
    'PDF to PPT': { what: 'Convert PDF pages back into editable PowerPoint slides.', how: 'Upload file and receive .pptx slides.' },
    'PDF to HTML': { what: 'Turn your PDF document into a responsive HTML web page.', how: 'Upload file and create HTML code.' },
    'PDF to PDF/A': { what: 'Standardize PDF for long-term ISO digital archiving.', how: 'Upload file and convert it.' },
    'Remove Pages': { what: 'Permanently delete unwanted pages from your document.', how: 'Select pages you want to discard and save.' },
    'Extract Pages': { what: 'Save specific pages as a brand new PDF.', how: 'Check required pages and click extract.' },
    'Rename PDF': { what: 'Professionally rename your PDF document filename instantly.', how: 'Type the new name and click update.' },
    'Scan to PDF': { what: 'Create PDF documents instantly using your camera.', how: 'Grant camera permissions and capture.' },
    'Repair PDF': { what: 'Recover data from corrupted or broken PDF files.', how: 'Upload damaged file; we will fix the structure.' },
    'OCR PDF': { what: 'Convert scanned non-selectable PDFs into searchable text.', how: 'Upload scan and let OCR recognize text.' },
    'Rotate PDF': { what: 'Correct the orientation of upside-down pages.', how: 'Use rotation icons to fix alignment.' },
    'Add Numbers': { what: 'Add automatic numbering to headers or footers.', how: 'Choose style and position, then apply.' },
    'Add Watermark': { what: 'Protect your property with text or image stamp.', how: 'Enter text/logo and set transparency.' },
    'Crop PDF': { what: 'Trim margins or specific areas of PDF pages.', how: 'Select crop area and apply changes.' },
    'Edit PDF': { what: 'Directly add text or shapes to PDF content.', how: 'Use online editor tools to type on pages.' },
    'Unlock PDF': { what: 'Remove password security and printing restrictions.', how: 'Enter password to permanently remove encryption.' },
    'Protect PDF': { what: 'Encrypt PDF documents with a strong password.', how: 'Set secure password and download.' },
    'Sign PDF': { what: 'Apply digital signatures to any page of your PDF.', how: 'Draw signature and place it on document.' },
    'Redact PDF': { what: 'Permanently black out sensitive text or images.', how: 'Select private areas to hide forever.' },
    'Compare PDF': { what: 'Identify differences between two versions of a PDF.', how: 'Upload both files and see highlights.' },
    'AI Summarizer': { what: 'Summarize long PDF documents into key points using AI.', how: 'Upload PDF and get instant summary.' },
    'Translate PDF': { what: 'Translate the entire PDF into multiple languages.', how: 'Upload file and select target language.' },
    'Digital Sign': { what: 'Fast electronic signature for any user or document.', how: 'Draw or type your sign and place it.' },
    'Aadhar eSign': { what: 'Official Indian electronic signature using Aadhaar OTP.', how: 'Verify via UIDAI and sign legally.' },
    'Global eSign': { what: 'Enterprise-grade digital signature for global business.', how: 'Verify global ID and sign securely.' }
};

const toolScriptsMap = {
    'Merge PDF': 'js/organize/merge-pdf.js',
    'Split PDF': 'js/organize/split-pdf.js',
    'Remove Pages': 'js/organize/remove-pages.js',
    'Extract Pages': 'js/organize/extract-pages.js',
    'Rename PDF': 'js/organize/organize-pdf.js',
    'Scan to PDF': 'js/organize/scan-to-pdf.js',
    'Compress PDF': 'js/organize/compress-pdf.js',
    'Repair PDF': 'js/optimize/repair-pdf.js',
    'OCR PDF': 'js/optimize/ocr-pdf.js',
    'JPG to PDF': 'js/convert-to-pdf/jpg-to-pdf.js',
    'WORD to PDF': 'js/convert-to-pdf/word-to-pdf.js',
    'EXCEL to PDF': 'js/convert-to-pdf/excel-to-pdf.js',
    'PPT to PDF': 'js/convert-to-pdf/powerpoint-to-pdf.js',
    'HTML to PDF': 'js/convert-to-pdf/html-to-pdf.js',
    'PDF to JPG': 'js/convert-from-pdf/pdf-to-jpg.js',
    'PDF to WORD': 'js/convert-from-pdf/pdf-to-word.js',
    'PDF to EXCEL': 'js/convert-from-pdf/pdf-to-excel.js',
    'PDF to PPT': 'js/convert-from-pdf/pdf-to-powerpoint.js',
    'PDF to PDF/A': 'js/convert-from-pdf/pdf-to-pdfa.js',
    'PDF to HTML': 'js/convert-from-pdf/pdf-to-html.js',
    'Rotate PDF': 'js/edit/rotate-pdf.js',
    'Add Numbers': 'js/edit/add-page-numbers.js',
    'Add Watermark': 'js/edit/add-watermark.js',
    'Crop PDF': 'js/edit/crop-pdf.js',
    'Edit PDF': 'js/edit/edit-pdf.js',
    'Unlock PDF': 'js/security/unlock-pdf.js',
    'Protect PDF': 'js/security/protect-pdf.js',
    'Sign PDF': 'js/security/sign-pdf.js',
    'Redact PDF': 'js/security/redact-pdf.js',
    'Compare PDF': 'js/security/compare-pdf.js',
    'AI Summarizer': 'js/intelligence/ai-summarizer.js',
    'Translate PDF': 'js/intelligence/translate-pdf.js'
};

const loadedScripts = new Set();
window.currentActiveTool = 'MERGE PDF'; // Default tool state

window.loadToolScript = function loadToolScript(name) {
    if (toolScriptsMap[name] && !loadedScripts.has(name)) {
        const script = document.createElement('script');
        script.src = toolScriptsMap[name];
        script.onload = () => { loadedScripts.add(name); };
        document.body.appendChild(script);
    }
};

window.updateTool = function(name) {
    try {
        history.pushState(null, '', '#' + name.toLowerCase().replace(/ /g, '-'));
    } catch (e) {}

    const titleBox = document.getElementById('tool-title-box');
    if (titleBox) {
        window.currentActiveTool = name.toUpperCase();
        titleBox.innerText = window.currentActiveTool;
        titleBox.style.color = '#e5322d';
        titleBox.style.fontSize = '';
        titleBox.style.opacity = '1';
    }

    const infoArea = document.getElementById('tool-info-area');
    if (infoArea && toolDocs[name]) {
        infoArea.style.display = 'block';
        animateText('info-what', toolDocs[name].what);
        animateText('info-how', toolDocs[name].how);
    }

    resetUI();
    
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.add('active-tool');
        dropZone.classList.remove('success-tool-glow');
    }

    loadToolScript(name);
}

window.animateText = function(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    text.split("").forEach((char, i) => {
        const span = document.createElement("span");
        span.innerText = char === " " ? "\u00A0" : char;
        span.className = "char-anim";
        span.style.animationDelay = `${i * 0.012}s`;
        el.appendChild(span);
    });
}

window.resetUI = function() {
    const dropZone = document.getElementById('drop-zone');
    const defaultIcon = document.getElementById('default-upload-icon');
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');

    if (defaultIcon) defaultIcon.style.display = 'flex';
    
    if (statusLabel) {
        statusLabel.innerText = "Click or Drag & Drop Files";
        statusLabel.style.color = "";
        statusLabel.style.fontSize = "";
        statusLabel.style.fontWeight = "";
    }

    if (btn) {
        btn.innerHTML = "";
        btn.className = "";
        btn.removeAttribute('style');
        btn.style.setProperty('display', 'none', 'important');
    }

    if (titleBox) {
        titleBox.style.color = '#e5322d';
        titleBox.style.fontSize = '';
        titleBox.style.fontWeight = '';
        titleBox.innerText = window.currentActiveTool || 'MERGE PDF';
    }

    if (dropZone) {
        dropZone.classList.remove('success-tool-glow');
        dropZone.classList.add('active-tool');
    }

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = "";
}

// --- GLOBAL FILE HANDLING (Architectural Fix) ---
window.handleGlobalFiles = async function(files) {
    console.log("handleGlobalFiles triggered with", files.length, "files");
    if (!files || files.length === 0) return;
    const tool = window.currentActiveTool || 'MERGE PDF';
    const statusLabel = document.getElementById('status-label');

    // PDF Validation
    const requirePdfTools = ['MERGE PDF', 'SPLIT PDF', 'COMPRESS PDF', 'REPAIR PDF', 'ROTATE PDF'];
    if (requirePdfTools.includes(tool)) {
        const isPdf = files[0] && (files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf'));
        if (!isPdf) {
            statusLabel.innerHTML = `<span style="color: #ff0000; font-weight: 900;">ERROR: INVALID FILE TYPE</span>`;
            setTimeout(resetUI, 2500);
            return;
        }
    }

    statusLabel.innerText = `Analyzing ${files[0].name}...`;

    // Tool Script Waiter
    const waitForTool = async (funcName, scriptName) => {
        if (typeof window[funcName] !== 'function') {
            console.log("Lazy loading tool engine:", scriptName);
            loadToolScript(scriptName);
            let retries = 0;
            while (typeof window[funcName] !== 'function' && retries < 40) {
                await new Promise(r => setTimeout(r, 100));
                retries++;
            }
        }
        return typeof window[funcName] === 'function';
    };

    // Tool Router
    if (tool.includes("MERGE")) {
        if (await waitForTool('runMerge', 'Merge PDF')) await window.runMerge(files);
    } else if (tool.includes("SPLIT")) {
        if (await waitForTool('runSplit', 'Split PDF')) await window.runSplit(files);
    } else if (tool.includes("COMPRESS")) {
        if (await waitForTool('runCompress', 'Compress PDF')) await window.runCompress(files);
    } else if (tool.includes("JPG TO PDF")) {
        if (await waitForTool('runJpgToPdf', 'JPG to PDF')) await window.runJpgToPdf(files);
    } else {
        console.log("No specific engine for:", tool);
    }
}

// Initialization Logics
document.addEventListener("DOMContentLoaded", () => {
    animateText('sub-heading', "KellynePDF - All-In-One Solution");
    
    // Core Background Logic (500 Stars/Dots)
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 500, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#bdc3c7", "#e5322d"] },
                "shape": { "type": ["circle", "star"] },
                "opacity": { "value": 0.5, "random": true },
                "size": { "value": 4, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#e0e0e0", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } } },
            "retina_detect": true
        });
    }

    // Bind Global Listeners
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (window.handleGlobalFiles) {
                window.handleGlobalFiles(Array.from(e.target.files));
            }
        });
    }

    // Universal Drag & Drop Listeners
    window.addEventListener('dragenter', (e) => {
        e.preventDefault(); e.stopPropagation();
        document.body.classList.add('drag-active');
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault(); e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        document.body.classList.add('drag-active');
    });

    window.addEventListener('dragleave', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.classList.remove('drag-active');
        }
    });

    window.addEventListener('drop', (e) => {
        e.preventDefault(); e.stopPropagation();
        document.body.classList.remove('drag-active');
        const files = Array.from(e.dataTransfer.files);
        if (window.handleGlobalFiles) {
            window.handleGlobalFiles(files);
        }
    });

    // Default Tool Init
    updateTool('Merge PDF');
});
