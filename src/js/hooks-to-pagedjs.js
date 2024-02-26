function addClassToPageDIV(e, className) {
    let i = 0
    while (e && i++ < 10) {
        e = e.parentNode
        if (e.tagName == "DIV" && e.classList.contains('pagedjs_page')) {
            e.classList.add(className)
            // console.log("added to:", e, className)
            break
        }
    }
}


// I only want to do this if it is necessary to save time
if (false) {
    let vi2022fullText = ""
    var client = new XMLHttpRequest()
    client.open('GET', '/media/originals/passthroughCopies/2022-vi-fullText.txt')
    client.onreadystatechange = () => { vi2022fullText = client.responseText }
    client.send()

    let vi2023fullText = ""
    var client2 = new XMLHttpRequest()
    client2.open('GET', '/media/originals/passthroughCopies/2023-vi-fullText.txt')
    client2.onreadystatechange = () => { vi2023fullText = client2.responseText }
    client2.send()
}

let vi2024fullText = ""
var client2 = new XMLHttpRequest()
client2.open('GET', '/media/originals/passthroughCopies/2024-vi-fullText.txt')
client2.onreadystatechange = () => { vi2024fullText = client2.responseText }
client2.send()


// https://www.pagedjs.org/documentation/11-hooks/
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller)
    }

    renderNode(node, sourceNode) {
        /*
        The intention here is to be able to place images with a custom style, for example, spanning the whole page. This code adds a unique class name to the page that contains it, which the css can then target and style.
    
        A better way to achieve this would be pagedjs' named pages. However, named pages break the page after whichever element sets it up.
    
        Also, the image style need to be applied BEFORE the layout engine of pagedjs has placed the content, which is the reason why we do it on renderNode(), right when placing the element in question (not later).
        */
        if (node.nodeName == "FIGURE" && node.id) {
            addClassToPageDIV(node, `PAGE-OF-${node.id}`)
        }
        
        if (node.nodeName == "FIGCAPTION") {
            // for use in css: content: attr(text-for-outline);
            node.setAttribute("text-for-outline", node.textContent)
        }

         // beforePageLayout() already has � BUG
        
        if (node.textContent) {
            /* for Vietnamese: � in render output, seems randomly appearing
                bởi -> b���i
                giờ đây đã -> giờ ��ây đã
                vấn tại -> vấn t���i
                mảnh đất nhỏ -> mảnh đ���t nhỏ
                ăn mừng là -> ăn m��g là
            Keeps being in the same position until eleventy is restarted.
            Appears in paragraphs after an image (e.g. first bottom placed image - hiccup with image processing?!)
            does it conincide with <img decoding=async?
            -> does it only happen with floating images? ... had one case whether switching to noFloat removed the bug
            */
            if(node.textContent.includes("�")) {
                console.log("FOUND � BUG IN: ", node)
                let search = /([^�]{0,6})(�{1,5})([^�]{0,6})/i
                let result = node.textContent.match(search)
                // [ "nhân c��a thàn", "nhân c", "��", "a thàn" ]
                console.log(result)
                let rx = `${result[1]}(.{1,3})${result[3]}`
                const regex = new RegExp(rx)

                let r2 = vi2024fullText.match(regex)
                
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
                el.innerHTML += `<datetime class="lastmod">${document.lastModified}</datetime>`
            })
        }
        
        document.querySelectorAll('article').forEach(e => {
            let artName = e.classList.item(0)
            if (artName && artName.match(/article-.*/g)) {
                addClassToPageDIV(e, `PAGE-OF-${artName}`)
            }
        })
    }

}
Paged.registerHandlers(MyHandler)
