const socket = io();

// DOM Elements
const $formEl = document.querySelector('form');
const $inputEl = document.querySelector('#text-input');
const $buttonEl = document.querySelector('#submit-button');
const $locatiobtnEl = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// OPTIONS
// Parse query string.
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// autoscroll fn.
const autoScroll = () => {
  // New message element.
  const $newmessage = $messages.lastElementChild;

  // Height of the new message.
  const newMessageStyles = getComputedStyle($newmessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newmessageHeight = $newmessage.offsetHeight + newMessageMargin;

  // Visible height.
  const visibleHeight = $messages.offsetHeight;

  // Height of message container.
  const containerHeight = $messages.scrollHeight;

  // How far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newmessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
};

// receive/listen for "message" event emitted from server.
socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// listen for locationmessage event.
socket.on('locationMessage', (message) => {
  // console.log(message);
  const html = Mustache.render($locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// socket.on('sentMessage', (sentMessage) => {
//   console.log(sentMessage);
// });


// form submit event listener.
$formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  // disable the form.
  $buttonEl.setAttribute('disabled', 'disabled');

  // Emit sendMessage event to server.
  socket.emit('sendMessage', event.target.elements.message.value.trim(), (error) => {
    // enable form.
    $buttonEl.removeAttribute('disabled');
    // Clear input field.
    $inputEl.value = '';
    // focus inout field.
    $inputEl.focus();

    if(error) {
      return console.log(error);
    }
    console.log('The message was delivered');
  });
});

$locatiobtnEl.addEventListener('click', () => {
  // if browser does not support geolcation api.
  if(!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.')
  }

  // disable button.
  $locatiobtnEl.setAttribute('disabled', 'disabled');

  // get user location.
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    // emit sendLocation event to teh server.
    socket.emit('sendLocation', {
      latitude: position.coords.latitude, 
      longitude: position.coords.longitude
    }, () => {
      console.log('Location shared!');
      // enable button.
      $locatiobtnEl.removeAttribute('disabled');
    });
  });
});

// Emit join event.
socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error);
    location.href = '/'
  }
});

















/****************************************************************/

// // Receive event sent from server.
// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count);
// });

// // Click event handler for increment button.
// document.querySelector('#increment').addEventListener('click', () => {
//   // console.log('Clicked');
//   // send event back to the server.
//   socket.emit('increment');
// });