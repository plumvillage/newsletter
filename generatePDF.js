const puppeteer = require('puppeteer');
const fs = require('fs');

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
function formatDate(date) {
return (
    [date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds()),
    ].join('-')
)}


(async() => {
let outputFile = `./builds/generated ${formatDate(new Date())}.pdf`;
// https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions
const browser = await puppeteer.launch({});

const page = await browser.newPage();
await page.setDefaultNavigationTimeout(0);
await page.goto('http://localhost:8080/en/preview-a4/', {waitUntil: 'networkidle2'});
// https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagecreatepdfstreamoptions

// TODO for very high quality  I am getting: Protocol error (Page.printToPDF): Printing failed
// breaks: [webp 4000px q95], [webp 4000 q50] 
// try: 
// works: [webp 3000 q50], [jpeg 4000 q95], [jpeg 5000 q98 -> 400MiB]

// Stream a PDF into a file
const pdfStream = await page.createPDFStream({
    timeout: 0,
    displayHeaderFooter: false,
    printBackground: true,
    preferCSSPageSize: true
});
const writeStream = fs.createWriteStream(outputFile);
pdfStream.pipe(writeStream);
pdfStream.on('end', async () => {
    await browser.close();
});

})();
