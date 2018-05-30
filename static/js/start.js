var log = function() {
    console.log.apply(console, arguments)
}

var e = function(selector) {
    return document.querySelector(selector)
}

var es = function (sel) {
    return document.querySelectorAll(sel)
}

var phoneViewport = function() {
    // 按设备高度设置 viewport 具体大小，并保持同比
    var viewport = e('#viewport')
    var viewportWidth = window.innerWidth
    var viewportHeight = window.innerWidth / 0.562218890554723
    log('viewport', viewportWidth, viewportHeight, window.innerHeight)
    if (window.innerWidth < window.innerHeight) {
        viewport.style.width = `${viewportWidth}px`
        viewport.style.height = `${viewportHeight}px`
    }
}

phoneViewport()
