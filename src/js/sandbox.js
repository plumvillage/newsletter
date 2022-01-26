
// https://html2canvas.hertzen.com/configuration
var myCanvas = document.querySelector("#custom-scrollbar")
var options = {scale: 0.3,
    canvas: myCanvas,
    width: "1000px",
    height: "1000px"
}

html2canvas(document.querySelector("article"), options).then(canvas => {
    console.log("success")
});
