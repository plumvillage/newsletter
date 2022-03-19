const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require("path");
const { exec } = require('child_process');
const articleOrder = {}
articleOrder.vi = require("./src/_data/article-order-vi.js");
articleOrder.en = require("./src/_data/article-order-en.js");

let netlifyRedirects = `# for Netlify, see https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file\n`;

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
function formatDate(date) {
return (
    [date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
    ].join('-') +
    '_' +
    [padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds()),
    ].join('-')
)}

function execCMD(command, onFinshed = () => {}) {
    let child = exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(`couldn't execute: ${command}`);
            console.log(err);
            return;
        }
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });

    child.on('exit', onFinshed)
}

function downsample(pdfFile, dpi = 400, Q = 1.5, onFinished = () => {}) {

    let parsed = path.parse(pdfFile)
    let outputFile = path.join(parsed.dir, `${parsed.name}_dpi${dpi}_q${Q}.pdf`)

/*
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

    
    -sColorConversionStrategy=CMYK \
    -dFirstPage=8 \
    -dLastPage=9 \
    -dFastWebView \
    */
   let command = `gs \
   -o "${outputFile}" \
   -sDEVICE=pdfwrite \
-dNOPAUSE \
-dQUIET \
-q \
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

    execCMD(command, () => {
        onFinished(outputFile)
    })
}

async function generatePDF(url, outputFile, onFinished = () => {}) {
    let outputFileWithoutDate = `${outputFile}.pdf`;
    outputFile = `${outputFile}_${formatDate(new Date())}.pdf`;

    // regardless of which I choose, the pdf output and the in-browser pdf output are different: the font flows slightly different (e.g. kerning, justification)
    const browser = await puppeteer.launch({
        // executablePath: "/usr/bin/google-chrome-stable"
        // executablePath: "/usr/bin/chromium-browser"
    });

    const page = await browser.newPage();
    const version = await page.browser().version();
    console.log(version)
    await page.setDefaultNavigationTimeout(0);
    // "load" does not work!
    await page.goto(url, {waitUntil: 'networkidle0'});
    
    // works: [webp 3000 q50]
    // for very high quality webp [webp 4000 q50] I am getting: Protocol error (Page.printToPDF): Printing failed
    // this does not happen with jpeg. also, the output size is generally much smaller. therefore, for print, prefer jpeg!
    // 187 pages
    // [3000, q80] (media: 224 MiB)
    // [4000, q80] -> out: 202MiB
    // [4000, q95] -> out: 404MiB
    // [6000, q97] -> out: 644MiB
    // justCopy -> 738MiB

    // Viet: 226 pages
    // justCopy -> breaks! (ProtocolError)
    // [5000, q96] -> out: 769MiB

    let usePDFstream = true
    let pdfOptions = {
        // format: "A4",
        preferCSSPageSize: true,
        timeout: 0,
        displayHeaderFooter: false,
        printBackground: true,
        path: outputFile
    }
    
    // wait for PagedJS to layout page
    page.waitForTimeout(5000).then(async () => {
        console.log('Waited 5000!')
        if (usePDFstream) {
            // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagecreatepdfstreamoptions
            const pdfStream = await page.createPDFStream(pdfOptions);
            const writeStream = fs.createWriteStream(outputFile);
            pdfStream.pipe(writeStream);
            pdfStream.on('end', async () => {
                await browser.close();
                // overwrite by default (0)
                // fs.copyFileSync(outputFile, outputFileWithoutDate, 0);
                netlifyRedirects += `/${outputFileWithoutDate}   /${outputFile}\n`;

                onFinished(outputFile)
            });
        } else {
            await page.pdf(pdfOptions);
        }
    });
}

// execCMD("rm -rf ./builds/articles-print/*")

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let dir = `./builds/articles_${formatDate(new Date())}`
let i = 0;
function processArticle() {
    if (i < articleOrder.en.length) {
        let article = articleOrder.en[i++]
        let url = `http://localhost:8080/en/articles-print-preview/${article}/`
        console.log(url)
        generatePDF(url, `${dir}/${article}.pdf`,
        () => { // onFinished: continue:
            processArticle()
        })
    }
}

let generateArticles = false
if (generateArticles) {
    fs.mkdirSync(dir)
    // concurrent:
    Array(3).fill().forEach(processArticle);
}


let todoNext = 0;
let workInProgress = 0;

let todo = [
    () => generatePDF("http://localhost:8080/en/a4/", `./builds/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/en/a4-bleed/", `./builds/en-a4-bleed`, onFinshed),
    // () => generatePDF("http://localhost:8080/vi/a4/", `./builds/vi-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/vi/a4-bleed/", `./builds/vi-a4-bleed`, onFinshed),
    () => {
        console.log("raw PDFs all generated! now we downsample them. More hands! :)")
        Array(3).fill().forEach(startWork);
        continueWork()
    }
]

function startWork() {
    workInProgress++
    continueWork()
}

function continueWork() {
    if (todoNext < todo.length) {
        todo[todoNext++]()
    } else {
        workInProgress--
        if (workInProgress <= 0) {
            // last worker just went home!
            console.log("All Done!")
            console.log("done!", netlifyRedirects)
        }
    }
}

let onFinshed = function(file) {
    todo.push(() => downsample(file, 500, 0.3, continueWork))
    todo.push(() => downsample(file, 300, 0.05, continueWork))
    todo.push(() => downsample(file, 300, 0.05, continueWork))
    todo.push(() => downsample(file, 250, 1.5, (generatedFile) => {
        console.log("Finished DOWNSAMPLE of:", generatedFile)
        continueWork()
    }))
    continueWork()
}

generatePDF("http://fee:8080/vi/articles-print-preview/su-co-boi-nghiem--cam-di/", `./builds/CUSTOM`, () => {})

// Array(1).fill().forEach(startWork);

