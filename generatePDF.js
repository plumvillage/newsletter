const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require("path")
const { exec } = require('child_process')

// we want the link to remain unchanged even when new revisions are being uploaded with a timestamp
let netlifyRedirectsRule = `\n`

function padTo2Digits(num) {
    return num.toString().padStart(2, '0')
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

function downsample(pdfFile, pdfFileWithoutDate, ppi = 400, Q = "prepress", onFinished = () => {}) {

    let parsed = path.parse(pdfFile)
    let parsedWithoutDate = path.parse(pdfFileWithoutDate)
    
    let outName = (src) => `${src}_ppi${ppi}_${Q}.pdf`

    let outputFile = path.join(parsed.dir, outName(parsed.name))
    let outputFileWithoutDate = path.join(parsedWithoutDate.dir, outName(parsedWithoutDate.name))

    netlifyRedirectsRule += `[[redirects]]
  from = "${parsed.dir.replace("./docs/", "/")}/${outName(parsedWithoutDate.name)}"
  to = "${parsed.dir.replace("./docs/", "/")}/${outName(parsed.name)}"\n`

/*
READ Distiller Parameters in Ghostscript doc (page 210)
read PostScript Language Reference Manual

We can compress pdfs with Adobe Acrobat.
The settings seem to be ignored. The file is always the same size, with terrible quality. Cannot be used.

QFactor
0.01 -> 175 MiB
0.04 -> 110 MiB
0.1  ->  78 MiB
0.2  ->  56 MiB
0.8  ->  29 MiB
3.0  ->  17 MiB very poor
5.0  ->  14 MiB Too Harsh!

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
    
    -sColorConversionStrategy=CMYK \
    -dFirstPage=8 \
    -dLastPage=9 \
    // DCTEncode is default. flate is lossless compression.
    // -dColorImageFilter=/FlateEncode \
    // -dColorImageFilter=/DCTEncode \

I cannot set the QFactor anymore, because this line is ignored:
-c "<< /GrayImageDict << /Blend 1 /VSamples [ 2 1 1 1 ] /QFactor ${Q} /HSamples [ 2 1 1 1 ] >> /ColorACSImageDict << /VSamples [ 2 1 1 1 ] /HSamples [ 2 1 1 1 ] /QFactor ${Q} /Blend 1 >> /ColorConversionStrategy /LeaveColorUnchanged >> setdistillerparams" \

prepress /QFactor 0.15
printer /QFactor 0.4
screen and ebook /QFactor 0.76
default /QFactor 0.9

I now use a combination of dPDFSETTINGS to set the QFactor and a custom ppi

Adding any of these severely reduces output size (quality loss)
-dAutoFilterGrayImages=false \
-dAutoFilterColorImages=false \

// my version is 1.7
-dCompatibilityLevel=1.5
-dFirstPage=29 \
-dLastPage=29 \

// very slow ...
-sColorConversionStrategy=CMYK \
*/

let command = `gs \
-o "${outputFile}" \
-sDEVICE=pdfwrite \
-dNOPAUSE \
-dQUIET \
-q \
-dPDFSETTINGS=/${Q} \
-dFastWebView \
-dAutoRotatePages=/None \
-dDownsampleColorImages=true \
-dDownsampleGrayImages=true \
-dDownsampleMonoImages=true \
-dColorImageResolution=${ppi} \
-dGrayImageResolution=${ppi} \
-dMonoImageResolution=${ppi} \
-dColorImageDownsampleThreshold=1.0 \
-dGrayImageDownsampleThreshold=1.0 \
-dMonoImageDownsampleThreshold=1.0 \
-dColorImageDownsampleType=/Bicubic \
-dGrayImageDownsampleType=/Bicubic \
-dMonoImageDownsampleType=/Bicubic \
-f "${pdfFile}"`

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
        executablePath: "/usr/bin/google-chrome-stable"
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

    // https://pptr.dev/api/puppeteer.pdfoptions
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
    page.waitForTimeout(2000).then(async () => {
        console.log('Waited 2000!')
        if (usePDFstream) {
            const pdfStream = await page.createPDFStream(pdfOptions)
            const writeStream = fs.createWriteStream(outputFile)
            pdfStream.pipe(writeStream)
            pdfStream.on('end', async () => {
                await browser.close()
                onFinished(outputFile, outputFileWithoutDate)
            })
        } else {
            await page.pdf(pdfOptions)
        }
    })
}

let todoNext = 0
let workInProgress = 0

// https://en.wikipedia.org/wiki/Thread_pool
// all jobs are assumed to continueWork() by themselves after being finished
// we first generate all raw PDFs. onFinished() adds the downsample jobs to this queue and then proceeds execution with more threads (because the downsample is not as memory-hungry)
let workQueue = [

    // () => generatePDF("http://localhost:8080/2024/en/a4/", `./docs/2024/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2024/en/a4-bleed/", `./docs/2024/en-a4-bleed`, onFinshed),
    
    () => generatePDF("http://localhost:8080/2024/vi/a4/", `./docs/2024/vi-a4`, onFinshed),
    
    
    // () => generatePDF("http://localhost:8080/2024/en/articles-print-preview/br-duc-dinh--a-day-of-alms/", `./docs/2024/br-duc-dinh--a-day-of-alms`, onFinshed),
    // () => generatePDF("http://localhost:8080/2024/en/articles-print-preview/br-phap-huu--music-a-dharma-door/", `./docs/2024/br-phap-huu--music-a-dharma-door`, onFinshed),
    // () => generatePDF("http://localhost:8080/2024/vi/articles-print-preview/bbt--lang-mai-nam-qua-2024/", `./docs/2024/lmnq`, onFinshed),

    // () => generatePDF("http://localhost:8080/2024/en/articles-print-preview/test/", `./docs/2024/test`, onFinshed),
    // () => generatePDF("http://localhost:8080/2024/en/articles-print-preview/sr-hien-hanh--the-calling/", `./docs/2024/sr-hien-hanh--the-calling`, onFinshed),
    
    // () => generatePDF("http://localhost:8080/2024/vi/a4-bleed/", `./docs/2024/vi-a4-bleed`, onFinshed),
    
    
    // () => generatePDF("http://localhost:8080/2023/en/a4/", `./docs/2023/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2023/en/a4-bleed/", `./docs/2023/en-a4-bleed`, onFinshed),
    // US Letter: 11in x 8.5in
    // () => generatePDF("http://localhost:8080/2023/en/letter/", `./docs/2023/en-letter`, onFinshed, {format: "Letter"}),
    // US Letter +5mm bleed
    // () => generatePDF("http://localhost:8080/2023/en/letter-bleed/", `./docs/2023/en-letter-bleed`, onFinshed, {height: "225.9mm", width: "289.4mm"}),
    
    // () => generatePDF("http://localhost:8080/2023/vi/a4/", `./docs/2023/vi-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2023/vi/a4-bleed/", `./docs/2023/vi-a4-bleed`, onFinshed),
    // () => generatePDF("http://localhost:8080/2023/vi/letter/", `./docs/2023/vi-letter`, onFinshed, {format: "Letter"}),
    // US Letter +5mm bleed
    // () => generatePDF("http://localhost:8080/2023/vi/letter-bleed/", `./docs/2023/vi-letter-bleed`, onFinshed, {height: "225.9mm", width: "289.4mm"}),
    
    // () => generatePDF("http://localhost:8080/2022/en/a4/", `./docs/2022/en-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2022/en/a4-bleed/", `./docs/2022/en-a4-bleed`, onFinshed),
    // US Letter: 11in x 8.5in
    // () => generatePDF("http://localhost:8080/2022/en/letter/", `./docs/2022/en-letter`, onFinshed, {format: "Letter"}),
    // US Letter +.125in x2
    // () => generatePDF("http://localhost:8080/2022/en/letter-bleed/", `./docs/2022/en-letter-bleed`, onFinshed, {height: "11.25in", width: "8.75in"}),

    // () => generatePDF("http://localhost:8080/2022/vi/a4/", `./docs/2022/vi-a4`, onFinshed),
    // () => generatePDF("http://localhost:8080/2022/vi/a4-bleed/", `./docs/2022/vi-a4-bleed`, onFinshed),
    
    // () => onFinshed("./docs/2023/vi-a4-bleed_2023-02-14_13-42-06.pdf", "./docs/2023/vi-a4-bleed.pdf"),
    // () => onFinshed("./docs/2023/en-a4_2023-02-14_17-21-23.pdf", "./docs/en-a4.pdf"),
    // () => onFinshed("./docs/2023/en-a4-bleed_2023-02-14_13-42-06.pdf", "./docs/en-a4-bleed.pdf"),
    // () => onFinshed("./builds/marisela-gomez--arise-sangha_2023-02-14_08-51-19.pdf", "./builds/marisela-OUTPUT.pdf"),

    () => {
        console.log("begin downsampling. More hands! :)")
        Array(8).fill().forEach(startWork)
        continueWork()
    }
]

var onFinshed = function(file, fileWithoutDate) {
    let parsed = path.parse(file)
    // ln target linkname
    execCMD(`ln -sf ${parsed.base} ${fileWithoutDate}`)
    
    workQueue.push(() => downsample(file, fileWithoutDate, 200, "screen", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 250, "screen", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 300, "prepress", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 350, "screen", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 400, "screen", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 450, "screen", continueWork))
    workQueue.push(() => downsample(file, fileWithoutDate, 500, "prepress", (generatedFile) => {
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
                console.log("done!", netlifyRedirectsRule)

                try {
                    // the first occation of a rule is effective, which is why we need to prepend new rules, not append
                    
                    prependToFile("./docs/netlify.toml", netlifyRedirectsRule)

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
