chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.create({url: chrome.runtime.getURL("index.html")});
});

chrome.webRequest.onBeforeRequest.addListener(function (info) {
    var runtimeId = chrome.runtime.id
    var urlWithoutProtocol = info.url.split('//')[1]
    var path = urlWithoutProtocol.substring(runtimeId.length)

    /**
     * We have to redirect every actual navigational request to index.html because we do not have a webserver
     * and cannot simply serve index.html with every request.
     * But we also want to keep the routing for the vue app, so we redirect to index.html with an additional parameter
     * 'route' that resembles the route for vue-router. We pickup this parameter in routes/index.js and redirect to
     * the actual vue component that we wanted to load.
     *
     * We do not want to redirect assets and static files, so we split the path at '.' to check if it has an extension.
     * Every path with an extension listed in STATIC_EXTENSIONS will not be redirected.
     *
     * Hint: this behavior is only triggered on page refresh (e.g. "F5"). Navigation normally will trigger vue-router
     * directly and is not handled by listener.
     */
    var ext = path.split('.').pop()
    var STATIC_EXTENSIONS = ['html', 'js', 'css', 'gz', 'png', 'woff2', 'ttf']
    if (STATIC_EXTENSIONS.indexOf(ext) < 0) {
      return {redirectUrl: "chrome-extension://" + runtimeId + '/index.html' + '?route=' + path}
    }
  },
  {
    urls: ["chrome-extension://" + chrome.runtime.id + "/*"]
  },
  ["blocking"]
);
