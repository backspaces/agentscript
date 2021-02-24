module.exports = function(eleventyConfig) {
  // eleventyConfig.setTemplateFormats([
  //   "md",
  //   "css" // css is not yet a recognized template extension in Eleventy
  // ]);
  eleventyConfig.addPassthroughCopy("src")
  eleventyConfig.addPassthroughCopy("vendor")
  eleventyConfig.addPassthroughCopy("tutorials")
  eleventyConfig.addPassthroughCopy("style.css")
  eleventyConfig.addPassthroughCopy("style.css.map")
  eleventyConfig.addPassthroughCopy("main.js")
}