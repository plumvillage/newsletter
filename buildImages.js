const path = require("path");
const Image = require("@11ty/eleventy-img");
Image.concurrency = 4; // default is 10

(async () => {
    // let url = "https://images.unsplash.com/photo-1608178398319-48f814d0750c";
    let url = "docs/media/FrontCover_VN_NEW_Bleed.jpg";
    let stats = await Image(url, {
        formats: ["webp"],
        outputDir: "docs/media/build/",
        widths: [300],
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: {
            quality: 90,
        },
        filenameFormat: function (id, src, width, format, options) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);
            return `${name}-${width}w.${format}`;
        }
    });
    console.log( stats );
})();

async function imageShortcode(src, alt) {
    let metadata = await Image(src, {
        formats: ["webp"],
        outputDir: "docs/media/build/",
        widths: [300],
        // https://sharp.pixelplumbing.com/api-output#webp
        sharpWebpOptions: {
            quality: 90,
        }
    });
    
    let data = metadata.jpeg[metadata.jpeg.length - 1];
    return `<img src="${data.url}" width="${data.width}" height="${data.height}" alt="${alt}" loading="lazy" decoding="async">`;
}


/* {
  webp: [
    {
      format: 'webp',
      width: 300,
      height: 300,
      url: '/img/yL0QoCVMHj-300.webp',
      sourceType: 'image/webp',
      srcset: '/img/yL0QoCVMHj-300.webp 300w',
      filename: 'yL0QoCVMHj-300.webp',
      outputPath: 'img/yL0QoCVMHj-300.webp',
      size: 10184
    }
  ],
  jpeg: [
    {
      format: 'jpeg',
      width: 300,
      height: 300,
      url: '/img/yL0QoCVMHj-300.jpeg',
      sourceType: 'image/jpeg',
      srcset: '/img/yL0QoCVMHj-300.jpeg 300w',
      filename: 'yL0QoCVMHj-300.jpeg',
      outputPath: 'img/yL0QoCVMHj-300.jpeg',
      size: 15616
    }
  ]
}
*/