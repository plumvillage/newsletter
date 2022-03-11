function addClassToPageDIV(e, className) {
    let i = 0
    while (e && i++ < 10) {
        e = e.parentNode
        if (e.tagName == "DIV" && e.classList.contains('pagedjs_page')) {
            e.classList.add(className)
            // console.log("added to:", e, className)
            break;
        }
    }
}


let fullText = "";
var client = new XMLHttpRequest();
// extracted text from /vi/a4-bleed/index.html
client.open('GET', '/fullText.txt');
client.onreadystatechange = function() {
    fullText = client.responseText
    if(fullText.includes("�")) {
        console.log("FOUND � BUG fullText !!!")
    }
    // console.log(fullText)
}
client.send();


// https://www.pagedjs.org/documentation/11-hooks/
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    // beforePageLayout() already has � BUG

    /*
    The intention here is to be able to place images with a custom style, for example, spanning the whole page. This code adds a unique class name to the page that contains it, which the css can then target and style.

    A better way to achieve this would be pagedjs' named pages. However, named pages break the page after whichever element sets it up.

    Also, the image style need to be applied BEFORE the layout engine of pagedjs has placed the content, which is the reason why we do it on renderNode(), right when placing the element in question (not later).
    */
    renderNode(node, sourceNode) {
        if (node.id == "verse-uyen-nguyen") {
            addClassToPageDIV(node, `PAGE-OF-verse-uyen-nguyen`)
        }

        if (node.nodeName == "FIGURE" && node.id) {
            addClassToPageDIV(node, `PAGE-OF-${node.id}`)
        }
        
        if (node.textContent) {
            /* for Vietnamese: � in render output, seems randomly appearing
                bởi -> b���i
                giờ đây đã -> giờ ��ây đã
                vấn tại -> vấn t���i
                mảnh đất nhỏ -> mảnh đ���t nhỏ
                ăn mừng là -> ăn m��g là
            Keeps being in the same position until eleventy is restarted.
            Appears in paragraphs after an image (e.g. first bottom placed image - hiccup with image processing?!)
            */
            if(node.textContent.includes("�")) {
                console.log("FOUND � BUG IN: ", node)
                let search = /([^�]{6})(�{1,5})([^�]{6})/i
                let result = node.textContent.match(search);
                // [ "nhân c��a thàn", "nhân c", "��", "a thàn" ]
                console.log(result)
                let rx = `${result[1]}(.{1,3})${result[3]}`
                const regex = new RegExp(rx);
                let r2 = fullText.match(regex)
                if (r2) {
                    // [ "nhân của thàn", "ủ" ]
                    console.log(r2)
                    console.log("replacing:", result[2], r2[1])
                    node.innerHTML = node.innerHTML.replace(result[2], r2[1])
                } else {
                    console.log("cannot find replacement")
                    node.innerHTML = node.innerHTML.replaceAll("�", "·")
                }
            }
        }
    }

    afterRendered(pages) {
        // for adding 🙢 to end of article
        document.querySelectorAll("article").forEach((e) => {
            // get only the first .article-end, ignore the others
            let x = e.querySelector(".article-end")
            if (x && x.previousSibling && x.previousSibling.classList) {
                // x.previousSibling may have children. we want the marker go inline, which is why we check:
                var last = x.previousSibling.querySelector("p:last-of-type")
                var lastE = last ? last : x.previousSibling
                lastE.classList.add("last-article-element")
            }
        })

        // put stamp on every page
        if (false) {
            document.querySelectorAll('.hasContent .pagedjs_margin-content').forEach(el => {
                el.innerHTML += `<datetime class="lastmod">${document.lastModified}</datetime>`;
            });
        }
        
        document.querySelectorAll('article').forEach(e => {
            let artName = e.classList.item(0)
            if (artName && artName.match(/article-.*/g)) {
                addClassToPageDIV(e, `PAGE-OF-${artName}`)
            }
        });
    }

}
Paged.registerHandlers(MyHandler);
