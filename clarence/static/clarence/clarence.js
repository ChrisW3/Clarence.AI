document.addEventListener('DOMContentLoaded', function() {    
    document.querySelector('#submitButton').addEventListener('click', () => clarenceConvo());
    document.querySelector('#sendButton').addEventListener('click', () => clarenceConvo());
    load_view('default');
});

function load_view(view) {
  
    if(view === 'default') {
        document.querySelector('#default-view').style.display = 'block';
        document.querySelector('#chat-view').style.display = 'none';
        
    } else if(view == 'chat') {
        document.querySelector('#default-view').style.display = 'none';
        document.querySelector('#chat-view').style.display = 'block';
    } else {
        document.querySelector('#post-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'none';
    }
    
}

function clarenceConvo() {
    var content = document.querySelector('#questionContent').value;
    if (content === "") {
        content = document.querySelector('#messageContent').value;
    }
        
    load_view('chat');

    const userChatElement = document.createElement('div');
    const userChatTextElement = document.createElement('div');
    userChatElement.className = 'row justify-content-end userChatLine';
    userChatTextElement.className = 'chatTextContent';
    userChatTextElement.textContent = content;
    userChatElement.appendChild(userChatTextElement);
    document.querySelector('#chatBox').append(userChatElement);

    fetch('/clarenceConvo', {
      method: 'POST',
      body: JSON.stringify({
        questionContent: content,
      })
    })
    .then(response => response.json())
    .then(data => {

        var clarenceChatElement = document.createElement('div');
        var clarenceChatTextElement = document.createElement('div');
        clarenceChatElement.className = 'row jusify-content-start clarenceChatLine';
        clarenceChatTextElement.className = 'chatTextContent';
        clarenceChatTextElement.textContent = data;
        clarenceChatElement.appendChild(clarenceChatTextElement);
        document.querySelector('#chatBox').append(clarenceChatElement);

    });
  
    document.querySelector('#questionContent').value = "";
    document.querySelector('#messageContent').value = "";

    return false;
}
