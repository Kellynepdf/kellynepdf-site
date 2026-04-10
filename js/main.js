// js/ui-manager.js

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
    'Merge PDF': '/js/organize/merge-pdf.js',
    'Split PDF': '/js/organize/split-pdf.js',
    'Remove Pages': '/js/organize/remove-pages.js',
    'Extract Pages': '/js/organize/extract-pages.js',
    'Rename PDF': '/js/organize/organize-pdf.js',
    'Scan to PDF': '/js/organize/scan-to-pdf.js',
    'Compress PDF': '/js/organize/compress-pdf.js',
    'Repair PDF': '/js/optimize/repair-pdf.js',
    'OCR PDF': '/js/optimize/ocr-pdf.js',
    'JPG to PDF': '/js/convert-to-pdf/jpg-to-pdf.js',
    'WORD to PDF': '/js/convert-to-pdf/word-to-pdf.js',
    'EXCEL to PDF': '/js/convert-to-pdf/excel-to-pdf.js',
    'PPT to PDF': '/js/convert-to-pdf/powerpoint-to-pdf.js',
    'HTML to PDF': '/js/convert-to-pdf/html-to-pdf.js',
    'PDF to JPG': '/js/convert-from-pdf/pdf-to-jpg.js',
    'PDF to WORD': '/js/convert-from-pdf/pdf-to-word.js',
    'PDF to EXCEL': '/js/convert-from-pdf/pdf-to-excel.js',
    'PDF to PPT': '/js/convert-from-pdf/pdf-to-powerpoint.js',
    'PDF to PDF/A': '/js/convert-from-pdf/pdf-to-pdfa.js',
    'PDF to HTML': '/js/convert-from-pdf/pdf-to-html.js',
    'Rotate PDF': '/js/edit/rotate-pdf.js',
    'Add Numbers': '/js/edit/add-page-numbers.js',
    'Add Watermark': '/js/edit/add-watermark.js',
    'Crop PDF': '/js/edit/crop-pdf.js',
    'Edit PDF': '/js/edit/edit-pdf.js',
    'Unlock PDF': '/js/security/unlock-pdf.js',
    'Protect PDF': '/js/security/protect-pdf.js',
    'Sign PDF': '/js/security/sign-pdf.js',
    'Redact PDF': '/js/security/redact-pdf.js',
    'Compare PDF': '/js/security/compare-pdf.js',
    'AI Summarizer': '/js/intelligence/ai-summarizer.js',
    'Translate PDF': '/js/intelligence/translate-pdf.js'
};

const loadedScripts = new Set();

let hideTimeout;

window.loadToolScript = function loadToolScript(name) {
    if (toolScriptsMap[name] && !loadedScripts.has(name)) {
        console.log(`Lazy loading script: ${toolScriptsMap[name]}`);
        const script = document.createElement('script');
        script.src = toolScriptsMap[name];
        script.onload = () => {
            console.log(`Successfully loaded ${name}`);
            loadedScripts.add(name);
        };
        script.onerror = () => {
            console.error(`Error loading script: ${toolScriptsMap[name]}`);
            // Don't add to loadedScripts so it can retry
        };
        document.body.appendChild(script);
    }
};
        
        // Bonus Tip 3: WASM Support - check for High-end tools
        if (name === "OCR PDF" || name === "Repair PDF") {
            console.log("WASM Support Enabled: Instructing WebAssembly core load for High-end PDF manipulation...");
            // Load WASM core when implemented
        }
    }
};

window.currentActiveTool = 'SELECT PDF FILES';

