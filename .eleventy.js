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
            .sort((a, b) => a.fileSlug.localeCompare(b.fileSlug))
    );

    return {
        dir: {
            input: "src",
            output: "docs"
        },
        markdownTemplateEngine: "njk"
    }
};
