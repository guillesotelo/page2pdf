chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "convertToPDF") convertPageToPDF()
})

const imageUrlToBase64 = async (url) => {
    const data = await fetch(url)
    const blob = await data.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
            const base64data = reader.result
            resolve(base64data)
        }
        reader.onerror = reject
    })
}

const replaceImageSourcesWithBase64 = () => {
    const images = document.querySelectorAll('img')
    Array.from(images).forEach(img => {
        img.src = imageUrlToBase64(img.src)
    })
}

const convertPageToPDF = () => {
    console.log("Converting page to PDF...")
    window.jsPDF = window.jspdf.jsPDF
    // replaceImageSourcesWithBase64()

    html2canvas(document.body,
        {
            // logging: true,
            letterRendering: 1,
            // allowTaint: true,
            // useCORS: true
        }
    ).then(function (canvas) {
        // Convert the canvas to a data URL
        var imgData = canvas.toDataURL('image/png')
        var imgWidth = 210
        var pageHeight = 295
        var imgHeight = canvas.height * imgWidth / canvas.width
        var heightLeft = imgHeight
        var doc = new jsPDF('p', 'mm')
        var position = 10 // give some top padding to first page

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
            position += heightLeft - imgHeight // top padding for other pages
            doc.addPage()
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        doc.save("page.pdf")
        chrome.runtime.sendMessage({ action: "processComplete" })
    })
}
