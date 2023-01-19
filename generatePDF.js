const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require("path")
const { exec } = require('child_process')

// we want the link to remain unchanged even when new revisions are being uploaded with a timestamp
let netlifyRedirects = `\n# for Netlify, see https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file\n`

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
            console.log(`couldn't execute: ${command}`)
            console.log(err)
            return
        }
        console.log(`stdout: ${stdout}`)
        // unfortunately -dFastWebView spams stderr
        // console.log(`stderr: ${stderr}`)
    })

    child.on('exit', onFinshed)
}

function downsample(pdfFile, pdfFileWithoutDate, dpi = 400, Q = 1.5, onFinished = () => {}) {

    let parsed = path.parse(pdfFile)
    let parsedWithoutDate = path.parse(pdfFileWithoutDate)
    
    let outName = (src) => `${src}_dpi${dpi}_q${Q}.pdf`

    let outputFile = path.join(parsed.dir, outName(parsed.name))
    let outputFileWithoutDate = path.join(parsedWithoutDate.dir, outName(parsedWithoutDate.name))

    netlifyRedirects += `${parsed.dir.replace("./docs/", "/")}/${outName(parsedWithoutDate.name)}    ${parsed.dir.replace("./docs/", "/")}/${outName(parsed.name)}\n`;

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


this is how I resized the A4 cover to fit Letter:
1 inch = 72 points = 25.4mm
gs \
 -o "LTLM45-2022_cover_v2022-02-en-letter.pdf" \
 -sDEVICE=pdfwrite \
 -dDEVICEWIDTHPOINTS=1188.8 \
 -dDEVICEHEIGHTPOINTS=831.47 \
 -dAutoRotatePages=/None \
 -dFIXEDMEDIA \
 -dPDFFitPage \
 -f "LTLM45-2022_cover_v2022-02-en.pdf"

gs \
 -o "LTLM45-2022_cover_v2022-02-vi-letter.pdf" \
 -sDEVICE=pdfwrite \
 -dDEVICEWIDTHPOINTS=1194.13 \
 -dDEVICEHEIGHTPOINTS=831.47 \
 -dAutoRotatePages=/None \
 -dFIXEDMEDIA \
 -dPDFFitPage \
 -f "LTLM45-2022_cover_v2022-02-vi.pdf"

https://stackoverflow.com/questions/40849325/ghostscript-pdfwrite-specify-jpeg-quality

gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -sOutputFile=out.pdf full.pdf
    75dpi	150		300		    300, colour preserving
    /screen	/ebook	/printer	/prepress	        /default
    
    -sColorConversionStrategy=CMYK \
    -dFirstPage=8 \
    -dLastPage=9 \

    */
   let command = `gs \
   -o "${outputFile}" \
   -sDEVICE=pdfwrite \
   -dNOPAUSE \
   -dFastWebView \
-dQUIET \
-q \
-dAutoRotatePages=/None \
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
        execCMD(`ln -sf ${outName(parsed.name)} ${outputFileWithoutDate} `)
        onFinished(outputFile)
    })
}

async function generatePDF(url, outputFile, onFinished = () => {}, customPdfOptions = {}) {
    let outputFileWithoutDate = `${outputFile}.pdf`
    outputFile = `${outputFile}_${formatDate(new Date())}.pdf`

    let args = []
    // this will fix Inconsistent text rendering in headless mode
    // https://github.com/puppeteer/puppeteer/issues/2410
    // we disable it in the 2022 edition, because it was layed out/optimised without this improvement
    if (!url.includes("/2022/")) {
        args.push("--font-render-hinting=none")
    }
    
    const browser = await puppeteer.launch({
        args: args,
        // executablePath: "/usr/bin/google-chrome-stable"
        // executablePath: "/usr/bin/chromium-browser"
    })

    const page = await browser.newPage()
    const version = await page.browser().version()
    console.log(version)
    await page.setDefaultNavigationTimeout(0)
    // "load" does not work!
    await page.goto(url, {waitUntil: 'networkidle0'})
    
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

    // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagecreatepdfstreamoptions
    let usePDFstream = true
    let pdfOptions = {
        preferCSSPageSize: true,
        
        timeout: 0,
        displayHeaderFooter: false,
        printBackground: true,
        path: outputFile
    }

    for (let key in customPdfOptions)
        pdfOptions[key] = customPdfOptions[key]
    if (pdfOptions.format || pdfOptions.width || pdfOptions.height)
        pdfOptions.preferCSSPageSize = false

    // wait for PagedJS to layout page
    page.waitForTimeout(5000).then(async () => {
        console.log('Waited 5000!')
        if (usePDFstream) {
            const pdfStream = await page.createPDFStream(pdfOptions);
            const writeStream = fs.createWriteStream(outputFile);
            pdfStream.pipe(writeStream);
            pdfStream.on('end', async () => {
                await browser.close();
                onFinished(outputFile, outputFileWithoutDate)
            });
        } else {
            await page.pdf(pdfOptions);
        }
    });
}

let todoNext = 0;
let workInProgress = 0;

// https://en.wikipedia.org/wiki/Thread_pool
// all jobs are assumed to continueWork() by themselves after being finished
// we first generate all raw PDFs. onFinished() adds the downsample jobs to this queue and then proceeds execution with more threads (because the downsample is not as memory-hungry)
let workQueue = [
    () => generatePDF("http://fee:8080/2023/en/articles-print-preview/sr-linh-di--mountain-dream/", `./docs/2023/en/articles-print-preview/sr-linh-di--mountain-dream`, onFinshed),
    // () => generatePDF("http://fee:8080/2022/en/articles-print-preview/sr-thuan-khanh--at-the-foot-of-the-majestic-mountain/", `./docs/2022/en/articles-print-preview/sr-thuan-khanh--at-the-foot-of-the-majestic-mountain`, onFinshed),
    
    // () => generatePDF("http://localhost:8080/2023/en/a4/", `./docs/2023/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2023/en/a4-bleed/", `./docs/2023/en-a4-bleed`, onFinshed),
    // US Letter: 11in x 8.5in
    // () => generatePDF("http://localhost:8080/2023/en/letter/", `./docs/2023/en-letter`, onFinshed, {format: "Letter"}),
    // US Letter +5mm bleed
    // () => generatePDF("http://localhost:8080/2023/en/letter-bleed/", `./docs/2023/en-letter-bleed`, onFinshed, {height: "225.9mm", width: "289.4mm"}),
    
    // () => generatePDF("http://localhost:8080/2023/vi/a4/", `./docs/2023/vi-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2023/vi/a4-bleed/", `./docs/2023/vi-a4-bleed`, onFinshed),
    

    // () => generatePDF("http://localhost:8080/2022/en/a4/", `./docs/2022/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2022/en/a4-bleed/", `./docs/2022/en-a4-bleed`, onFinshed),
    // US Letter: 11in x 8.5in
    // () => generatePDF("http://localhost:8080/2022/en/letter/", `./docs/2022/en-letter`, onFinshed, {format: "Letter"}),
    // US Letter +.125in x2
    // () => generatePDF("http://localhost:8080/2022/en/letter-bleed/", `./docs/2022/en-letter-bleed`, onFinshed, {height: "11.25in", width: "8.75in"}),

    // () => generatePDF("http://localhost:8080/2022/vi/a4/", `./docs/2022/vi-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2022/vi/a4-bleed/", `./docs/2022/vi-a4-bleed`, onFinshed),
    
    // () => onFinshed("./docs/2022/en-a4_2022-03-19_20-28-32.pdf", "./docs/2022/en-a4.pdf"),

    () => {
        console.log("begin downsampling. More hands! :)")
        Array(6).fill().forEach(startWork);
        continueWork()
    }
]

