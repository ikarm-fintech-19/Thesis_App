import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './decimal-utils';

// Extending jsPDF with autoTable for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFDeclarationData {
  period: string;
  year: number;
  userName: string;
  companyName: string;
  nif?: string;
  collectee: string;
  deductible: string;
  previous_credit: string;
  tls_amount: string;
  net: string;
  total_to_pay: string;
  position: string;
  transactions: any[];
}

/**
 * Generates a professional G50 PDF report for the declaration
 */
export function generateG50PDF(data: PDFDeclarationData, locale: string = 'fr') {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(2, 132, 199); // Matax Blue
  doc.text('Matax Compliance', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Plateforme de conformité fiscale algérienne - Loi de Finances 2026', 105, 27, { align: 'center' });
  
  doc.setDrawColor(200);
  doc.line(20, 35, 190, 35);
  
  // User Info
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du Contribuable:', 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.userName || 'Utilisateur Matax'}`, 20, 52);
  doc.text(`Entreprise: ${data.companyName || 'Non spécifié'}`, 20, 59);
  if (data.nif) doc.text(`NIF: ${data.nif}`, 20, 66);
  
  // Period & Date
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du Document:', 190, 45, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Période: ${data.period} ${data.year}`, 190, 52, { align: 'right' });
  doc.text(`Généré le: ${new Date().toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR')}`, 190, 59, { align: 'right' });
  doc.text(`Référence: G50-${data.year}-${Date.now().toString().slice(-6)}`, 190, 66, { align: 'right' });
  
  // Summary Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé de la Déclaration G50', 20, 80);
  
  const summaryData = [
    ['TVA Collectée (Ventes)', `${formatCurrency(data.collectee, locale)} DZD`],
    ['TVA Déductible (Achats)', `${formatCurrency(data.deductible, locale)} DZD`],
    ['Crédit Période Précédente', `${formatCurrency(data.previous_credit, locale)} DZD`],
    ['Taxe Locale de Solidarité (TLS)', `${formatCurrency(data.tls_amount, locale)} DZD`],
    ['Position Nette', `${data.position}: ${formatCurrency(data.net, locale)} DZD`],
  ];
  
  doc.autoTable({
    startY: 85,
    head: [['Désignation', 'Valeur']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold', textColor: [2, 132, 199] }
    },
    styles: { fontSize: 10 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  
  // Big Total Box
  doc.setFillColor(248, 250, 252);
  doc.rect(120, finalY + 10, 70, 20, 'F');
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('NET À PAYER TOTAL:', 125, finalY + 23);
  doc.setFontSize(14);
  doc.setTextColor(2, 132, 199);
  doc.text(`${formatCurrency(data.total_to_pay, locale)} DZD`, 185, finalY + 23, { align: 'right' });
  
  // Certification text
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'italic');
  doc.text('Certifié conforme aux règles de la Loi de Finances 2026.', 20, finalY + 45);
  doc.text('Ce document est une simulation générée par Matax pour aide à la déclaration.', 20, finalY + 50);

  // Detailed Transactions Page
  if (data.transactions && data.transactions.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Détail des Opérations', 20, 20);
    
    const tableRows = data.transactions.map((tx, idx) => [
      idx + 1,
      tx.type === 'SALE' ? 'Vente' : 'Achat',
      tx.date,
      tx.description || 'N/A',
      `${formatCurrency(tx.ht_amount, locale)}`,
      `${(parseFloat(tx.tva_rate) * 100).toFixed(0)}%`,
      `${formatCurrency(tx.deductible_tva || tx.gross_tva || 0, locale)}`
    ]);
    
    doc.autoTable({
      startY: 25,
      head: [['#', 'Type', 'Date', 'Description', 'HT (DZD)', 'Taux', 'TVA (DZD)']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 9 }
    });
  }
  
  // Final Footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Matax Compliance — Document ID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 105, 285, { align: 'center' });
    doc.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
}
