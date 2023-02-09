const articleOrder = {}
articleOrder.vi2022 = require("./src/_data/article-order-vi-2022.js")
articleOrder.en2022 = require("./src/_data/article-order-en-2022.js")
articleOrder.en2023 = require("./src/_data/article-order-en-2023.js")
articleOrder.vi2023 = require("./src/_data/article-order-vi-2023.js")

const { EleventyRenderPlugin } = require("@11ty/eleventy")
const fs = require('fs')
const path = require("path")
const slugify = require('slugify')
// const sharp = require("sharp")
const Image = require("@11ty/eleventy-img")

const srcPath = "src/media/originals"
const calligraphyPath = "calligraphy/article-titles/"
const calligraphyPath2023 = "calligraphy2023/article-titles/"
const parallelVerses2023path = "media/originals/passthroughCopies/ParallelVerses2023/"

var articleTitleCalligraphies = fs.readdirSync(`src/media/originals/${calligraphyPath}`)
var articleTitleCalligraphies2023 = fs.readdirSync(`src/media/originals/${calligraphyPath2023}`)
var parallelVerses2023 = {
    dir: parallelVerses2023path,
    list: fs.readdirSync(`src/${parallelVerses2023path}`)
}
let firstRun = true


async function imageShortcode(src, optClasses = "", imgLabel = "") {
    let result = await imageData(src)
    
    let html = `<figure id="${result.autoId}" class="${optClasses}"><img src="${result.srcAttribute}" decoding="async">${imgLabel != "" ? `<figcaption>${imgLabel}</figcaption>` : ""}</figure>`
    
    // img loading="lazy" is buggy! stops chrome from running pagedjs
    return html
}

async function imageSrcShortcode(src) {
    let result = await imageData(src)
    return result.srcAttribute
}

async function imageData(src) {
    // use images that are already build without going through the slow Image()
    let fastProcess = true
    let justCopy = false
    
    // let maxWidth = 700
    // let quality = 80
    let maxWidth = 1500
    let quality = 60
    // let maxWidth = 5000
    // let quality = 96
    
    let imgFormat = "jpeg"
    // when the input image is a webp, the output image should also be webp, because jpeg does not support transparency
    if (src.match(/\.webp$/g)) {
        imgFormat = "webp"
    }
    
    let dryRun = false
    let srcFull = path.join(srcPath, src)
    
    let destPath = justCopy ? "/media_copy/" : `/media_${maxWidth}_q${quality}/`
    
    let parsed = path.parse(src)
    
    let outputDir = parsed.dir ? path.join(`docs/${destPath}`, parsed.dir) : `docs/${destPath}`
    // the processed output image names by eleventy-img are randomised. when we want to speed up processing, we need to keep the original name
    let destFileSameName = path.join(outputDir, parsed.base)
    let data = { filename: parsed.base }
    
    let options = {
        formats: [imgFormat, "svg"], /* jpeg, png, webp, gif, tiff, avif */
        outputDir: outputDir,
        // this could be multiple sizes
        widths: [maxWidth],
        dryRun: dryRun,
        sharpOptions: {},
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: { quality: quality, },
        sharpJpegOptions: { quality: quality, },
        svgShortCircuit: true
    }
    
    try {
        // Image.statsSync doesn’t generate any files, but will tell you where the asynchronously generated files will end up!
        // let metadata = await Image(srcFull, options)
        // Image.statsSync(srcFull, options)
        
        // console.log("processing:", src)

        if (!fastProcess || !fs.existsSync(destFileSameName)) {
            
            if (justCopy) {
                fs.mkdirSync(outputDir, { recursive: true }, (err) => {
                    if (err) throw err
                })
                console.log("COPYING: ", srcFull, " -> ", destFileSameName)
                fs.copyFileSync(srcFull, destFileSameName, fs.constants.COPYFILE_EXCL)
            } else {
                /* metadata:
                {
                svg: [],
                jpeg: [
                    {
                    format: 'jpeg',
                    width: 400,
                    height: 400,
                    url: '/img/oUr82sN_M--400.jpeg',
                    sourceType: 'image/jpeg',
                    srcset: '/img/oUr82sN_M--400.jpeg 400w',
                    filename: 'oUr82sN_M--400.jpeg',
                    outputPath: 'docs/media_5000_q96/build/article/br-minh-hy/oUr82sN_M--400.jpeg',
                    size: 137473
                    },
                    {
                        ...
                    }
                ]
                } */
                let metadata = await Image(srcFull, options)
                // console.log(metadata)
    
                if(metadata.svg.length) {
                    data = metadata.svg[metadata.svg.length - 1]
                } else {
                    data = metadata[imgFormat][metadata[imgFormat].length - 1]
                }

                if (fastProcess && !fs.existsSync(destFileSameName)) {
                    console.log("RENAMING: ", data.outputPath, " -> ", destFileSameName)
                    fs.renameSync(data.outputPath, destFileSameName)
                    data.outputPath = destFileSameName
                    data.filename = parsed.base
                }
            }
        }

        let result = {
            autoId: slugify(`${parsed.dir}/${parsed.name}`, { strict: true }),
            srcAttribute: path.join(destPath, parsed.dir, data.filename)
        }
        return result
    } catch (err) {
        console.error(src, err)
        return ""
    }
}

