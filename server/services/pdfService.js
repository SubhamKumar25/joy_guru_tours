const PDFDocument = require('pdfkit');

const generateInvoicePDF = (booking, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // Corporate Header
  doc
    .fillColor('#0f172a') // Slate 900
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('JOY GURU TOURS & TRAVELS', 50, 50);

  doc
    .fillColor('#64748b') // Slate 500
    .font('Helvetica')
    .fontSize(9)
    .text('Club Road, Silchar, Assam - 788001', 50, 75)
    .text('Support: +91 94350 12345 | billing@joygurutravels.com', 50, 90);

  // Invoice Title
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('TRAVEL INVOICE / RECEIPT', 350, 50, { align: 'right' });

  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(9)
    .text(`Invoice ID: INV-2026-${booking.id.split('-')[1]}`, 350, 70, { align: 'right' })
    .text(`Date: ${new Date().toISOString().split('T')[0]}`, 350, 85, { align: 'right' })
    .text(`Booking Ref: ${booking.id}`, 350, 100, { align: 'right' });

  // Divider Line
  doc
    .strokeColor('#cbd5e1') // Slate 300
    .lineWidth(1)
    .moveTo(50, 120)
    .lineTo(550, 120)
    .stroke();

  // Billed To & Journey Details
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('CUSTOMER / BILLED TO:', 50, 140)
    .font('Helvetica')
    .text(`Name: ${booking.customerName}`, 50, 155)
    .text(`Phone: ${booking.customerPhone || 'N/A'}`, 50, 170)
    .text(`Email: ${booking.customerEmail || 'N/A'}`, 50, 185);

  doc
    .font('Helvetica-Bold')
    .text('JOURNEY & VEHICLE SPECIFICATIONS:', 300, 140)
    .font('Helvetica')
    .text(`Vehicle: ${booking.vehicleName} (${booking.vehicleType.toUpperCase()})`, 300, 155)
    .text(`Route: ${booking.pickup.split(',')[0]} to ${booking.destination.split(',')[0]}`, 300, 170)
    .text(`Date & Time: ${booking.travelDate} @ ${booking.travelTime}`, 300, 185);

  // Billing Table Header
  doc
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .moveTo(50, 210)
    .lineTo(550, 210)
    .stroke();

  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text('DESCRIPTION', 60, 220)
    .text('AMOUNT', 480, 220, { align: 'right' });

  doc
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .moveTo(50, 235)
    .lineTo(550, 235)
    .stroke();

  // Table Content Rows
  const total = booking.finalFare || booking.payableAmount || 0;
  
  doc
    .font('Helvetica')
    .text(`Vehicle Hire Fare charges - ${booking.vehicleName}`, 60, 250)
    .text(`INR ${total.toLocaleString()}.00`, 480, 250, { align: 'right' });

  doc
    .fillColor('#047857') // Emerald 700
    .text(`Advance deposit paid (Receipt #1)`, 60, 275)
    .text(`- INR ${booking.advancePaid.toLocaleString()}.00`, 480, 275, { align: 'right' });

  doc
    .fillColor('#0f172a')
    .text(`Remaining outstanding balance due`, 60, 300)
    .text(`INR ${booking.balanceDue.toLocaleString()}.00`, 480, 300, { align: 'right' });

  // Totals Divider
  doc
    .strokeColor('#0f172a')
    .lineWidth(1.5)
    .moveTo(50, 325)
    .lineTo(550, 325)
    .stroke();

  // Total Settled Amount
  const settled = total - booking.balanceDue;
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('TOTAL SETTLED AMOUNT', 60, 340)
    .text(`INR ${settled.toLocaleString()}.00`, 480, 340, { align: 'right' });

  // Status Stamp Box
  const statusX = 50;
  const statusY = 380;
  const isPaid = booking.status === 'Completed' || booking.status === 'Fully Paid' || booking.status === 'Payment Completed';

  doc
    .rect(statusX, statusY, 500, 45)
    .fillColor('#f8fafc') // Slate 50
    .fill()
    .strokeColor('#e2e8f0') // Slate 200
    .stroke();

  doc
    .fillColor(isPaid ? '#047857' : '#b45309') // Emerald 700 / Amber 700
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(`PAYMENT STATUS: ${isPaid ? 'PAID & SETTLED' : 'PARTIALLY PAID / OUTSTANDING BALANCE'}`, statusX + 15, statusY + 16);

  // Footer Disclaimer
  doc
    .fillColor('#64748b')
    .font('Helvetica-Oblique')
    .fontSize(8)
    .text('This is a computer-generated travel document and does not require a physical signature.', 50, 450, { align: 'center' })
    .text('Thank you for choosing Joy Guru Tours & Travels! Have a safe and happy journey.', 50, 465, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