window.updateTool = function(name) {
    clearTimeout(hideTimeout);
    try {
        history.pushState(null, '', '/' + name.toLowerCase().replace(/ /g, '-'));
    } catch (e) {
        console.warn("history.pushState failed.");
    }

    // Immediately Set DOM without timeouts
    const titleBox = document.getElementById('tool-title-box');
    if (titleBox) {
        window.currentActiveTool = name.toUpperCase();
        titleBox.innerText = window.currentActiveTool;
        titleBox.style.color = '#e5322d'; // Force red text for new tool state
        titleBox.style.fontSize = ''; // Scrub large victory sizes
        titleBox.style.opacity = '1';
    }

    const infoArea = document.getElementById('tool-info-area');
    if (infoArea) {
        infoArea.style.display = 'block';
        if (toolDocs[name]) {
            animateText('info-what', toolDocs[name].what);
            animateText('info-how', toolDocs[name].how);
        }
    }

    // Reset UI styling (Action Button, Default Cloud)
    resetUI();
    
    // Hero Box Integration
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        if (name.toUpperCase() !== 'SELECT PDF FILES') {
            dropZone.classList.add('active-tool');
            dropZone.classList.remove('success-tool-glow');
        } else {
            dropZone.classList.remove('active-tool');
            dropZone.classList.remove('success-tool-glow');
            dropZone.style.border = ''; // Revert legacy
            dropZone.style.boxShadow = ''; // Revert legacy
        }
    }

    // Lazy Load the appropriate JS file
    loadToolScript(name);
}

window.animateText = function(id, text) {
    const el = document.getElementById(id);
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
    let defaultIcon = document.getElementById('default-upload-icon');
    let btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');

    // 1. Re-show Cloud Upload Icon & Text
    if (defaultIcon) {
        defaultIcon.style.display = 'flex';
    }
    
    if (statusLabel) {
        statusLabel.innerText = "Click or Drag & Drop Files to Begin";
        statusLabel.style.color = "#444";
        statusLabel.style.fontWeight = "500";
        statusLabel.style.fontSize = "18px";
    }

    // 2. Hide Action Button — Clean all states
    if (btn) {
        btn.innerHTML = '';
        btn.onclick = null;
        btn.disabled = false;
        btn.className = ''; 
        btn.removeAttribute('style');
        btn.style.setProperty('display', 'none', 'important');
    }

    // 3. Clear Title Area — Reset colors and sizes
    if (titleBox) {
        titleBox.style.color = '#e5322d';
        titleBox.style.fontSize = '';
        titleBox.style.fontWeight = '';
        
        if (window.currentActiveTool && window.currentActiveTool !== 'SELECT PDF FILES') {
            titleBox.innerText = window.currentActiveTool;
        } else {
            window.currentActiveTool = 'SELECT PDF FILES';
            titleBox.innerText = 'SELECT PDF FILES';
        }
    }

    // 4. Glow Reset
    const dropZoneEl = document.getElementById('drop-zone');
    if (dropZoneEl) {
        dropZoneEl.classList.remove('success-tool-glow');
        if (window.currentActiveTool && window.currentActiveTool !== 'SELECT PDF FILES') {
            dropZoneEl.classList.add('active-tool');
        } else {
            dropZoneEl.classList.remove('active-tool');
        }
    }

    // 5. Cleanup Inputs & URL
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = "";
    
    try { 
        window.location.hash = ''; 
        // Force refresh only if specifically needed, usually hash clear is enough
    } catch(e) {}
}

