function addLiveCodeExampleForAgentArrayPage() {
    const containerElement = document.querySelector('body article div')
    const liveCodeContainer = document.createElement('div')

    const origin = document.location.origin
    console.log('origin', origin)

    /**
     * Adding some clean-jsdoc-theme class names
     */
    liveCodeContainer.classList.add(
        'method-member-container',
        'flex',
        'flex-col',
        'w-100',
        'overflow-auto',
        'mt-20'
    )

    liveCodeContainer.innerHTML += `
  <iframe src="${origin}/config/cleantheme/Snippets.html" style="height:700px; width: 100%; background: white;" class="mt-20"></iframe>
  `

    containerElement.append(liveCodeContainer)
}

window.addEventListener('DOMContentLoaded', addLiveCodeExampleForAgentArrayPage)
