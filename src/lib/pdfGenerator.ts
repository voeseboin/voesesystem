import jsPDF from 'jspdf';
import type { Producto, Venta, Gasto, Produccion } from '@/types';
import { formatMoney } from './utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PDFData {
  mes: string;
  productos: Producto[];
  ventas: Venta[];
  gastos: Gasto[];
  producciones: Produccion[];
  datosMes: {
    unidades: number;
    materiales: number;
    gastosFab: number;
    costoUnitario: number;
  };
  totalVentas: number;
  totalGastosPersonales: number;
  efectivo: number;
}

export function generatePDF(data: PDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Colors
  const primaryColor = '#1e40af';
  const secondaryColor = '#059669';
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';

  let yPos = 20;

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VoeseSystem', margin, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const nombreMes = format(parseISO(`${data.mes}-01`), 'MMMM yyyy', { locale: es });
  doc.text(`Extracto Mensual - ${nombreMes.toUpperCase()}`, margin, 28);

  yPos = 45;

  // Summary Cards
  doc.setFillColor(lightGray);
  doc.roundedRect(margin, yPos, 85, 35, 3, 3, 'F');
  doc.setTextColor(secondaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EFECTIVO DISPONIBLE', margin + 5, yPos + 10);
  doc.setTextColor(textColor);
  doc.setFontSize(16);
  doc.text(`₲ ${formatMoney(data.efectivo)}`, margin + 5, yPos + 25);

  doc.setFillColor(lightGray);
  doc.roundedRect(margin + 90, yPos, 85, 35, 3, 3, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(10);
  doc.text('TOTAL VENTAS', margin + 95, yPos + 10);
  doc.setTextColor(textColor);
  doc.setFontSize(16);
  doc.text(`₲ ${formatMoney(data.totalVentas)}`, margin + 95, yPos + 25);

  yPos += 45;

  // Production Stats
  doc.setFillColor(lightGray);
  doc.roundedRect(margin, yPos, 55, 30, 3, 3, 'F');
  doc.setTextColor(textColor);
  doc.setFontSize(9);
  doc.text('UNIDADES', margin + 5, yPos + 8);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.datosMes.unidades}`, margin + 5, yPos + 22);

  doc.setFillColor(lightGray);
  doc.roundedRect(margin + 60, yPos, 55, 30, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('COSTO UNITARIO', margin + 65, yPos + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`₲ ${formatMoney(data.datosMes.costoUnitario)}`, margin + 65, yPos + 22);

  doc.setFillColor(lightGray);
  doc.roundedRect(margin + 120, yPos, 55, 30, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('MATERIALES', margin + 125, yPos + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`₲ ${formatMoney(data.datosMes.materiales)}`, margin + 125, yPos + 22);

  yPos += 40;

  // Expenses Section
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GASTOS DEL MES', margin, yPos);
  
  yPos += 8;
  
  // Factory expenses
  doc.setFillColor('#dbeafe');
  doc.roundedRect(margin, yPos, pageWidth - 30, 12, 2, 2, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(10);
  doc.text('🏭 FABRICACIÓN', margin + 5, yPos + 8);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`₲ ${formatMoney(data.datosMes.gastosFab)}`, pageWidth - margin - 40, yPos + 8);

  yPos += 16;

  // Personal expenses
  doc.setFillColor('#f3e8ff');
  doc.roundedRect(margin, yPos, pageWidth - 30, 12, 2, 2, 'F');
  doc.setTextColor('#7c3aed');
  doc.setFont('helvetica', 'normal');
  doc.text('👤 PERSONALES', margin + 5, yPos + 8);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`₲ ${formatMoney(data.totalGastosPersonales)}`, pageWidth - margin - 40, yPos + 8);

  yPos += 25;

  // Sales Detail
  if (data.ventas.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE VENTAS', margin, yPos);
    yPos += 10;

    // Table header
    doc.setFillColor(primaryColor);
    doc.rect(margin, yPos - 5, pageWidth - 30, 10, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(9);
    doc.text('Producto', margin + 5, yPos);
    doc.text('Tipo', margin + 60, yPos);
    doc.text('Cant.', margin + 90, yPos);
    doc.text('Precio', margin + 110, yPos);
    doc.text('Total', pageWidth - margin - 25, yPos);

    yPos += 8;

    data.ventas.slice(0, 15).forEach((venta, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(lightGray);
        doc.rect(margin, yPos - 5, pageWidth - 30, 8, 'F');
      }

      doc.setTextColor(textColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(venta.productoNombre.substring(0, 20), margin + 5, yPos);
      doc.text(venta.tipo === 'mayorista' ? 'May' : 'Min', margin + 60, yPos);
      doc.text(`${venta.cantidad}`, margin + 90, yPos);
      doc.text(formatMoney(venta.precioUnitario), margin + 110, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatMoney(venta.total), pageWidth - margin - 25, yPos);
      
      yPos += 8;
    });

    if (data.ventas.length > 15) {
      doc.setTextColor('#6b7280');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`... y ${data.ventas.length - 15} ventas más`, margin, yPos);
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor('#9ca3af');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })} - Página ${i} de ${totalPages}`, margin, 285);
    doc.text('VoeseSystem - Gestión de Negocio', pageWidth - margin - 60, 285);
  }

  // Save
  const fileName = `VoeseSystem_${data.mes}.pdf`;
  doc.save(fileName);
}

