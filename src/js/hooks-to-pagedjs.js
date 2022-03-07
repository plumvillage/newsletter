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


// https://www.pagedjs.org/documentation/11-hooks/
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

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
            if(node.textContent.includes("�")) {
                console.log("FOUND � BUG IN: ", node)
                node.innerHTML = node.innerHTML.replaceAll("�", "·")
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

        document.querySelectorAll('.hasContent .pagedjs_margin-content').forEach(el => {
            el.innerHTML += `<datetime class="lastmod">${document.lastModified}</datetime>`;
        });
        
        document.querySelectorAll('article').forEach(e => {
            let artName = e.classList.item(0)
            if (artName && artName.match(/article-.*/g)) {
                addClassToPageDIV(e, `PAGE-OF-${artName}`)
            }
        });
    }

}
Paged.registerHandlers(MyHandler);
