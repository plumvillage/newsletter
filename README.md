# Newsletter / Lá thư Làng Mai

## Installing
### Eleventy
```
cd eleventy
npm install
```

### PagedJS
```
npm install -g pagedjs-cli pagedjs
```


## Previewing the web and print version

```
cd eleventy
npm install
npx @11ty/eleventy --serve
# or
eleventy --serve
```
Navigate you browser to http://localhost:8080/

## Tools

### HTML/CSS to print conversion
See some experiments in the folder [html-to-pdf](html-to-pdf). We seem to settle with [paged.js](https://www.pagedjs.org/about/). Other options:

- [Prince](https://princexml.com/)
- [Vivliostyle](https://vivliostyle.org/)
- [html2print](http://osp.kitchen/tools/html2print/)

There are some render tests for the first three of these tools in the folder [html-to-pdf/builds](html-to-pdf/builds).

### Static site generators
- [Eleventy](https://www.11ty.dev)
- [Honkit](https://github.com/honkit/honkit) (specially for "books")

### ePub conversion
- [Pandoc](https://pandoc.org/)

## Useful resources
- [Designing For Print With CSS - Rachel Andrew in Smashing Magazine](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
- [print-css.rocks](https://www.print-css.rocks/)
- [PrintCSS](https://printcss.net/articles)
- [Book toolkit](http://booktoolkit.com/resources)
- [Une chaîne de publication collaborative et multisupport pour le musée Saint-Raymond](https://julie-blanc.fr/blog/2020-11-05_chiragan/) (French article that describes a similar workflow. Very readable with Google translate. [Source code available](https://gitlab.com/musee-saint-raymond/villa-chiragan/).)

### Comparing tools
- [A comparison of different html2pdf tools](https://azettl.github.io/html2pdf/)
