chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "convertToPDF") {
        console.log("Converting page to PDF...")
    }
})