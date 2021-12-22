HTML to PDF
============

## Using these files

The file ltlm43-try.html contains one article from the 2021 edition, to test out some design features. The HTML and CSS are base on [this example by Rachel Andrew](https://github.com/rachelandrew/css-for-print).

For now I've tested with the following tools:

### Prince
Install: [download from their website](https://www.princexml.com/download/)

Convert: `prince -s pdf-styles.css ltlm43.html -o builds/prince.pdf`

### Paged.js
Install: `npm install -g pagedjs-cli pagedjs`

Preview: uncomment the polyfill and css in the html and start a local webserver (I use `python -m http.server`)

Convert: `pagedjs-cli ltlm43-try.html -o builds/pagedjs.pdf`

### Viviostyle
Install: `npm install -g @vivliostyle/cli`

Preview: `vivliostyle preview ltlm43-try.html`

Convert: `vivliostyle build ltlm43-try.html -o builds/vivlio.pdf`
