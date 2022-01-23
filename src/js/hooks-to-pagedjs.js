// https://www.pagedjs.org/documentation/11-hooks/
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }
    
    renderNode(node, sourceNode) {
        if (node.nodeName == "IMG" && node.id) { // ELEMENT_NODE
            let e = node
            let i = 0
            while (e && i++ < 10) {
                e = e.parentNode
                if (e.tagName == "DIV" && e.classList.contains('pagedjs_page')) {
                    e.classList.add(`PAGE-OF-${node.id}`)
                    console.log("added to:", e)
                    break;
                }
            }
        }
    }

    afterPageLayout(pageElement, page, breakToken) {
        let addClassToPageWithImage = function(imgId) {
            let elem = pageElement.querySelector(`img#${imgId}`)
            if (elem) {
                console.log("found image page:")
                pageElement.classList.add(`PAGE-OF-${imgId}`)
                console.log(pageElement)
            }
        }
        // addClassToPageWithImage("articlephotosbrother-chan-phap-linhCS21202110152RL0936edited")
        // addClassToPageWithImage("articlephotosbrother-chan-minh-hyT-Minh-Hy-1-edited")
        
    }
}
Paged.registerHandlers(MyHandler);
