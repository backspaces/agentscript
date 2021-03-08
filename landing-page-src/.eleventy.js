module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src")
  eleventyConfig.addWatchTarget("./src/")
  eleventyConfig.addPassthroughCopy("vendor")
  eleventyConfig.addWatchTarget("./vendor/")
  eleventyConfig.addPassthroughCopy("tutorials")
  eleventyConfig.addWatchTarget("./tutorials/")
  eleventyConfig.addPassthroughCopy("editor")
  eleventyConfig.addWatchTarget("./editor/")
  eleventyConfig.addPassthroughCopy("sass")
  eleventyConfig.addWatchTarget("./sass/")
  eleventyConfig.addPassthroughCopy("style.css")
  eleventyConfig.addPassthroughCopy("style.css.map")
  eleventyConfig.addPassthroughCopy("main.js")

  return {
    dir: {
      output: "./dev-build"
    }
  }
}