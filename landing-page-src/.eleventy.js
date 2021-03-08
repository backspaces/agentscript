module.exports = function(eleventyConfig) {
  // eleventyConfig.setTemplateFormats([
  //   "md",
  //   "css" // css is not yet a recognized template extension in Eleventy
  // ]);
  eleventyConfig.addPassthroughCopy("src")
  eleventyConfig.addWatchTarget("./src/")
  eleventyConfig.addPassthroughCopy("vendor")
  eleventyConfig.addWatchTarget("./vendor/")
  eleventyConfig.addPassthroughCopy("tutorials")
  eleventyConfig.addWatchTarget("./tutorials/")
  eleventyConfig.addPassthroughCopy("editor")
  eleventyConfig.addWatchTarget("./editor/")
  eleventyConfig.addPassthroughCopy("style.css")
  eleventyConfig.addPassthroughCopy("style.css.map")
  eleventyConfig.addPassthroughCopy("main.js")

  return {
    dir: {
      output: "../landing-page"
    }
  }
}