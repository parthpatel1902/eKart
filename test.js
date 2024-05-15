const puppeteer = require('puppeteer');

async function convertReceiptToPDF(receiptUrl, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(receiptUrl, {
    waitUntil: 'networkidle2',
  });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
}

const receiptUrl = 'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xUDN6ejFHbVowVGFUU3Z1KIaQkbIGMgZBw9ACc0M6LBYvqllV6YyburmcGmSyWExuWi2HsEaulAHWgsdZAaZWlqC_JI0BLyEO34gR';
const outputPath = 'receipt.pdf';

convertReceiptToPDF(receiptUrl, outputPath)
  .then(() => {
    console.log('Receipt converted to PDF successfully!');
  })
  .catch((error) => {
    console.error('Error converting receipt to PDF:', error);
  });