var onFinshed = function(file, fileWithoutDate) {
    let parsed = path.parse(file)
    // ln target linkname
    execCMD(`ln -sf ${parsed.base} ${fileWithoutDate}`)
    // ;\nfirefox ${fileWithoutDate}
    
    workQueue.push(() => downsample(file, fileWithoutDate, 500, 0.3, continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 300, 0.05, continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 250, 1.5, (generatedFile) => {
        // we could to some custom task here.
        continueWork()
    }))
    continueWork()
}

function startWork() {
    workInProgress++
    continueWork()
}

function prependToFile(file, text) {
    const data = fs.readFileSync(file)
    const fd = fs.openSync(file, 'w+')
    const insert = Buffer.from(text)
    fs.writeSync(fd, insert, 0, insert.length, 0)
    fs.writeSync(fd, data, 0, data.length, insert.length)
    fs.close(fd, (err) => {
        if (err) throw err
    })
}

function continueWork() {
    if (todoNext < workQueue.length) {
        workQueue[todoNext++]()
    } else {
        workInProgress--
        if (workInProgress <= 0) {
            // last worker just went home!
            // wait a bit as a safety margin (otherwise exec gets killed while printing stdout)
            setTimeout(() => {
                console.log("All Done!")
                console.log("done!", netlifyRedirects)

                try {
                    // the first occation of a rule is effective, which is why we need to prepend new rules, not append
                    prependToFile("./docs/_redirects", netlifyRedirects)
                    // fs.appendFileSync('./docs/_redirects', netlifyRedirects)
                    //file written successfully
                } catch (err) {
                    console.error(err)
                }

            }, 2000)
        }
    }
}


// concurrent.
// for full-size pdf, 2 is very memory intense (16GB recommended)
Array(1).fill().forEach(startWork)

