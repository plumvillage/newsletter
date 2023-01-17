// https://www.11ty.dev/docs/data-template-dir/
module.exports = {
    pagination: {
        data: "builds",
        size: 1
    },
    builds: ["articles", "articles-print-preview"],
    layout: "layouts/article",
    subLayout: ["layouts/web.njk", "layouts/print-frame.njk"],
    permalink: "/{{ year }}/{{ locale }}/{{ builds[pagination.pageNumber] }}/{{ page.fileSlug }}/",
    // size_label: "Letter",
    // size: "Letter",
    size_label: "A4",
    size: "A4",
    // bleed: "5mm",
    // marks: "crop",
    bleed: "0mm",
    marks: "none",
}
