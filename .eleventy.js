const articleOrder = {}
articleOrder.vi = require("./src/_data/article-order-vi.js");
articleOrder.en = require("./src/_data/article-order-en.js");
const fs = require('fs')
const path = require("path");
const slugify = require('slugify')
const sharp = require("sharp");
const Image = require("@11ty/eleventy-img");
// Image.concurrency = 4; // default is 10
const srcPath = "src/media/originals";
const calligraphyPath = "calligraphy/article-titles/";
var articleTitleCalligraphies = fs.readdirSync(`src/media/publish/${calligraphyPath}`)

const processImages = true;

async function imageShortcode(src, optClasses) {
    let result = await imageData(src)
    // img loading="lazy" is buggy! stops chrome from running pagedjs
    return `<img id="${result.autoId}" class="${optClasses ? optClasses : ""}" src="${result.srcAttribute}" decoding="async">`;
}

async function imageSrcShortcode(src) {
    let result = await imageData(src)
    return result.srcAttribute
}

async function imageData(src) {
    let dryRun = false;
    let srcFull = path.join(srcPath, src);
    let destPath = "/media";
    let data = { filename: path.basename(src) };
    let parsed = path.parse(src);

    let outputDir = parsed.dir ? path.join("docs/media/build", parsed.dir) : "docs/media/build";
    let options = {
        formats: ["webp", "svg"], /* jpeg, png, webp, gif, tiff, avif */
        outputDir: outputDir,
        widths: [2000],
        dryRun: dryRun,
        sharpOptions: {},
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: { quality: 50, },
        sharpJpegOptions: { quality: 40, },
        svgShortCircuit: true
        // disk cache works only when using the built-in hashing algorithm and not custom filenames
        // filenameFormat: function (id, src, width, format, options) {
        //     const extension = path.extname(src);
        //     const name = path.basename(src, extension);
        //     return `${name}-${width}w.${format}`;
        // }
    }

    try {
        if (processImages) {
            // can be async
            let metadata = await Image(srcFull, options)

            // Image(srcFull, options)
            // doesn’t generate any files, but will tell you where the asynchronously generated files will end up!
            // let metadata = Image.statsSync(srcFull, options);

            if(metadata.svg.length) {
                data = metadata.svg[metadata.svg.length - 1];
            } else {
                data = metadata.webp[metadata.webp.length - 1];
            }
            destPath = path.join(destPath, "build");
        }
        console.log("processing:", data.filename)

        /* data:
            format: 'webp',
            width: 600,
            height: 295,
            url: '/img/ThayHeaderImg_whiteFadeout2-600w.webp',
            sourceType: 'image/webp',
            srcset: '/img/ThayHeaderImg_whiteFadeout2-600w.webp 600w',
            filename: 'ThayHeaderImg_whiteFadeout2-600w.webp',
            outputPath: 'docs/media/build/article/su-ong/ThayHeaderImg_whiteFadeout2-600w.webp',
            size: 26450
        */

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

function easingGradient(start = 0, end = 100, stops = 10, smoothness = 3) {
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
            // .map(e => {
            //     // we could do some custom processing here
            //     return e
            // })
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
            e.calligraphyFile = `/media/${calligraphyPath}${fileSlug}.webp`
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
