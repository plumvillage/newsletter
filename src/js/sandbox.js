
// https://html2canvas.hertzen.com/configuration
var myCanvas = document.querySelector("#custom-scrollbar")
var options = {scale: 0.3,
    canvas: myCanvas,
    width: "200",
    height: "3000"
}

html2canvas(document.querySelector("article"), options).then(canvas => {
    console.log("success")
});
