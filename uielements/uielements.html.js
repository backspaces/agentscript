await fetch('https://code.agentscript.org/uielements/uielements.html')
    // await fetch('../uielements/uielements.html')
    .then(response => response.text())
    .then(html => {
        // Insert the HTML content for the menu into the DOM
        document.body.insertAdjacentHTML('afterbegin', html)
        console.log('uielements.html loaded and parsed')
    })