export function generateYearlyPDF(
  year: string, 
  allData: { mes: string; ventas: number; gastosFab: number; gastosPers: number; unidades: number }[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  const primaryColor = '#1e40af';
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';

  let yPos = 20;

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VoeseSystem', margin, 18);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Resumen Anual - ${year}`, margin, 30);

  yPos = 45;

  // Calculate totals
  const totalVentas = allData.reduce((sum, d) => sum + d.ventas, 0);
  const totalGastosFab = allData.reduce((sum, d) => sum + d.gastosFab, 0);
  const totalGastosPers = allData.reduce((sum, d) => sum + d.gastosPers, 0);
  const efectivo = totalVentas - totalGastosFab - totalGastosPers;

  // Summary
  doc.setFillColor(lightGray);
  doc.roundedRect(margin, yPos, 85, 30, 3, 3, 'F');
  doc.setTextColor('#059669');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VENTAS TOTALES', margin + 5, yPos + 8);
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.text(`₲ ${formatMoney(totalVentas)}`, margin + 5, yPos + 22);

  doc.setFillColor(lightGray);
  doc.roundedRect(margin + 90, yPos, 85, 30, 3, 3, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(10);
  doc.text('EFECTIVO NETO', margin + 95, yPos + 8);
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.text(`₲ ${formatMoney(efectivo)}`, margin + 95, yPos + 22);

  yPos += 40;

  // Monthly table
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen por Mes', margin, yPos);
  yPos += 8;

  // Table header
  doc.setFillColor(primaryColor);
  doc.rect(margin, yPos - 5, pageWidth - 30, 10, 'F');
  doc.setTextColor('#ffffff');
  doc.setFontSize(9);
  doc.text('Mes', margin + 5, yPos);
  doc.text('Unid.', margin + 50, yPos);
  doc.text('Ventas', margin + 75, yPos);
  doc.text('G. Fábrica', margin + 105, yPos);
  doc.text('G. Pers.', margin + 140, yPos);
  doc.text('Balance', pageWidth - margin - 25, yPos);

  yPos += 8;

  allData.forEach((data, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(lightGray);
      doc.rect(margin, yPos - 5, pageWidth - 30, 8, 'F');
    }

    const balance = data.ventas - data.gastosFab - data.gastosPers;

    doc.setTextColor(textColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(data.mes, margin + 5, yPos);
    doc.text(`${data.unidades}`, margin + 50, yPos);
    doc.text(formatMoney(data.ventas), margin + 75, yPos);
    doc.text(formatMoney(data.gastosFab), margin + 105, yPos);
    doc.text(formatMoney(data.gastosPers), margin + 140, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(balance), pageWidth - margin - 25, yPos);
    
    yPos += 8;
  });

  // Footer
  doc.setTextColor('#9ca3af');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, 285);
  doc.text('VoeseSystem - Gestión de Negocio', pageWidth - margin - 60, 285);

  doc.save(`VoeseSystem_${year}_Anual.pdf`);
}
