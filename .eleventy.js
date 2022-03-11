const articleOrder = {}
articleOrder.vi = require("./src/_data/article-order-vi.js");
articleOrder.en = require("./src/_data/article-order-en.js");
const fs = require('fs')
const path = require("path");
const slugify = require('slugify')
const sharp = require("sharp");
const Image = require("@11ty/eleventy-img");
Image.concurrency = 8; // default is 10
const srcPath = "src/media/originals";
const calligraphyPath = "calligraphy/article titles/article-titles/";
// const calligraphyPath = "calligraphy/article-titles/";
var articleTitleCalligraphies = fs.readdirSync(`src/media/originals/${calligraphyPath}`)
// var articleTitleCalligraphies = fs.readdirSync(`src/media/publish/${calligraphyPath}`)

async function imageShortcode(src, optClasses = "", imgLabel = "") {
    let result = await imageData(src)
    
    let html = `<figure id="${result.autoId}" class="${optClasses}"><img src="${result.srcAttribute}" decoding="async">${imgLabel != "" ? `<figcaption>${imgLabel}</figcaption>` : ""}</figure>`;

    // img loading="lazy" is buggy! stops chrome from running pagedjs
    return html;
}

async function imageSrcShortcode(src) {
    let result = await imageData(src)
    return result.srcAttribute
}

async function imageData(src) {
    let justCopy = false;
    let dryRun = false;
    let srcFull = path.join(srcPath, src);
    let destPath = "/media/build";
    let data = { filename: path.basename(src) };
    let parsed = path.parse(src);
    
    let outputDir = parsed.dir ? path.join("docs/media/build", parsed.dir) : "docs/media/build";
    
    let imgFormat = "jpeg"
    // when the input image is a webp, the output image should also be webp, because jpeg does not support transparency
    if (src.match(/\.webp$/g)) {
        imgFormat = "webp"
    }

    let options = {
        formats: [imgFormat, "svg"], /* jpeg, png, webp, gif, tiff, avif */
        outputDir: outputDir,
        // widths: [1500],
        widths: [5000],
        dryRun: dryRun,
        sharpOptions: {},
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: { quality: 96, },
        sharpJpegOptions: { quality: 96, },
        // sharpWebpOptions: { quality: 60, },
        // sharpJpegOptions: { quality: 60, },
        svgShortCircuit: true
    }

    try {
        // Image.statsSync doesn’t generate any files, but will tell you where the asynchronously generated files will end up!
        // let metadata = await Image(srcFull, options);
        // Image.statsSync(srcFull, options)

        if (!justCopy) {
            let metadata = await Image(srcFull, options);

            if(metadata.svg.length) {
                data = metadata.svg[metadata.svg.length - 1];
            } else {
                data = metadata[imgFormat][metadata[imgFormat].length - 1];
            }
        }

        console.log("processing:", data.filename)

        let result = {
            autoId: slugify(`${parsed.dir}/${parsed.name}`, { strict: true }),
            srcAttribute: path.join(destPath, parsed.dir, data.filename)
        }

        let destFile = path.join(outputDir, data.filename)
        if (justCopy && !fs.existsSync(destFile)) {
            fs.mkdirSync(outputDir, { recursive: true }, (err) => {
                if (err) throw err;
            });
            console.log("COPYING: ", srcFull, " -> ", destFile)
            fs.copyFileSync(srcFull, destFile, fs.constants.COPYFILE_EXCL);
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
    eleventyConfig.addPassthroughCopy("src/pagedjs");

    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addWatchTarget("src/css");

    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addWatchTarget("src/js");

    eleventyConfig.addPassthroughCopy({ "src/media/publish": "media" });

    eleventyConfig.addWatchTarget("src/media/publish");

    eleventyConfig.addPassthroughCopy("src/CNAME");

    let createSortedCollection = function(lang) {
        eleventyConfig.addCollection(`articles_${lang}`,
        (collection) => collection
            .getFilteredByGlob(`./src/${lang}/articles/*.md`)
            .sort((a, b) => {
                console.assert((articleOrder[lang].includes(a.fileSlug)), `Missing order for ${a.fileSlug}`);
                return articleOrder[lang].indexOf(a.fileSlug) - articleOrder[lang].indexOf(b.fileSlug);
            })
            .map(e => {
                // we could do some custom processing here
                // console.log(e.fileSlug)
                return e
            })
        )
    }
    
    // Articles: https://docs.google.com/spreadsheets/d/1pC-qmOUWU6diB3jMjgpbRYse9seF1wOx_XF3gJBeTC4/edit#gid=0
    createSortedCollection("vi")
    createSortedCollection("en")

    // https://www.11ty.dev/docs/languages/nunjucks/#generic-global
    eleventyConfig.addNunjucksGlobal("articleCalligraphies", function(fileSlug) {
        let e = {}
        e.hasCalligraphy = articleTitleCalligraphies.includes(`${fileSlug}.webp`)
        if (e.hasCalligraphy) {
            // console.log("found calligraphy for article: ", fileSlug)
            e.calligraphyFile = `${calligraphyPath}${fileSlug}.webp`
            // e.calligraphyFile = `/media/${calligraphyPath}${fileSlug}.webp`
        }
        return e
    });

    eleventyConfig.addNunjucksShortcode("idMap", idMap);
    eleventyConfig.addNunjucksShortcode("easingGradient", easingGradient);
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addNunjucksAsyncShortcode("imageSrc", imageSrcShortcode);
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    return {
        dir: {
            input: "src",
            output: "docs"
        },
        markdownTemplateEngine: "njk"
    }
};
