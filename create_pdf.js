const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function create() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 500]);
  page.drawText('KellynePDF Test File');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
}
create();
