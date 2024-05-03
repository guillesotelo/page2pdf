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

const imageUrlToBase64 = (imgSrc) => {
    return new Promise((resolve, reject) => {
        // Fetch the image data as a Blob
        fetch(imgSrc, { mode: 'cors' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                // Read the Blob as a data URL
                const reader = new FileReader();
                reader.onload = function() {
                    resolve(reader.result);
                };
                reader.onerror = function() {
                    resolve(imgSrc)
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                resolve(imgSrc)
            });
    });
};

const replaceImageSourcesWithBase64 = () => {
    const images = document.querySelectorAll('img')
    Array.from(images).forEach(async img => {
        const newSource = imageUrlToBase64(img)
        img.src = newSource
        console.log('newSource', newSource)
    })
}

const convertPageToPDF = async () => {
    console.log("Converting page to PDF...")
    const title = document.querySelector('title')
    const { width } = document.body.getBoundingClientRect()

    window.scrollTo(0, 0)
    document.body.style.padding = '0 10px'

    let imagenes = document.getElementsByTagName("img");
    for (let i = 0; i < imagenes.length; i++) {
        if(imagenes[i].src.includes('://')) {
            const newSource = await imageUrlToBase64(imagenes[i].src)
            console.log(newSource)
            imagenes[i].src = newSource
        }
    }

    const marginX = (window.innerWidth - width) / 2

    console.log('width', width)
    console.log('window.innerWidth', window.innerWidth)
    var options = {
        margin: [0, marginX],
        filename: `${title ? title.textContent : 'page'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            width: width,
            windowWidth: width,
            // scale: 2,
            allowTaint: true,
            useCORS: true,
            dpi: 300
        },
        // jsPDF: {
        // margin: 5, 
        // format: 'letter', 
        // orientation: 'portrait'
        // }
    }
    html2pdf().set(options).from(document.body).save().then(() => {
        chrome.runtime.sendMessage({ action: "processComplete" })
    })
}
