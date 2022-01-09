module.exports = function (eleventyConfig) {
    // Output directory: _site

    // Copy `assets/` to `_site/assets`
    eleventyConfig.addPassthroughCopy("src/pagedjs");
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addWatchTarget("src/css");

    // Copy any .jpg file to `_site`, via Glob pattern (in 0.9.0+)
    // Keeps the same directory structure.
    eleventyConfig.addPassthroughCopy("**/*.jpg");

    return {
        dir: {
            input: "src",
            output: "public"
        },
    }
};
