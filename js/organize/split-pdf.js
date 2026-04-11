/**
 * KELLYNE PDF - Split Engine
 * Logic: Sequential Downloads for <= 10 pages | ZIP for > 10 pages
 */

window.runSplit = async function(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const btn = document.getElementById('action-button');
    const titleBox = document.getElementById('tool-title-box');
    const statusLabel = document.getElementById('status-label');
    const defaultIcon = document.getElementById('default-upload-icon');

    if (defaultIcon) defaultIcon.style.display = 'none';

    try {
        if (!window.PDFLib) throw new Error("PDFLib not loaded");
        const fileArrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
        const pageCount = sourcePdf.getPageCount();
        
        // --- UI LOADING STATE ---
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = `<span style="color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">KELLYNE SPLITTING...</span>
            <style>@keyframes kellyne-spin { 100% { transform: rotate(360deg); } }</style>
            <svg viewBox="0 0 50 50" style="width:20px;height:20px;animation:kellyne-spin 0.8s linear infinite;vertical-align:middle;margin-left:10px;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
            </svg>`;

        if (statusLabel) {
            statusLabel.innerText = `Processing ${pageCount} pages...`;
            statusLabel.style.color = '#e5322d';
            statusLabel.style.fontWeight = 'bold';
        }

        const generatedPdfs = [];
        for (let i = 1; i <= pageCount; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, [i - 1]);
            newPdf.addPage(copiedPages[0]);
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            generatedPdfs.push({ name: `KELLYNEPDF_SPLIT_${i}.pdf`, blob: blob });
            if (statusLabel) statusLabel.innerText = `Extracting page ${i} of ${pageCount}...`;
        }

        // --- DOWNLOAD LOGIC: <= 10 vs > 10 ---
        if (pageCount <= 10) {
            // SEQUENTIAL DOWNLOADS
            for (const pdfObj of generatedPdfs) {
                const url = URL.createObjectURL(pdfObj.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = pdfObj.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                await new Promise(r => setTimeout(r, 300)); // Brief delay for browser triggers
            }
        } else {
            // ZIP DOWNLOAD
            if (typeof JSZip === 'undefined') throw new Error("JSZip not loaded");
            const zip = new JSZip();
            generatedPdfs.forEach(pdfObj => zip.file(pdfObj.name, pdfObj.blob));
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `KELLYNEPDF_SPLIT.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(zipUrl);
        }

        // --- SUCCESS UI ---
        if (titleBox) {
            titleBox.innerText = 'SPLIT SUCCESSFULLY COMPLETED';
            titleBox.style.color = '#008000';
            titleBox.style.fontSize = '22px';
            titleBox.style.fontWeight = '900';
        }
        
        if (statusLabel) {
            statusLabel.innerHTML = `${pageCount} Pages Processed | Download Started`;
            statusLabel.style.color = '#008000';
        }

        const dropZone = document.getElementById('drop-zone');
        if (dropZone) dropZone.classList.add('success-tool-glow');

        // --- BACK TO HOME ---
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.innerHTML = `<span style="color: white; font-weight: 800; font-size: 15px;">BACK TO HOME</span>`;
        btn.style.cssText = `
            display: flex !important;
            justify-content: center;
            align-items: center;
            background-color: #111 !important;
            color: #fff !important;
            border: none;
            padding: 15px 35px;
            border-radius: 30px;
            width: auto;
            margin: 20px auto 0;
            cursor: pointer;
            opacity: 1 !important;
            visibility: visible !important;
            transition: all 0.3s ease;
            font-weight: 800;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        `;

        btn.onclick = (e2) => {
            e2.preventDefault();
            window.location.assign('index.html');
        };

    } catch (e) {
        console.error("Split Error:", e);
        window.location.assign('index.html');
    }
};
