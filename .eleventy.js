module.exports = function(eleventyConfig) {
  // Output directory: _site

  // Copy `assets/` to `_site/assets`
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addWatchTarget("assets");
  
  // Copy any .jpg file to `_site`, via Glob pattern (in 0.9.0+)
  // Keeps the same directory structure.
  eleventyConfig.addPassthroughCopy("**/*.jpg");
};
