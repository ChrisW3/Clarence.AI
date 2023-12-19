document.addEventListener('DOMContentLoaded', function() {    
    document.querySelector('#submitButton').addEventListener('click', (event) => clarenceConvo(event, 'submit'));
    document.querySelector('#sendButton').addEventListener('click', (event) => clarenceConvo(event, 'send'));

    const observer = new MutationObserver(scrollBottomOfChatBox);
    const chatbox = document.querySelector('#chatBox');
    if (chatbox) {
        observer.observe(chatbox, { childList: true });
    } else {
        console.error('Chatbox not found');
    }

    load_view('default');
});

function scrollBottomOfChatBox() {
    console.log('here');
    const chatBox = document.querySelector('#chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
}

function setupDefaultButton() {
    document.addEventListener('keydown', submitButtonEvent);
    document.removeEventListener('keydown', sendButtonEvent);
}

function setupChatButton() {
    document.removeEventListener('keydown', submitButtonEvent);
    document.addEventListener('keydown', sendButtonEvent);
}

function submitButtonEvent(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('#submitButton').click();
    }
}

function sendButtonEvent(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('#sendButton').click();
    }
}

function load_view(view) {
  
    if(view === 'default') {
        document.querySelector('#default-view').style.display = 'block';
        document.querySelector('#chat-view').style.display = 'none';
        setupDefaultButton(); 
        document.querySelector('#questionContent').focus();
    } else if(view == 'chat') {
        document.querySelector('#default-view').style.display = 'none';
        document.querySelector('#chat-view').style.display = 'block';
        setupChatButton();
        document.querySelector('#messageContent').focus();
    } else {
        document.querySelector('#post-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'none';
    }
    
}

function typeMessage(message, element) {
    let i = 0;
    const typingSpeed = 25;

    function typing() {
        if (i < message.length) {
            element.textContent += message.charAt(i);
            i++;
            scrollBottomOfChatBox();
            setTimeout(typing, typingSpeed);
        }
    }

    typing();
}

function clarenceConvo(event, messageType) {

    if(messageType === 'submit') {
        var content = document.querySelector('#questionContent').value;
        if (content === "") {
            console.log('error: Cannot send empty message (default)');
            load_view('default');
            return false;    
        }
    } else {
        var content = document.querySelector('#messageContent').value;
        if(content === "") {
            console.log('error: Cannot send empty message (chatbox)');
            load_view('chat');
            return false;
        }
    }
        
    load_view('chat');

    document.querySelector('#questionContent').value = '';
    document.querySelector('#messageContent').value = ''; 
    document.querySelector('#questionContent').focus();
    document.querySelector('#messageContent').focus();

    const userChatElement = document.createElement('div');
    const userChatTextElement = document.createElement('div');
    userChatElement.className = 'row justify-content-end userChatLine';
    userChatTextElement.className = 'chatTextContent';
    userChatTextElement.textContent = content;
    userChatElement.appendChild(userChatTextElement);
    document.querySelector('#chatBox').append(userChatElement); 

    setTimeout(() => {
        var clarenceChatElement = document.createElement('div');
        clarenceChatElement.className = 'row jusify-content-start clarenceChatLine';
        var clarenceChatTextElement = document.createElement('div');
        clarenceChatTextElement.id = 'chatTextId';
        clarenceChatTextElement.className = 'chatTextContent';
        clarenceChatElement.appendChild(clarenceChatTextElement);
        document.querySelector('#chatBox').append(clarenceChatElement);
        typeMessage("Clarence is Thinking...", clarenceChatTextElement);
    }, 1500);

    fetch('/clarenceConvo', {
      method: 'POST',
      body: JSON.stringify({
        questionContent: content,
      })
    })
    .then(response => response.json())
    .then(data => {

        var newClarenceTextElement = document.querySelector('#chatTextId');
        newClarenceTextElement.textContent = '';
        typeMessage(data, newClarenceTextElement);
        newClarenceTextElement.id = '';
        
    });
  

    document.querySelector('#questionContent').value = '';
    document.querySelector('#messageContent').value = '';

    return false;
}
