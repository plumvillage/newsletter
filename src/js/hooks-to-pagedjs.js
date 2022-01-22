// https://www.pagedjs.org/documentation/11-hooks/
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
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
        addClassToPageWithImage("articlephotosbrother-chan-phap-linhCS21202110152RL0936edited")

    }
}
Paged.registerHandlers(MyHandler);