function idMap(prefix, items, suffix = '') {
    return items.map(e => `${prefix}${e[0]}${suffix}`)
}

// https://rbyte.github.io/spreadFn/
const spreadFn = (y) => y === 0 ? (x) => x : (y > 0
	? (x) => Math.atan( (x-0.5)*y*2 )/Math.atan(y)/2+0.5
	: (x) => Math.tan( (x-0.5)*Math.atan(-y)*2 )/-y/2+0.5)

function easingGradient(start = 0, end = 100, stops = 8, smoothness = 3) {
	var fn = spreadFn(smoothness)
	var range = end - start
	var result = []
	for (let i = 0; i < stops; i++) {
		var posR = 1 / (stops-1) * i
		posR = posR.toFixed(2)
		var posFn = fn(posR).toFixed(2)
		result.push(`rgba(0,0,0, ${posFn}) ${start + range * posR}%`)
	}
	return result.join(',\n')
}

module.exports = function(eleventyConfig) {
    // https://www.11ty.dev/docs/plugins/render/#renderfile
    eleventyConfig.addPlugin(EleventyRenderPlugin)

    eleventyConfig.addPassthroughCopy("src/pagedjs")

    eleventyConfig.addPassthroughCopy("src/media/originals/passthroughCopies/")
    
    eleventyConfig.addPassthroughCopy("src/css")
    eleventyConfig.addWatchTarget("src/css")
    
    eleventyConfig.addPassthroughCopy("src/js")
    eleventyConfig.addWatchTarget("src/js")
    
    eleventyConfig.on('afterBuild', () => {
        // after first starting the server, the result is buggy,propably due to some race condition during image processing. We always need to reload after the first serve is ready. Touch a file to trigger a reload. I do not know how to do this programmatically
        if (firstRun) {
            let file = "./src/triggerReload.njk"
            function touchFileAfterTimeout() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (fs.existsSync(file))
                            fs.unlinkSync(file)
                        fs.writeFile(file, "", function (err) {
                            if (err) throw err
                            console.log("created file to trigger a reload")
                            resolve()
                        })
                    }, 1000)
                })
            }
            
            async function f1() {
                await touchFileAfterTimeout()
            }
            
            f1()
        }
        firstRun = false
    })

    let createSortedCollection = function(year, lang) {
        eleventyConfig.addCollection(`articles_${year}_${lang}`,
        (collection) => collection
            .getFilteredByGlob([`./src/${year}/${lang}/articles/*.md`, `./src/${year}/${lang}/articles/*.njk`])
            .sort((a, b) => {


                // console.assert()), `Missing order for ${a.fileSlug}`)

                return articleOrder[lang+year].indexOf(a.fileSlug) - articleOrder[lang+year].indexOf(b.fileSlug)
            })
            .map(e => {
                e.existsInArticleOrder = articleOrder[lang+year].includes(e.fileSlug)

                // sometimes I set id to make it custom. if not, use title:
                if (!e.data.id && e.data.title) { 
                    // I emulate nunjucks' slugify here to get the same result
                    e.data.id = slugify(e.data.title, { strict: true, lower: true })
                }
                return e
            })
        )
    }
    
    // Articles: https://docs.google.com/spreadsheets/d/1pC-qmOUWU6diB3jMjgpbRYse9seF1wOx_XF3gJBeTC4/edit#gid=0
    createSortedCollection("2022", "en")
    createSortedCollection("2022", "vi")

    createSortedCollection("2023", "en")
    createSortedCollection("2023", "vi")

    eleventyConfig.addCollection('parallelVerses2023', function(c) {
        return parallelVerses2023
    })
    
    // https://www.11ty.dev/docs/languages/nunjucks/#generic-global
    eleventyConfig.addNunjucksGlobal("articleCalligraphies", function(fileSlug) {
        let e = {}
        e.hasCalligraphy = articleTitleCalligraphies.includes(`${fileSlug}.webp`)
        if (e.hasCalligraphy) {
            e.calligraphyFile = `${calligraphyPath}${fileSlug}.webp`
        } else {
            e.hasCalligraphy = articleTitleCalligraphies2023.includes(`${fileSlug}.webp`)
            if (e.hasCalligraphy) {
                // console.log("found calligraphy for article: ", fileSlug)
                e.calligraphyFile = `${calligraphyPath2023}${fileSlug}.webp`
            }
        }
        return e
    })

    eleventyConfig.addNunjucksShortcode("idMap", idMap)
    eleventyConfig.addNunjucksShortcode("easingGradient", easingGradient)
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode)
    eleventyConfig.addNunjucksAsyncShortcode("imageSrc", imageSrcShortcode)
    eleventyConfig.addLiquidShortcode("image", imageShortcode)
    eleventyConfig.addJavaScriptFunction("image", imageShortcode)

    return {
        dir: {
            input: "src",
            output: "docs"
        },
        markdownTemplateEngine: "njk"
    }
}
