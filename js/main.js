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

let hideTimeout;

function loadToolScript(name) {
    if (toolScriptsMap[name] && !loadedScripts.has(name)) {
        console.log(`Lazy loading script for ${name}: ${toolScriptsMap[name]}`);
        const script = document.createElement('script');
        script.src = toolScriptsMap[name];
        script.onerror = () => console.warn(`Could not load script ${toolScriptsMap[name]}`);
        document.body.appendChild(script);
        loadedScripts.add(name);
        
        // Bonus Tip 3: WASM Support - check for High-end tools
        if (name === "OCR PDF" || name === "Repair PDF") {
            console.log("WASM Support Enabled: Instructing WebAssembly core load for High-end PDF manipulation...");
            // Load WASM core when implemented
        }
    }
}

window.currentActiveTool = 'SELECT PDF FILES';

window.updateTool = function(name) {
    clearTimeout(hideTimeout);
    try {
        history.pushState(null, '', '/' + name.toLowerCase().replace(/ /g, '-'));
    } catch (e) {
        console.warn("history.pushState failed.");
    }

    // Set to h1 as per requirement
    const titleBox = document.getElementById('tool-title-box');
    window.currentActiveTool = name.toUpperCase();
    titleBox.innerText = window.currentActiveTool;

    const infoArea = document.getElementById('tool-info-area');
    infoArea.style.display = 'block';
    if (toolDocs[name]) {
        animateText('info-what', toolDocs[name].what);
        animateText('info-how', toolDocs[name].how);
    }

    hideTimeout = setTimeout(() => {
        document.getElementById('info-what').innerHTML = "";
        document.getElementById('info-how').innerHTML = "";
        infoArea.style.display = 'none';
    }, 10000);

    // Reset UI styling
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
    const btn = document.getElementById('action-button');
    if (btn) {
        btn.innerHTML = `
            <svg class="cloud-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 12V15M12 12L10 13.5M12 12L14 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="upload-label-text" id="status-label">Click or Drag & Drop Files to Begin</span>`;
        btn.style.backgroundColor = "transparent";
        btn.style.color = "#444";
        btn.style.borderColor = "rgba(229, 50, 45, 0.2)";
        btn.classList.remove('download-ready');
        btn.onclick = null; // Unbind potential custom listeners
    }

    const titleBox = document.getElementById('tool-title-box');
    const successWords = ['SUCCESSFUL', 'COMPLETED', 'READY'];
    const isSuccessState = titleBox && successWords.some(w => titleBox.innerText.includes(w));
    
    if (titleBox && isSuccessState) {
        titleBox.innerText = 'SELECT PDF FILES';
        window.currentActiveTool = 'SELECT PDF FILES';
        titleBox.style.fontSize = '';
        titleBox.style.color = '';
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('active-tool', 'success-tool-glow');
            // Clean up any old inline styles left around
            dropZone.style.border = '';
            dropZone.style.boxShadow = '';
        }
    }

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = "";
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
// js/main.js

// js/main.js



document.addEventListener("DOMContentLoaded", () => {
    animateText('sub-heading', "KellynePDF - All-In-One Solution");

    // JELLYFISH Physics
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); });
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
            this.isStar = Math.random() > 0.85; this.angle = Math.random() * Math.PI * 2;
            this.color = ['#1a237e', '#90caf9', '#ef9a9a', '#777'][Math.floor(Math.random() * 4)];
        }
        draw() {
            ctx.fillStyle = this.color; ctx.beginPath();
            if (this.isStar) {
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(this.x + this.size * Math.cos((18 + i * 72) * Math.PI / 180), this.y + this.size * Math.sin((18 + i * 72) * Math.PI / 180));
                    ctx.lineTo(this.x + (this.size / 2) * Math.cos((54 + i * 72) * Math.PI / 180), this.y + (this.size / 2) * Math.sin((54 + i * 72) * Math.PI / 180));
                }
            } else { ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); }
            ctx.fill();
        }
        update() {
            this.angle += 0.01;
            this.x += this.vx + Math.sin(this.angle) * 0.2;
            this.y += this.vy + Math.cos(this.angle) * 0.2;
            if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
            if (mouse.x != null) {
                let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    this.x -= dx * force * 0.05;
                    this.y -= dy * force * 0.05;
                }
            }
        }
    }
    function init() { particles = []; for (let i = 0; i < 450; i++) particles.push(new Particle()); }
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.draw(); p.update(); }); requestAnimationFrame(animate); }
    init(); animate();

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
                }, 50);
            }
        });
    }

});
