const areaJoin = document.querySelector('.join')
const btnJoin = document.querySelector('#btn-join')
const inputJoin = document.querySelector('#input-join')
const username = document.querySelector('#username')
const chatArea = document.querySelector('.chat-area')
const chatSend = document.querySelector('.chat-send')
const btnSend = document.querySelector('#btn-send')
const textarea = document.querySelector('#textarea')
const inputSocketid = document.querySelector('#socketid')

let socket
let usersConnected

btnJoin.addEventListener('click', join)
inputJoin.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) join()
})

btnSend.addEventListener('click', sendMessage)
textarea.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) sendMessage()
})

function sendMessage() {
    const message = textarea.value
    if (message == '') return
    socket.emit('send-message', {
        message, socketid: inputSocketid.value, name: username.value
    })
    textarea.value = ''
}

function join() {
    const name = inputJoin.value
    if (name == '') return
    username.value = name
    boot()
}

function boot() {
    const name = username.value
    const welcome = document.querySelector('.welcome')
    welcome.innerHTML = `Welcome to chat, ${name}!`

    socket = io(window.location.href)
    socket.emit('join', name)

    socket.on('name-exist', info => {

        if (info.verify) {
            alert('This name already exists. Try again!')
            return
        }
        inputSocketid.value = info.socketid
        areaJoin.remove()
        socket.emit('logged', name)
    })
    socket.on('update-user', infos => {
        if (infos.length < 2) {
            chatArea.innerHTML = `
                <span class="no-people">No people online! Invite your friend to chat!</span>
            `
        } else {
            if (document.querySelector('.no-people')) document.querySelector('.no-people').remove()
        }

    })

    socket.on('load-message', info => loadMessage(info))

}

function loadMessage(info) {
    const { message, socketid, name } = info
    
    const classMe = inputSocketid.value == socketid ? 'send-me' : ''
    const nameMe = username.value == name ? 'Me' : name
    chatArea.innerHTML += `
        <div class="area-message ${classMe}">
            <div class="from">${nameMe}</div>
            <div class="message">${message}</div>                
        </div>
    `
}