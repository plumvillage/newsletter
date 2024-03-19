# Newsletter / Lá thư Làng Mai

Single source publishing project using [Eleventy](https://www.11ty.dev) and [PagedJS](https://www.pagedjs.org/).

A deploy is running here: [lathu.langmai.org](https://lathu.langmai.org/)

## Setup for local development
The [media archive](https://drive.google.com/file/d/1Rz2ZZJPmMqo26VbJ6zjFp-TpDnXMHOAe/view?usp=drive_link) (5.5GiB) is required but not part of this repository. Please request it from the Newsletter team and extract it via:
`tar -xf LTLM_2024_2023_and_2022_Media_Archive.tar`

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
- [Prince](https://princexml.com/)
- [Vivliostyle](https://vivliostyle.org/)
- [Quire](https://quire.getty.edu/)
- [html2print](http://osp.kitchen/tools/html2print/)
- [A comparison of different html2pdf tools](https://azettl.github.io/html2pdf/)

## Bugs & ToDos
 - Eleventy Image processing is not parallel.
 - Sometimes paragraphs (and images) do not break correctly to the next page. See src/media/documentation/BugTextFragment.webp. The fragment ends up in the top right corner (or outside) of the page.
 - The pages with the fade-in gradients over the background images crash Adobe Reader, but only if they had been compressed before with Ghostscript; the uncompressed original works fine! In other words, there is something Ghostscript adds in the compression of those pages that cause the crash. I confirmed that it does not depend on the number of stops of the linear-gradient. It also does not depend on the whether or not I use PDF version 1.7 or 1.5.

## Bulk conversation from source ODT (or DOCX...) to Markdown using [Pandoc](https://pandoc.org/)
```
for i in *.odt
do
	pandoc --from odt --to markdown --wrap=none -i "$i" -o "${i%odt}md"
done
```

## Text Harmonisations to Remember/Conventions
VS Code allows for regex replace submatch, e.g.: ([a-zA-Z])" > $1”
  - Sr > Sr.
  - Br > Br.
  -    >   (replace double spaces)
  -  >  – 
  - ... > …
  - \... > …
  - ' > ’
  - \' > ’ (a pandoc markdown conversion thing)
  - " > “”
  -  "([\p{Letter}]) >  “$1
  - ”. > .”
  - \*\*(.*)\*\* > ## $1
  - file:///media/data/dev/newsletter/src/media/originals/(.*) > {% image "$1" %}

## Terminal Foo
/media/data/dev/newsletter/src/media/originals/article2024
find * | grep -i "Done" | grep -E -i "jpg|jpeg|png" | grep -v "/._"
find -iname "._*" -delete
find -iname ".DS_Store" -delete
