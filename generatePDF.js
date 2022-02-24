const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');

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

function downsample(pdfFile, dpi = 400, Q = 1.5) {
/*
for print:
-sColorConversionStrategy=CMYK \

for DPI 300
Q
0.01 -> 175 MiB
0.04 -> 110 MiB
0.1  ->  78 MiB
0.2  ->  56 MiB
0.8  ->  29 MiB
3.0  ->  17 MiB very poor
5.0  ->  14 MiB Too Harsh!

for DPI 400
Q
1.5  ->  26 MiB poor, but ok for web view
3.0  ->  20 MiB

https://stackoverflow.com/questions/40849325/ghostscript-pdfwrite-specify-jpeg-quality

gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -sOutputFile=out.pdf full.pdf
    75dpi	150		300		    300, colour preserving
    /screen	/ebook	/printer	/prepress	        /default
*/

    let command = `gs \
-o "${pdfFile} downsampled_dpi${dpi}_q${Q}.pdf" \
-sDEVICE=pdfwrite \
-dNOPAUSE \
-sColorConversionStrategy=CMYK \
-dDownsampleColorImages=true \
-dDownsampleGrayImages=true \
-dDownsampleMonoImages=true \
-dColorImageResolution=${dpi} \
-dGrayImageResolution=${dpi} \
-dMonoImageResolution=${dpi} \
-dColorImageDownsampleThreshold=1.0 \
-dGrayImageDownsampleThreshold=1.0 \
-dMonoImageDownsampleThreshold=1.0 \
-c "<< /GrayImageDict << /Blend 1 /VSamples [ 1 1 1 1 ] /QFactor ${Q} /HSamples [ 1 1 1 1 ] >> /ColorACSImageDict << /VSamples [ 1 1 1 1 ] /HSamples [ 1 1 1 1 ] /QFactor ${Q} /Blend 1 >> /ColorImageDownsampleType /Bicubic /ColorConversionStrategy /LeaveColorUnchanged >> setdistillerparams" \
-f "${pdfFile}"`;

    console.log("exec: ", command)

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(`couldn't execute: ${command}`);
            console.log(err);
            return;
        }
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}


(async() => {
    let outputFile = `./builds/generated ${formatDate(new Date())}.pdf`;
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('http://localhost:8080/en/preview-a4/', {waitUntil: 'networkidle2'});
    
    // works: [webp 3000 q50]
    // for very high quality webp [webp 4000 q50] I am getting: Protocol error (Page.printToPDF): Printing failed
    // this does not happen with jpeg. also, the output size is generally much smaller. therefore, for print, prefer jpeg!
    
    // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagecreatepdfstreamoptions
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
        downsample(outputFile, 400, 1.5)
    });

})();
