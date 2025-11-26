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

  // Helper function to set text field
  function setField(name, value) {
    if (!value) return;
    try {
      const field = form.getTextField(name);
      field.setText(String(value));
    } catch (e) {
      console.log('Field not found:', name);
    }
  }

  // PAGINA 1 - Header
  setField('Text1', sede.nome);
  setField('Text2', vehicle.numero);
  setField('Text3', vehicle.tipo === '3M' ? '3 MESI' : '6 MESI');
  setField('Text27', sede.odl);

  // Multimetro
  setField('Text4', str.multId);
  setField('Text5', formatDate(str.multScad));

  // Batterie Pacco 1
  setField('Text7', d.b1Data);
  setField('Text8', d.b1Costr);
  setField('Text9', d.b1Sn1);
  setField('Text10', d.b1Sn2);

  // Batterie Pacco 2
  setField('Text13', d.b2Data);
  setField('Text14', d.b2Costr);
  setField('Text11', d.b2Sn3);
  setField('Text12', d.b2Sn4);

  // ID.2 - Carica completa
  setField('Text15', d.id2Vm);
  setField('Text16', d.id2Vv);
  setField('Text17', d.id2Iv);

  // ID.4 - Inizio scarica
  setField('Text18', d.id4Vm);
  setField('Text19', d.id4Vv);
  setField('Text20', d.id4Iv);

  // ID.5 - Durante scarica
  setField('Text21', d.id5Vm);
  setField('Text22', d.id5Vv);
  setField('Text23', d.id5Iv);

  // ID.6 - Fine scarica
  setField('Text24', d.id6Vm);
  setField('Text25', d.id6Vv);
  setField('Text26', d.id6Iv);

  // PAGINA 2 - Densimetro
  setField('Text28', str.densId);
  setField('Text29', formatDate(str.densScad));

  // Densità Pacco 1
  setField('Text30', d.p1e1);
  setField('Text31', d.p1e2);
  setField('Text32', d.p1e3);
  setField('Text33', d.p1e4);
  setField('Text34', d.p1e5);
  setField('Text35', d.p1e6);
  setField('Text36', d.p1e7);
  setField('Text37', d.p1e8);
  setField('Text38', d.p1e9);
  setField('Text39', d.p1e10);
  setField('Text40', d.p1e11);
  setField('Text41', d.p1e12);

  // Densità Pacco 2
  setField('Text42', d.p2e1);
  setField('Text43', d.p2e2);
  setField('Text44', d.p2e3);
  setField('Text45', d.p2e4);
  setField('Text46', d.p2e5);
  setField('Text47', d.p2e6);
  setField('Text48', d.p2e7);
  setField('Text49', d.p2e8);
  setField('Text50', d.p2e9);
  setField('Text51', d.p2e10);
  setField('Text52', d.p2e11);
  setField('Text53', d.p2e12);

  // Operatore
  setField('Text56', op.nome);
  setField('Text57', op.cid);
  setField('Text58', formatDate(op.data));

  // Note
  setField('Text59', d.note);

  // Esito - overlay X sulla checkbox
  const pages = pdfDoc.getPages();
  const page2 = pages[1];
  const color = rgb(0, 0, 0);

  if (d.esito === 'POSITIVO') {
    page2.drawText('X', { x: 108, y: 128, size: 14, font, color });
  } else if (d.esito === 'NEGATIVO') {
    page2.drawText('X', { x: 251, y: 128, size: 14, font, color });
  }

  form.flatten();
  return await pdfDoc.save();
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
