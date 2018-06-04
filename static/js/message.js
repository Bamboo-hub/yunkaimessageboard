var log = function() {
    console.log.apply(console, arguments)
}

var e = function(selector) {
    return document.querySelector(selector)
}

var es = function (sel) {
    return document.querySelectorAll(sel)
}

var ajax = function(request) {
    var r = new XMLHttpRequest()
    r.open(request.method, request.url, true)
    if (request.contentType !== undefined) {
        r.setRequestHeader('Content-Type', request.contentType)
    }
    r.onreadystatechange = function(event) {
        if(r.readyState === 4) {
            request.callback(r.response)
        }
    }
    if (request.method === 'GET') {
        r.send()
    } else {
        r.send(request.data)
    }
}

// 给多个class绑定事件
var bindAll = function (elements, eventName, callback) {
    for (var i = 0; i < elements.length; i++) {
        var tag = elements[i]
        tag.addEventListener(eventName, callback)
    }
}

var toggleClass = function(class1, element1, element2) {
    // 播放与暂停的 class 切换
    if (element1.classList.contains(class1)) {
        element1.classList.remove(class1)
        element2.classList.add(class1)
    } else {
        element2.classList.remove(class1)
        element1.classList.add(class1)
    }
}

// 页面载入时给动态添加的 HTML 增加 CSS
var controlCSS = function(messages) {
    // 默认显示页一留言
    var messageOne = e('#messages-1')
    if (messageOne != null) {
        messageOne.classList.add('show')
    }
    // 默认显示页一留言
    var pagemoduleOne = e('#pagemodule-1')
    if (pagemoduleOne != null) {
        pagemoduleOne.classList.add('show1')
    }
    // 默认页码一加上外发光效果
    var messageOne = e('#page-1')
    if (messageOne != null) {
        messageOne.classList.add('active')
    }
    // 根据页数的多少决定页码模块宽度
    if (messages.length != 0) {
        var pages = Math.ceil(messages.length / 5) + 2
        var width = pages * 30
        log(width, 'pages')
        if(width > 210) {
            width = 210
        }
        var pagebox = e('#pagebox')
        pagebox.style.width = `${width}px`
    }
}

// 如果留言不为空，则生成一整组相关模块
var loadPages = function(messages) {
    if (messages.length != 0) {
        var pages = Math.ceil(messages.length / 5)
        var pagebox = e('#pagebox')
        var left = `<div class="pageint2 page-<" data-index="<"><</div>`
        pagebox.insertAdjacentHTML('beforeend', left)
        newPageModule(pages)
        var right = `<div class="pageint2 page->" data-index=">">></div>`
        pagebox.insertAdjacentHTML('beforeend', right)
    }
}

// 创建页码模块，用于接下来往内填充页码
var newPageModule = function(pageint) {
    var module = Math.ceil(pageint / 5)
    log(module)
    var pagebox = e('#pagebox')
    for (var i = 1; i <= module; i++) {
        var m = `<div class="pagemodule" id="pagemodule-${i}"></div>`
        pagebox.insertAdjacentHTML('beforeend', m)
        newPage(i, pageint)
    }
}

// 创建每页留言的模块，用于接下来往内填充留言
var newPage = function(index, pages) {
    var int = (index - 1) * 5
    for (var i = 1; i <= 5; i++) {
        if(i + int <= pages) {
            var m = `<div class="page" id="messages-${i + int}"></div>`
            var messageContainer = e('#messages')
            messageContainer.insertAdjacentHTML('beforeend', m)

            var pagemodule = findContainer('.pagemodule', '#pagemodule-', 5)
            var m = `<div class="pageint" id="page-${i + int}" data-index="${i + int}">${i + int}</div>`
            pagemodule.insertAdjacentHTML('beforeend', m)
        }
    }
}

var findALL = function(element, selector) {
    return element.querySelectorAll(selector)
}

// 返回一个未被填满的留言模块
var findContainer = function(parentElement, keyword, elementMax) {
    var pagemax = es(parentElement).length
    for (var i = 1; i <= pagemax; i++) {
        var container = e(keyword + i)
        var cl = findALL(container, '*').length
        if (cl < elementMax) {
            return container
        } else if (cl >= elementMax) {
            continue
        }
    }
}

// 将所有留言插入到模块中
var insertMessageAll = function(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var m = messages[i]
        var t = templateMessage(m)
        var messageContainer = findContainer('.page', '#messages-', 15)
        messageContainer.innerHTML += t
    }
}


// 创建一个 messages 数组用来保存所有的 message
var messages = []

// 获取后端发来的留言
var loadMessages = function(callback) {
    var request = {
        method: 'GET',
        url: '/api/message/all',
        contentType: 'application/json',
        callback: callback
    }
    ajax(request)
}

// 向后端发送新的留言
var messageNew = function(form) {
    // var form = {
    //     content: "测试标题",
    // }
    var data = JSON.stringify(form)
    var request = {
        method: 'POST',
        url: '/api/message/add',
        data: data,
        contentType: 'application/json',
        callback: function(response) {
            console.log('有新的留言', response)
            var res = JSON.parse(response)
        }
    }
    ajax(request)
}

