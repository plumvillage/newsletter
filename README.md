# Newsletter / Lá thư Làng Mai

Single source publishing project using [Eleventy](https://www.11ty.dev) and [PagedJS](https://www.pagedjs.org/).

A deploy is running here: [lathu.langmai.org](https://lathu.langmai.org/)

## Setup for local development
The [media archive](https://drive.google.com/file/d/1irF6b0GT4MHNmnBmRfb_au2cQb7eM1hE/view?usp=sharing) (1.5GiB) is required but not part of this repository. Please request it from the Newsletter team and extract it via:
`tar -xf LTLM2022_FullMediaArchiveForBookGeneration_2022-03-20.tar.gz -C src`

Then run `./setup.sh`

## Running locally
Run `npm start` and browse to [http://localhost:8080/](http://localhost:8080/).
Because of a bug that currently renders 4 columns on first run, you need to trigger a re-render after the first start is ready.

## Generating PDF files
`node generatePDF.js`

## Deployment
`npm run deploy`

## Useful resources
- PagedJS [documentation](https://www.pagedjs.org/documentation/)
& [quick solution & fix to layout problems](https://gitlab.pagedmedia.org/tools/pagedjs/-/wikis/Quick-solution-&-fix-to-layout-problems)

- [Designing For Print With CSS - Rachel Andrew in Smashing Magazine](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
- [print-css.rocks](https://www.print-css.rocks/)
- [PrintCSS](https://printcss.net/articles)
- [Book toolkit](http://booktoolkit.com/resources)
- [Une chaîne de publication collaborative et multisupport pour le musée Saint-Raymond](https://julie-blanc.fr/blog/2020-11-05_chiragan/) (French article that describes a similar workflow. Very readable with Google translate. [Source code available](https://gitlab.com/musee-saint-raymond/villa-chiragan/).)
- [Multilingual sites with Eleventy](https://www.webstoemp.com/blog/multilingual-sites-eleventy/)
- [Conversion to Markdown with GroupDocs](https://products.groupdocs.app/conversion/odt-to-md)

## Other tools considered
- [Pandoc](https://pandoc.org/)
- [Prince](https://princexml.com/)
- [Vivliostyle](https://vivliostyle.org/)
- [Quire](https://quire.getty.edu/)
- [html2print](http://osp.kitchen/tools/html2print/)
- [A comparison of different html2pdf tools](https://azettl.github.io/html2pdf/)

## Bugs & ToDos
 - The (in Browser) Print Preview and the actual PDF output from Puppeteer are not identical. the font flows slightly different (e.g. kerning, justification). Very annoying, because I cannot 100% predict the output from the preview. Generally, Puppeteer needs less space.
 - Images that are rotated with EXIF are not processed correctly, see https://stackoverflow.com/questions/48716266/sharp-image-library-rotates-image-when-resizing
 - Image processing is not parallel. Makes the first serve very slow.
 - After first starting the server, the result is buggy (propably due to some race condition during image processing). We always need to reload after the first serve is ready.
 - Sometimes paragraphs (and images) do not break correctly to the next page. See src/media/documentation/BugTextFragment.webp. The fragment ends up in the top right corner (or outside) of the page.
 - Orphans and Widows (css) do not work.
 - H2 are left as the last column element, even though page-break-after: avoid; is set
 - for very large files: ProtocolError: Protocol error (Page.printToPDF): Printing failed
