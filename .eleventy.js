const articleOrder = require("./src/_data/article-order.js");

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
    console.log(parsed.dir)
    // let newName = slugify(parsed.name, {strict: true})
    // let newFull = parsed.dir + "/" + newName + parsed.ext

    // ./src/media/publish/article_photos/su-ong/ThayHeaderImg_whiteFadeout2.jpg
    // ../../media/article_photos/su-ong/ThayTalk_whiteFadeout2.jpg

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
        });
        data = metadata.webp[metadata.webp.length - 1];
        console.log(data)
        destPathRelative = destPathRelative + "build/"
    }
    console.log(`<img id="${id}" src="${destPathRelative}${parsed.dir}/${data.filename}" loading="lazy" decoding="async">`)
    /*
    {
        format: 'webp',
        width: 300,
        height: 168,
        url: '/img/5b-300w.webp',
        sourceType: 'image/webp',
        srcset: '/img/5b-300w.webp 300w',
        filename: '5b-300w.webp',
        outputPath: 'docs/media/build/5b-300w.webp',
        size: 19924
    }
    */
    return `<img id="${id}" src="${destPathRelative}${parsed.dir}/${data.filename}" loading="lazy" decoding="async">`;
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