window.showDownloadReady = function(urlOrFiles, filename) {
    const btn = document.getElementById('action-button');
    if (btn) {
        btn.innerHTML = `<span class="upload-label-text" id="status-label" style="color: white">Download File${Array.isArray(urlOrFiles) ? 's' : ''}</span>`;
        btn.style.backgroundColor = "#e5322d"; // Brand Red
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.classList.add('download-ready');

        btn.onclick = async (e) => {
            e.stopPropagation(); // prevent file input dialog

            if (Array.isArray(urlOrFiles) && urlOrFiles.length >= 10) {
                // Zip 10+ files
                const zip = new JSZip();
                for (let i = 0; i < urlOrFiles.length; i++) {
                    const fileObj = urlOrFiles[i];
                    // Fetch blob if necessary or use array buffer
                    const response = await fetch(fileObj.url);
                    const blob = await response.blob();
                    zip.file(`kellynepdf_file_${i + 1}.pdf`, blob);
                }
                const zipBlob = await zip.generateAsync({ type: "blob" });
                const zipUrl = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = zipUrl;
                link.download = `kellynepdf_bulk_processed.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } else if (Array.isArray(urlOrFiles)) {
                // Download multiple files individually if < 10
                for (const fileObj of urlOrFiles) {
                    const link = document.createElement('a');
                    link.href = fileObj.url;
                    link.download = `kellynepdf_${filename}_${fileObj.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                // Single file download
                const link = document.createElement('a');
                link.href = urlOrFiles;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Revert after 5 seconds to select file
            setTimeout(resetUI, 5000);
        };
    }
}

// Normalization for PDF Libraries
if (typeof PDFLib === 'undefined' && typeof pdfLib !== 'undefined') {
    window.PDFLib = pdfLib;
} else if (typeof PDFLib === 'undefined' && typeof window.jspdf !== 'undefined') {
    // Some tools might use jspdf as fallback, but for pdf-lib it's specific
}

// Initialization Logics
document.addEventListener("DOMContentLoaded", () => {
    animateText('sub-heading', "KellynePDF - All-In-One Solution");

    // Initialize Particles.js correctly (Stars and Dots effect)
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": {
                    "value": 120,
                    "density": { "enable": true, "value_area": 800 }
                },
                "color": { "value": ["#1a237e", "#90caf9", "#e5322d"] }, // Added brand red
                "shape": {
                    "type": ["circle", "star"],
                    "stroke": { "width": 0, "color": "#000000" }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false }
                },
                "size": {
                    "value": 4,
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#e0e0e0",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 1 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }

    // Hover Sync & Hero Box Automation
    const titleBox = document.getElementById('tool-title-box');
    if (titleBox) {
        titleBox.style.transition = 'opacity 0.15s ease, color 0.15s ease';
    }

    const toolLinks = document.querySelectorAll('a[onclick^="updateTool"]');
    const navbar = document.querySelector('.navbar');

    toolLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (!titleBox) return;
            const match = link.getAttribute('onclick')?.match(/updateTool\('([^']+)'\)/);
            if (match && match[1]) {
                const newName = match[1].toUpperCase();
                if (titleBox.innerText !== newName) {
                    titleBox.style.opacity = '0';
                    setTimeout(() => {
                        titleBox.innerText = newName;
                        titleBox.style.color = '#e5322d';
                        titleBox.style.opacity = '1';
                        
                        // Sync Documentation on Hover
                        const infoArea = document.getElementById('tool-info-area');
                        if (infoArea && toolDocs[match[1]]) {
                            infoArea.style.display = 'block';
                            animateText('info-what', toolDocs[match[1]].what);
                            animateText('info-how', toolDocs[match[1]].how);
                        }
                    }, 50); // Fast low latency
                }
            }
        });
    });

    if (navbar && titleBox) {
        navbar.addEventListener('mouseleave', () => {
            const revertName = window.currentActiveTool || 'SELECT PDF FILES';
            if (titleBox.innerText !== revertName) {
                titleBox.style.opacity = '0';
                setTimeout(() => {
                    titleBox.innerText = revertName;
                    titleBox.style.color = '#e5322d';
                    titleBox.style.opacity = '1';
                    
                    // Revert Documentation
                    const infoArea = document.getElementById('tool-info-area');
                    if (infoArea) {
                        const originalToolMatch = Object.keys(toolDocs).find(k => k.toUpperCase() === revertName);
                        if (originalToolMatch && toolDocs[originalToolMatch]) {
                            infoArea.style.display = 'block';
                            animateText('info-what', toolDocs[originalToolMatch].what);
                            animateText('info-how', toolDocs[originalToolMatch].how);
                        } else {
                            document.getElementById('info-what').innerHTML = "";
                            document.getElementById('info-how').innerHTML = "";
                            infoArea.style.display = 'none';
                        }
                    }
                }, 50);
            }
        });
    }

});
