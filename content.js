chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "convertToPDF") convertPageToPDF()
})

const scrollDownUntilEnd = () => {
    function isAtPageEnd() {
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight
    }
    function scroll() {
        const x = 0
        const y = window.scrollY + window.innerHeight

        window.scrollTo({
            top: y,
            left: x,
        })
        if (!isAtPageEnd()) {
            scroll()
        }
    }
    scroll()
}

const imageUrlToBase64 = (img) => {
    var canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)
    var dataURL = canvas.toDataURL("image/png")
    return dataURL
}

const replaceImageSourcesWithBase64 = () => {
    const images = document.querySelectorAll('img')
    Array.from(images).forEach(async img => {
        const newSource = imageUrlToBase64(img)
        img.src = newSource
        console.log('newSource', newSource)
    })
}

const convertPageToPDF = () => {
    console.log("Converting page to PDF...")
    const title = document.querySelector('title')
    var options = {
        margin: 0,
        filename: `${title.textContent}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            // width: window.innerWidth,
            allowTaint: true,
            useCORS: true
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(options).from(document.body).save()
    chrome.runtime.sendMessage({ action: "processComplete" })
}
