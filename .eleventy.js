const articleOrder = require("./src/_data/article-order.js");
const fs = require('fs')
const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imageShortcode(src, id) {
    // src: article_photos/su-ong/ThayHeaderImg_whiteFadeout2.jpg
    let reduce = true;
    const mediaPath = "src/media/publish/";
    let srcFull = mediaPath+src
    let destPathRelative = "../../media/";
    let data = {filename: path.basename(src)};
    let parsed = path.parse(src)

    try {
        if (reduce) {
            let metadata = await Image(srcFull, {
                formats: ["webp"],
                outputDir: `docs/media/build/${parsed.dir}`,
                widths: [600],
                sharpOptions: {},
                // https://sharp.pixelplumbing.com/api-output#webp
                sharpWebpOptions: {
                    quality: 90,
                },
                filenameFormat: function (id, src, width, format, options) {
                    const extension = path.extname(src);
                    const name = path.basename(src, extension);
                    return `${name}-${width}w.${format}`;
                }
            }).catch(err => {
                console.log("caught the error! 2")
                return ""
            });
            data = metadata.webp[metadata.webp.length - 1];
            destPathRelative = destPathRelative + "build/"
        }

        /* data:
            format: 'webp',
            width: 600,
            height: 295,
            url: '/img/ThayHeaderImg_whiteFadeout2-600w.webp',
            sourceType: 'image/webp',
            srcset: '/img/ThayHeaderImg_whiteFadeout2-600w.webp 600w',
            filename: 'ThayHeaderImg_whiteFadeout2-600w.webp',
            outputPath: 'docs/media/build/article_photos/su-ong/ThayHeaderImg_whiteFadeout2-600w.webp',
            size: 26450
        */
        // "../../media/build/article_photos/su-ong/ThayHeaderImg_whiteFadeout2-600w.webp"
        return `<img id="${id}" src="${destPathRelative}${parsed.dir}/${data.filename}" loading="lazy" decoding="async">`;
    } catch(err) {
        console.error(id, src, err)
        return ""
    }
}


module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/pagedjs");

    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addWatchTarget("src/css");

    eleventyConfig.addPassthroughCopy({ "src/media/publish": "media" });
    eleventyConfig.addWatchTarget("src/media/publish");

    eleventyConfig.addPassthroughCopy("src/CNAME");

    // Articles: https://docs.google.com/spreadsheets/d/1pC-qmOUWU6diB3jMjgpbRYse9seF1wOx_XF3gJBeTC4/edit#gid=0

    // Create localized collections of articles
    eleventyConfig.addCollection("articles_en", function (collection) {
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
