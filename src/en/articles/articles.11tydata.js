// https://www.11ty.dev/docs/data-template-dir/
module.exports = {
  pagination: {
    data: "builds",
    size: 1
  },
  builds: ["articles", "articles-print"],
  permalink: "/{{ locale }}/{{ builds[pagination.pageNumber] }}/{{ page.fileSlug }}/",
  layout: "layouts/article",
  subLayout: ["layouts/web.njk", "layouts/print-frame.njk"],
  locale: "en",
  size: "A4",
  bleed: "0mm",
  marks: "none",
  pagedjsCLI: true
}
