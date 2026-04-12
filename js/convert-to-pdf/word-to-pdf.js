/**
 * js/convert-to-pdf/word-to-pdf.js
 * Professional Word to PDF Engine with Sequential Bulk Support
 */

window.runWordToPdf = async function(files) {
    if (!files || files.length === 0) return;

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const waitForNextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const removeNode = node => {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    };
    const triggerBlobDownload = (blob, filename) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.rel = 'noopener';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            removeNode(link);
            URL.revokeObjectURL(blobUrl);
        }, 1000);
    };
    const getRenderedPages = container => {
        const wrapperSections = Array.from(container.querySelectorAll('.docx-wrapper > section'));
        if (wrapperSections.length) return wrapperSections;

        const docxSections = Array.from(container.querySelectorAll('section.docx'));
        if (docxSections.length) return docxSections;

        return [container];
    };
    const waitForImages = async container => {
        const images = Array.from(container.querySelectorAll('img'));

        await Promise.all(images.map(img => {
            if (img.complete) {
                return typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve();
            }

            return new Promise(resolve => {
                let settled = false;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    resolve();
                };

                img.addEventListener('load', finish, { once: true });
                img.addEventListener('error', finish, { once: true });
                setTimeout(finish, 2500);
            }).then(() => typeof img.decode === 'function' ? img.decode().catch(() => {}) : undefined);
        }));
    };
    const waitForRenderablePreview = async container => {
        await wait(2500);
        await waitForImages(container);

        if (document.fonts && document.fonts.ready) {
            try {
                await document.fonts.ready;
            } catch (error) {
                console.warn('Font readiness check failed:', error);
            }
        }

        await waitForNextPaint();
    };
    const renderNodeToCanvas = async (node, tempDivId, baseOptions) => {
        const width = Math.max(node.scrollWidth, node.offsetWidth, 800);
        const height = Math.max(node.scrollHeight, node.offsetHeight, 1122);

        return html2canvas(node, {
            ...baseOptions,
            backgroundColor: '#ffffff',
            width,
            height,
            windowWidth: width,
            windowHeight: height,
            onclone: clonedDoc => {
                const clonedTempDiv = clonedDoc.getElementById(tempDivId);

                if (clonedTempDiv) {
                    clonedTempDiv.style.position = 'absolute';
                    clonedTempDiv.style.top = '0';
                    clonedTempDiv.style.left = '0';
                    clonedTempDiv.style.width = '800px';
                    clonedTempDiv.style.minHeight = '1122px';
                    clonedTempDiv.style.background = 'white';
                    clonedTempDiv.style.color = 'black';
                    clonedTempDiv.style.zIndex = '9999';
                    clonedTempDiv.style.visibility = 'visible';
                    clonedTempDiv.style.opacity = '1';
                    clonedTempDiv.style.overflow = 'visible';
                    clonedTempDiv.style.display = 'block';
                }

                clonedDoc.body.style.margin = '0';
                clonedDoc.body.style.background = '#ffffff';
            }
        });
    };
    const buildPdfBlob = async (pages, tempDivId, margin, html2canvasOptions, pdfOptions) => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF(pdfOptions);
        const printableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const printableHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        let isFirstPdfPage = true;

        for (const pageNode of pages) {
            const canvas = await renderNodeToCanvas(pageNode, tempDivId, html2canvasOptions);
            const slicePixelHeight = Math.max(1, Math.floor((printableHeight * canvas.width) / printableWidth));

            for (let offsetY = 0; offsetY < canvas.height; offsetY += slicePixelHeight) {
                const sliceHeight = Math.min(slicePixelHeight, canvas.height - offsetY);
                const sliceCanvas = document.createElement('canvas');
                const sliceContext = sliceCanvas.getContext('2d');

                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sliceHeight;
                sliceContext.drawImage(
                    canvas,
                    0,
                    offsetY,
                    canvas.width,
                    sliceHeight,
                    0,
                    0,
                    canvas.width,
                    sliceHeight
                );

                const imageData = sliceCanvas.toDataURL('image/jpeg', 0.95);
                const renderedHeight = (sliceHeight * printableWidth) / canvas.width;

                if (!isFirstPdfPage) {
                    pdf.addPage();
                }

                pdf.addImage(imageData, 'JPEG', margin, margin, printableWidth, renderedHeight, undefined, 'FAST');
                isFirstPdfPage = false;

                sliceCanvas.width = 0;
                sliceCanvas.height = 0;
            }

            canvas.width = 0;
            canvas.height = 0;
        }

        return pdf.output('blob');
    };

    const statusLabel = document.getElementById('status-label');
    const actionBtn = document.getElementById('action-button');
    const defaultIcon = document.getElementById('default-upload-icon');
    const titleBox = document.getElementById('tool-title-box');

    const docxFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.docx'));

    if (docxFiles.length === 0) {
        statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">ERROR: PLEASE UPLOAD .DOCX FILES</span>`;
        setTimeout(window.resetUI, 3000);
        return;
    }

    if (defaultIcon) defaultIcon.style.display = 'none';
    statusLabel.innerText = docxFiles.length > 1 ? `${docxFiles.length} FILES SELECTED` : `FILE: ${docxFiles[0].name}`;

    actionBtn.style.setProperty('display', 'block', 'important');
    actionBtn.className = 'download-ready';
    actionBtn.innerHTML = `<span>CLICK TO CONVERT</span>`;
    actionBtn.style.backgroundColor = '#e5322d';
    actionBtn.style.color = '#fff';
    actionBtn.style.padding = '15px 40px';
    actionBtn.style.borderRadius = '50px';
    actionBtn.style.cursor = 'pointer';
    actionBtn.style.fontSize = '18px';
    actionBtn.style.fontWeight = '900';
    actionBtn.style.border = 'none';
    actionBtn.style.opacity = '1';
    actionBtn.style.pointerEvents = 'auto';

    const setBackToHomeState = () => {
        actionBtn.innerHTML = `<span>BACK TO HOME</span>`;
        actionBtn.style.backgroundColor = '#000';
        actionBtn.style.color = '#fff';
        actionBtn.style.opacity = '1';
        actionBtn.style.pointerEvents = 'auto';
        actionBtn.onclick = () => window.location.reload(true);
    };

    actionBtn.onclick = async () => {
        actionBtn.innerHTML = `<span>CONVERTING...</span>`;
        actionBtn.style.pointerEvents = 'none';
        actionBtn.style.opacity = '0.7';

        try {
            const isBulk = docxFiles.length > 1;
            const zip = new JSZip();

            let current = 0;
            for (const file of docxFiles) {
                current += 1;
                if (titleBox) {
                    titleBox.innerText = `CONVERTING FILE ${current} OF ${docxFiles.length}...`;
                    titleBox.style.color = '#111';
                }
                statusLabel.innerText = `CONVERTING FILE ${current} OF ${docxFiles.length}...`;

                const tempDiv = document.createElement('div');
                const styleDiv = document.createElement('div');
                const tempDivId = `word-to-pdf-render-${current}-${Date.now()}`;
                tempDiv.id = tempDivId;
                tempDiv.style.cssText = [
                    'position: fixed',
                    'top: 0',
                    'left: 200vw',
                    'width: 800px',
                    'min-height: 1122px',
                    'background: white',
                    'color: black',
                    'z-index: 9999',
                    'visibility: visible',
                    'opacity: 1',
                    'overflow: visible',
                    'display: block',
                    'box-sizing: border-box'
                ].join('; ');
                styleDiv.style.display = 'none';
                document.body.appendChild(tempDiv);
                document.body.appendChild(styleDiv);

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    await docx.renderAsync(arrayBuffer, tempDiv, styleDiv, {
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false,
                        breakPages: true,
                        useBase64URL: true
                    });

                    await waitForRenderablePreview(tempDiv);

                    const opt = {
                        margin: 10,
                        filename: file.name.replace(/\.docx$/i, '.pdf'),
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: {
                            scale: 1.5,
                            useCORS: true,
                            scrollX: 0,
                            scrollY: 0,
                            backgroundColor: '#ffffff'
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    const renderedPages = getRenderedPages(tempDiv);
                    const blob = await buildPdfBlob(
                        renderedPages,
                        tempDivId,
                        opt.margin,
                        opt.html2canvas,
                        opt.jsPDF
                    );
                    removeNode(tempDiv);
                    removeNode(styleDiv);

                    if (isBulk) {
                        zip.file(opt.filename, blob);
                    } else {
                        triggerBlobDownload(blob, opt.filename);
                    }
                } catch (fileError) {
                    removeNode(tempDiv);
                    removeNode(styleDiv);
                    throw fileError;
                }
            }

            if (isBulk) {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                const zipUrl = URL.createObjectURL(zipBlob);
                link.href = zipUrl;
                link.download = 'KELLYNEPDF_BULK_WORD.zip';
                link.rel = 'noopener';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    removeNode(link);
                    URL.revokeObjectURL(zipUrl);
                }, 1000);
            }

            if (titleBox) {
                titleBox.innerText = 'CONVERSION SUCCESSFULLY COMPLETED';
                titleBox.style.color = '#008000';
                titleBox.style.fontSize = '22px';
            }
            statusLabel.innerText = isBulk ? 'ALL FILES CONVERTED' : 'FILE CONVERTED';
            setBackToHomeState();
        } catch (error) {
            console.error('General Error:', error);
            statusLabel.innerHTML = `<span style="color: #e5322d; font-weight: 900;">FAILED. PLEASE REFRESH.</span>`;
            setBackToHomeState();
        }
    };
};
