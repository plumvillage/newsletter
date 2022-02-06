const articleOrder = require("./src/_data/article-order.js");
const fs = require('fs')
const path = require("path");
const slugify = require('slugify')
const sharp = require("sharp");
const Image = require("@11ty/eleventy-img");
// Image.concurrency = 4; // default is 10

async function imageShortcode(src, optClasses) {
    // src: article/su-ong/ThayHeaderImg_whiteFadeout2.jpg
    let processImages = false;
    const srcPath = "src/media/publish/";
    let srcFull = srcPath + src
    let destPath = "/media/";
    let data = { filename: path.basename(src) };
    let parsed = path.parse(src)
    let autoId = slugify(`${parsed.dir}/${parsed.name}`, { strict: true })
    let options = {
        formats: ["jpeg"], /* jpeg, png, webp, gif, tiff, avif */
        outputDir: `docs/media/build/${parsed.dir}`,
        widths: [2000],
        dryRun: !processImages,
        sharpOptions: {},
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: { quality: 50, },
        sharpJpegOptions: { quality: 40, },
        // disk cache works only when using the built-in hashing algorithm and not custom filenames
        // filenameFormat: function (id, src, width, format, options) {
        //     const extension = path.extname(src);
        //     const name = path.basename(src, extension);
        //     return `${name}-${width}w.${format}`;
        // }
    }

    async function getMetadata(src) {
        const metadata = await sharp(src).metadata();
//         {
//   format: 'jpeg',
//   width: 2480,
//   height: 3508,
//   space: 'srgb',
//   channels: 3,
//   depth: 'uchar',
//   density: 72,
//   chromaSubsampling: '4:4:4',
//   isProgressive: true,
//   hasProfile: true,
//   hasAlpha: false,
//   icc: <Buffer bytes>
// }
        console.log(metadata);
    }
    // getMetadata(srcFull)

    try {
        // if (processImages) {
            // can be async
            let metadata = await Image(srcFull, options)
            
            // Image(srcFull, options)
            // doesn’t generate any files, but will tell you where the asynchronously generated files will end up!
            // let metadata = Image.statsSync(srcFull, options);

            data = metadata.jpeg[metadata.jpeg.length - 1];
            destPath = destPath + "build/"
        // }
        
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
        // "../../media/build/article/su-ong/ThayHeaderImg_whiteFadeout2-600w.webp"

        // img loading="lazy" is buggy! stops chrome from running pagedjs
        let html = `<img id="${autoId}" class="${optClasses ? optClasses : ""}" src="${destPath}${parsed.dir}/${data.filename}" decoding="async">`
        
        // console.log(html)
        
        return html;
    } catch (err) {
        console.error(src, err)
        return ""
    }
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

    // Articles: https://docs.google.com/spreadsheets/d/1pC-qmOUWU6diB3jMjgpbRYse9seF1wOx_XF3gJBeTC4/edit#gid=0

    // Create localized collections of articles
    eleventyConfig.addCollection("articles_en", function(collection) {
        var coll = collection.getFilteredByGlob("./src/en/articles/*.md")
            // sort by file name ascending
        coll.sort((a, b) => a.fileSlug.localeCompare(b.fileSlug))
        return coll
    });
    eleventyConfig.addCollection("articles_vi",
        (collection) => collection
        .getFilteredByGlob("./src/vi/articles/*.md")
        .sort((a, b) => {
            console.assert((articleOrder.vi.includes(a.fileSlug)), `Missing order for ${a.fileSlug}`);
            return articleOrder.vi.indexOf(a.fileSlug) - articleOrder.vi.indexOf(b.fileSlug);
        })
    );

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
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
