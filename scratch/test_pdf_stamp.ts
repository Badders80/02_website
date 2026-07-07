import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

// Mock variables (simulating Stripe metadata + Stripe Identity response)
const mockCheckoutSession = {
  id: 'cs_test_55a123abc',
  customer_email: 'investor@example.com',
  client_ip: '203.0.113.195',
  metadata: {
    user_name: 'John Doe',
    user_id: 'firebase_uid_9988',
  }
};

const mockIdentitySession = {
  id: 'vs_test_777xyz',
  verified_name: 'Johnathan Doe', // name retrieved from verified document
  verified_at: new Date().toISOString(),
};

async function testPdfStamp() {
  const inputPdfPath = './public/documents/prudentia/pds.pdf';
  const outputDirectory = './scratch';
  const outputPdfPath = path.join(outputDirectory, 'stamped_pds_test.pdf');

  console.log('Loading input PDF:', inputPdfPath);
  const pdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  console.log(`PDF loaded. Last page size: ${width}x${height}`);

  // Create signature stamp block text
  const stampLines = [
    '============================================================',
    'ELECTRONICALLY SIGNED & AGREED',
    '============================================================',
    `Document: Product Disclosure Statement (PDS)`,
    `Signer Name: ${mockIdentitySession.verified_name} (via Firebase UID: ${mockCheckoutSession.metadata.user_id})`,
    `Signer Email: ${mockCheckoutSession.customer_email}`,
    `Signed Timestamp: ${new Date().toISOString()}`,
    `Signing IP Address: ${mockCheckoutSession.client_ip}`,
    `Stripe Verification ID: ${mockIdentitySession.id}`,
    '============================================================'
  ];

  // Draw the text lines on the bottom of the last page
  let currentY = 130; // position from the bottom
  for (const line of stampLines) {
    lastPage.drawText(line, {
      x: 50,
      y: currentY,
      size: 9,
      color: rgb(0, 0, 0),
    });
    currentY -= 12; // line spacing
  }

  console.log('Saving modified PDF to:', outputPdfPath);
  
  // Ensure directory exists
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
  console.log('🎉 Stamped PDF successfully created at:', outputPdfPath);
}

testPdfStamp().catch(err => {
  console.error('Error stamping PDF:', err);
});
