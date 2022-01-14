module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/pagedjs");

    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addWatchTarget("src/css");

    eleventyConfig.addPassthroughCopy({ "src/media/publish": "media" });
    eleventyConfig.addWatchTarget("src/media/publish");

    eleventyConfig.addPassthroughCopy("src/CNAME");
    
    // Create localized collections of articles
    eleventyConfig.addCollection("articles_en", function (collection) {
        return collection.getFilteredByGlob("./src/en/articles/*.md");
    });
    eleventyConfig.addCollection("articles_vi", function (collection) {
        return collection.getFilteredByGlob("./src/vi/articles/*.md");
    });

    return {
        dir: {
            input: "src",
            output: "docs"
        },
        markdownTemplateEngine: "njk"
    }
};
