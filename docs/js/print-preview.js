window.PagedConfig = {
    auto: false
};

let params = new URLSearchParams(document.location.search);
let pageSize = params.get("page-size").toLowerCase();
let previewEnabled = params.get("preview-enabled");

document.write(`<link rel="stylesheet" href="/css/print/${pageSize}.css">`);

if (previewEnabled) {
    document.write('<script src="/pagedjs/paged.polyfill.js"></script>');
    document.write('<link rel="stylesheet" href="/pagedjs/interface.css">');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('html').classList.add(`size-${pageSize}`);

    if (previewEnabled && window.PagedPolyfill) {
        window.PagedPolyfill.preview();
    }
}, false);
