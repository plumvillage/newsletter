// https://www.11ty.dev/docs/data-template-dir/
module.exports = {
    pagination: {
        data: "builds",
        size: 1
    },
    builds: ["articles", "articles-print-preview"],
    layout: "layouts/article",
    subLayout: ["layouts/web.njk", "layouts/print-frame.njk"],
    permalink: "/{{ locale }}/{{ builds[pagination.pageNumber] }}/{{ page.fileSlug }}/",
    locale: "en",
    size_label: "A4",
    size: "A4",
    bleed: "0mm",
    // marks: "crop",
    marks: "none",
}
