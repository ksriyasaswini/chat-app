// CLIENT
const socket = io()

const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message Element
    const $newMessage = $messages.lastElementChild

    // Height of the new msg
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message contaiber
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
 
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// socket.on('countUpdated', (count) =>{
//     console.log('Count updated')
//     console.log(count)
// })

// document.querySelector('#countinc').addEventListener('click', () => {
//     console.log('Clicked!!')
//     socket.emit('increment')
// })

socket.on('message', (msg) =>{
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(msg.createdAt).format('h:mm A'),
        message: msg.text,
        username: msg.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (url) => {
    //console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm A'),
        username: url.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    console.log(room)
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //const message = document.querySelector('input')

    //disable form 
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //re-enable it
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) { 
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocation.addEventListener('click', () => {
    
    if(!navigator.geolocation){
        return alert('Geo location is not supported')
    }
    //disable
    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        console.log(position.coords.latitude)
        console.log(position.coords.longitude)
        socket.emit('sendlocation', {latitude: position.coords.latitude, longitude:position.coords.longitude}, (ack) => {
            console.log('cords sent to server!!', ack)
            $sendLocation.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) { 
        alert(error)
        location.href = '/'
    }
})
