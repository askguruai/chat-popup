;(function () {
  const baseUrl = "https://chat-popup.askguru.ai"
  const mountPointId = "askguru-chat-popup-container"

  function createAppMountPoint() {
    const appMountPoint = document.createElement("div")
    appMountPoint.id = mountPointId
    document.body.appendChild(appMountPoint)
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.onload = resolve
      script.onerror = reject
      script.src = src
      document.body.appendChild(script)
    })
  }

  function loadCSS(href) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.type = "text/css"
    link.href = href
    document.head.appendChild(link)
  }

  function getQueryParams(scriptSrc) {
    const queryString = scriptSrc.split("?")[1]
    return new URLSearchParams(queryString)
  }

  // Parse the query parameters from the script tag that included current script
  const scripts = document.getElementsByTagName("script")
  const currentScript = scripts[scripts.length - 1]
  window.askguruQueryParams = getQueryParams(currentScript.src)

  // Disable zooming on text input on iPhones
  if (navigator.userAgent.indexOf("iPhone") > -1) {
    document
      .querySelector("[name=viewport]")
      .setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1")
  }

  // Fetch the assets directory
  fetch(`${baseUrl}/assets/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.text()
    })
    .then((html) => {
      // Use a simple regex to find .js and .css files
      const jsFile = html.match(/href="([^"]+\.js)"/)
      const cssFile = html.match(/href="([^"]+\.css)"/)

      createAppMountPoint()

      // Load the CSS and JS
      if (cssFile && cssFile[1]) {
        loadCSS(`${baseUrl}/assets/${cssFile[1]}`)
      }
      if (jsFile && jsFile[1]) {
        loadScript(`${baseUrl}/assets/${jsFile[1]}`)
          .then(() => {})
          .catch((error) => {
            console.error("Error loading React app script:", error)
          })
      }
    })
    .catch((error) => {
      console.error("Could not load assets directory:", error)
    })
})()
