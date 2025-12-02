import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatDate } from './validation';

export async function generatePDF(pdfBytes, state, sedeIdx, vehicleIdx) {
  const sede = state.sedi[sedeIdx];
  const vehicle = sede.veicoli[vehicleIdx];
  const d = vehicle.data;
  const str = state.strumenti;
  const op = state.operatore;

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1];
  const color = rgb(0, 0, 0);
  const fontSize = 9;

  // Helper: ottieni coordinate del campo e poi rimuovilo
  function getFieldCoords(name) {
    try {
      const field = form.getTextField(name);
      const widgets = field.acroField.getWidgets();
      if (widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        return { x: rect.x + 2, y: rect.y + 3, width: rect.width, height: rect.height };
      }
    } catch (e) {}
    return null;
  }

  // Helper: scrivi testo e rimuovi campo form
  function writeField(name, value, page, customFontSize) {
    if (!value) {
      // Rimuovi campo anche se vuoto
      try {
        const field = form.getTextField(name);
        form.removeField(field);
      } catch (e) {}
      return;
    }
    
    const coords = getFieldCoords(name);
    if (coords) {
      page.drawText(String(value), {
        x: coords.x,
        y: coords.y,
        size: customFontSize || fontSize,
        font,
        color
      });
      
      // Rimuovi campo form
      try {
        const field = form.getTextField(name);
        form.removeField(field);
      } catch (e) {}
    }
  }

  // PAGINA 1 - Header
  writeField('Text1', sede.nome, page1);
  writeField('Text2', vehicle.numero, page1);
  writeField('Text3', vehicle.tipo === '3M' ? '3 MESI' : '6 MESI', page1);
  writeField('Text27', sede.odl, page1);

  // Multimetro
  writeField('Text4', str.multId, page1);
  writeField('Text5', formatDate(str.multScad), page1);

  // Batterie Pacco 1
  writeField('Text7', d.b1Data, page1);
  writeField('Text8', d.b1Costr, page1);
  writeField('Text9', d.b1Sn1, page1);
  writeField('Text10', d.b1Sn2, page1);

  // Batterie Pacco 2
  writeField('Text13', d.b2Data, page1);
  writeField('Text14', d.b2Costr, page1);
  writeField('Text11', d.b2Sn3, page1);
  writeField('Text12', d.b2Sn4, page1);

  // ID.2 - Carica completa
  writeField('Text15', d.id2Vm, page1);
  writeField('Text16', d.id2Vv, page1);
  writeField('Text17', d.id2Iv, page1);

  // ID.4 - Inizio scarica
  writeField('Text18', d.id4Vm, page1);
  writeField('Text19', d.id4Vv, page1);
  writeField('Text20', d.id4Iv ? `-${d.id4Iv}`.replace('--', '-') : '', page1);

  // ID.5 - Durante scarica
  writeField('Text21', d.id5Vm, page1);
  writeField('Text22', d.id5Vv, page1);
  writeField('Text23', d.id5Iv ? `-${d.id5Iv}`.replace('--', '-') : '', page1);

  // ID.6 - Fine scarica
  writeField('Text24', d.id6Vm, page1);
  writeField('Text25', d.id6Vv, page1);
  writeField('Text26', d.id6Iv ? `-${d.id6Iv}`.replace('--', '-') : '', page1);

  // PAGINA 2 - Densimetro
  writeField('Text28', str.densId, page2);
  writeField('Text29', formatDate(str.densScad), page2);

  // Densità Pacco 1
  writeField('Text30', d.p1e1, page2);
  writeField('Text31', d.p1e2, page2);
  writeField('Text32', d.p1e3, page2);
  writeField('Text33', d.p1e4, page2);
  writeField('Text34', d.p1e5, page2);
  writeField('Text35', d.p1e6, page2);
  writeField('Text36', d.p1e7, page2);
  writeField('Text37', d.p1e8, page2);
  writeField('Text38', d.p1e9, page2);
  writeField('Text39', d.p1e10, page2);
  writeField('Text40', d.p1e11, page2);
  writeField('Text41', d.p1e12, page2);

  // Densità Pacco 2
  writeField('Text42', d.p2e1, page2);
  writeField('Text43', d.p2e2, page2);
  writeField('Text44', d.p2e3, page2);
  writeField('Text45', d.p2e4, page2);
  writeField('Text46', d.p2e5, page2);
  writeField('Text47', d.p2e6, page2);
  writeField('Text48', d.p2e7, page2);
  writeField('Text49', d.p2e8, page2);
  writeField('Text50', d.p2e9, page2);
  writeField('Text51', d.p2e10, page2);
  writeField('Text52', d.p2e11, page2);
  writeField('Text53', d.p2e12, page2);

  // Operatore
  writeField('Text56', op.nome, page2);
  writeField('Text57', op.cid, page2);
  writeField('Text58', formatDate(op.data), page2);

  // Note - con word wrap
  if (d.note) {
    const noteCoords = getFieldCoords('Text59');
    if (noteCoords) {
      const maxWidth = noteCoords.width - 4;
      const lineHeight = 11;
      const maxLines = 4;

      const lines = wrapText(d.note, font, fontSize, maxWidth);
      
      lines.slice(0, maxLines).forEach((line, i) => {
        page2.drawText(line, {
          x: noteCoords.x,
          y: noteCoords.y + noteCoords.height - 12 - (i * lineHeight),
          size: fontSize,
          font,
          color
        });
      });
    }
  }
  
  // Rimuovi campo note
  try {
    const noteField = form.getTextField('Text59');
    form.removeField(noteField);
  } catch (e) {}

  // Esito - overlay X sulla checkbox
  if (d.esito === 'POSITIVO') {
    page2.drawText('X', { x: 108, y: 128, size: 14, font, color });
  } else if (d.esito === 'NEGATIVO') {
    page2.drawText('X', { x: 251, y: 128, size: 14, font, color });
  }

  // Non flatten - abbiamo già rimosso i campi
  return await pdfDoc.save();
}

// Funzione per word wrap del testo
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function getFilename(vehicle, operatore) {
  const tipoMesi = vehicle.tipo === '3M' ? '3Mesi' : '6Mesi';
  const dataIta = formatDate(operatore.data).replace(/\//g, '-');
  return `${vehicle.numero} ${tipoMesi} ${dataIta}.pdf`;
}

export function getReportId(vehicle, operatore) {
  return `${vehicle.numero}_${vehicle.tipo}_${operatore.data}`;
}

export async function sharePDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Report EFF BATT',
        text: `Report verifica batterie: ${filename}`
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Errore condivisione:', e);
      }
      return false;
    }
  } else {
    // Fallback: download
    downloadPDF(pdfBytes, filename);
    return true;
  }
}

export async function shareMultiplePDFs(reports) {
  const files = reports.map(r => 
    new File([r.pdfBlob], r.filename, { type: 'application/pdf' })
  );

  if (navigator.share && navigator.canShare({ files })) {
    try {
      await navigator.share({
        files,
        title: 'Report EFF BATT',
        text: `${files.length} report verifica batterie`
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Errore condivisione multipla:', e);
      }
      return false;
    }
  } else {
    // Fallback: download singoli
    for (const report of reports) {
      downloadPDF(report.pdfBlob, report.filename);
    }
    return true;
  }
}

export function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