// 添加新的留言
var buttonClick = function() {
    var button = e('#button')
    var input = e('#input')
    button.addEventListener('click', function(event){
        var content = input.value
        log('valuelength', content.length)
        if (content.length >= 1 && content.length <= 200) {
            // 得到用户填写的数据
            var form = {
                content: content,
            }
            // 用这个数据调用 messageNew 来创建一篇新博客
            messageNew(form)
            setTimeout(function(){
                var box = e('#box')
                box.innerHTML = `
            <div id="messages">
            </div>
            <div id="pages">
                <div id="pagebox">
                </div>
            </div>
            `
                loadMessages(function(response) {
                    // 不考虑错误情况(断网/服务器返回错误等等)
                    var messages = JSON.parse(response)
                    loadPages(messages)
                    controlCSS(messages)
                    bindEventSwitch()
                    insertMessageAll(messages)
                })
                // swal("发送成功！", "刷新就可以看到留言啦。","success")
            }, 3000)
        } else if(content.length > 200) {
            swal("字段太长啦！", "修改一下内容或分段发送吧，谢谢你的热情！","warning")
        }
    })
}

// 生成单个留言模块
var templateMessage = function(message) {
    var id = message.id
    var content = message.content
    var m = `
    <div class="message-cell" data-id="${id}">
        <div class="message-bg">${content}</div>
        <img class='message-delete' src=images/message_delete.png>
    </div>
    `
    return m
}

// 直接点击切换页码
var bindEventSwitch = function() {
    // 切换留言与页码 css
    var selector = es('.pageint')
    bindAll(selector, 'click', function(event){
        var button = event.target
        var xwbc = button.dataset.index
        // 切换页码相应 class
        var a = e('.active')
        a.classList.remove('active')
        var img = '#page-' + String(xwbc)

        var img1 = e(img)
        img1.classList.add('active')

        // 切换相应页数的留言
        var s = e('.show')
        s.classList.remove('show')
        var page = '#messages-' + String(xwbc)
        var page1 = e(page)
        page1.classList.add('show')
    })
}

// 判断左右切换条件
var pagesCSS = function(direction) {
    var show1 = e('.show1')
    var modules = es('.pagemodule')
    for (var i = 0; i < modules.length; i++) {
        var m = modules[i]
        if(m === show1 && direction == 'left' && i != 0) {
            m.classList.remove('show1')
            var s = modules[i - 1]
            s.classList.add('show1')
        }
        if(m === show1 && direction == 'right' && i != modules.length - 1) {
            m.classList.remove('show1')
            var s = modules[i + 1]
            s.classList.add('show1')
        }
    }
}

// 左右切换页码组
var bindEventpages = function() {
    document.body.addEventListener('click', function (event) {
        var self = event.target
        if (self.classList.contains('page-<')) {
            pagesCSS('left')
        } else if (self.classList.contains('page->')) {
            pagesCSS('right')
        }
    })
}

// 删除留言
var bindEventPassword = function() {
    document.body.addEventListener('click', function (event) {
        var self = event.target
        if(self.classList.contains('message-delete')){
            swal({
                title: "这个是管理员使用的删除功能",
                text: "乖孩子不要乱试密码",
                content: {
                    element: "input",
                    attributes: {
                        placeholder: "Type your password",
                        type: "password",
                    },
                },
            })
            .then((value) => {
                verifyPassword(value, self)
            })
        }
    })
}

// 检测权限
var verifyPassword = function(string, element) {
    var form = {
        password: string,
        state: false,
    }
    var data = JSON.stringify(form)
    var request = {
        method: 'POST',
        url: '/api/message/verifypassword',
        data: data,
        contentType: 'application/json',
        callback: function(response) {
            var res = JSON.parse(response)
            if(res.state === true) {
                deleteMessage(element)
            }
        }
    }
    ajax(request)

}

// 删除后端数据
var deleteMessage = function(element) {
    var cell = element.parentElement
    var index = cell.dataset.id
    var form = {
        id: index,
    }
    var data = JSON.stringify(form)
    var request = {
        method: 'POST',
        url: '/api/message/delete',
        data: data,
        contentType: 'application/json',
        callback: function(response) {
            var c = JSON.parse(response)
        }
    }
    ajax(request)
    // 删除 message-cell
    cell.remove()
}

var bindEventMusic = function() {
    var a = e('#id-audio-player')
    a.autoplay = true

    // 手机模拟自动播放
    var f = function (event) {
        var self = event.target
        if (!self.classList.contains('play')) {
            a.play()
        }
        document.body.removeEventListener('click', f)
    }
    document.body.addEventListener('click', f)

    var play = e('.play')
    var pause = e('.pause')
    play.addEventListener('click', function(event){
        log('click 播放')
        a.pause()
        pause.style.display = 'block'
    })

    pause.addEventListener('click', function(event){
        log('click 暂停')
        a.play()
        pause.style.display = 'none'
    })
}

// 按设备高度设置 viewport 具体大小，并保持同比
var phoneViewport = function() {
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
findContainer()

loadMessages(function(response) {
    // 不考虑错误情况(断网/服务器返回错误等等)
    var messages = JSON.parse(response)
    window.messages = messages
    loadPages(messages)
    controlCSS(messages)
    bindEventSwitch()
    insertMessageAll(messages)
})
buttonClick()
bindEventPassword()
bindEventpages()
// bindEventMusic()
