// https://www.11ty.dev/docs/data-template-dir/
// https://www.11ty.dev/docs/data-js/
module.exports = {
    pagination: {
        data: "builds",
        size: 1
    },
    builds: ["bai", "articles-print", "articles-print-preview"],
    layout: "layouts/article",
    subLayout: ["layouts/web.njk", "layouts/print-frame.njk", "layouts/print-frame.njk"],
    pagedjsCLI: [false, true, false],
    permalink: "/{{ locale }}/{{ builds[pagination.pageNumber] }}/{{ page.fileSlug }}/",
    locale: "vi",
    size: "A4",
    bleed: "0mm",
    marks: "none",
}
