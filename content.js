
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "convertToPDF") convertPageToPDF()
})

const convertPageToPDF = () => {
    window.jsPDF = window.jspdf.jsPDF

    console.log("Converting page to PDF...")

    let svgElements = document.body.querySelectorAll('svg')
    svgElements.forEach(function (item) {
        item.setAttribute("width", item.getBoundingClientRect().width)
        item.setAttribute("height", item.getBoundingClientRect().height)
        item.style.width = null
        item.style.height = null
    })

    const doc = new jsPDF()
    doc.html(document.body, {
        callback: function (doc) {
            doc.save('webpage.pdf')
        }
    })
}