import jsPDF from "jspdf";
import Papa from "papaparse";

export function exportAsPDF(data: any[], title: string) {
  const doc = new jsPDF();
  doc.text(title, 16, 22);
  let y = 36;
  data.forEach(item => {
    doc.text(`${item.label || item.lord || item.planet}: ${item.explanation || ''}`, 16, y);
    y += 10;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export function exportAsCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename.replace(/\s+/g, "_")}.csv`;
  a.click();
}