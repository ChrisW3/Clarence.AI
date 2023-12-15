document.addEventListener('DOMContentLoaded', function() {    
    document.querySelector('#submitButton').addEventListener('click', () => clarenceConvo());
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

    //display_view(view);
    
}

function clarenceConvo() {
    const questionContent = document.querySelector('#questionContent').value;
  
    fetch('/clarenceConvo', {
      method: 'POST',
      body: JSON.stringify({
        questionContent: questionContent,
      })
    })
    .then(response => response.json())
    .then(messages => {
        const chatElement = document.createElement('div');
        document.querySelector('#chatDisplay').innerHTML = ''; 

        messages.forEach(message => {
            var chatElementTemp = document.createElement('li');
            chatElementTemp.className = 'chatLine';
            chatElementTemp.textContent = message;
            chatElement.appendChild(chatElementTemp);
        }); 
        
        document.querySelector('#chatDisplay').append(chatElement); 
    });
  
    document.querySelector('#questionContent').value = "";
    load_view('default');

    return false;
}
