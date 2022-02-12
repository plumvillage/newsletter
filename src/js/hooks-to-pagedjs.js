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
        if (node.nodeName == "IMG" && node.id) {
            let e = node
            let i = 0
            while (e && i++ < 10) {
                e = e.parentNode
                if (e.tagName == "DIV" && e.classList.contains('pagedjs_page')) {
                    e.classList.add(`PAGE-OF-${node.id}`)
                    // console.log("added to:", e)
                    break;
                }
            }
        }
    }

    
    afterRendered(pages) {
        // for adding 🙢 to end of article
        document.querySelectorAll(".article-end").forEach((e) => {
            if (e.previousSibling && e.previousSibling.classList)
                e.previousSibling.classList.add("last-article-element")
        })

        document.querySelectorAll('.hasContent .pagedjs_margin-content').forEach(el => {
            el.innerHTML += `<datetime class="lastmod">${document.lastModified}</datetime>`;
        });

        // add closing ” to blockquote (before <cite>, if it exists)
        document.querySelectorAll("blockquote p:last-child").forEach((e) => {
            let c = e.querySelector("cite")
            if (c) {
                e.insertBefore(document.createTextNode("”"), c)
            } else {
                e.append("”")
            }
        })
    }

}
Paged.registerHandlers(MyHandler);
