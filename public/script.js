const socket = io();

function startGame() {
    console.log('Starting game...');
    socket.emit('join game', socket.id);
    socket.emit('start game');
    document.getElementById('startButton').disabled = true;
}

function submitAnswer(answer) {
    socket.emit('answer', answer);
    document.querySelectorAll('.answer').forEach(button => button.disabled = true);
}

socket.on('question', question => {
    document.getElementById('question').innerText = question.text;
    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = ''; // Clear previous answers
    question.options.forEach(option => {
        let button = document.createElement('button');
        button.innerText = option;
        button.classList.add('answer');
        button.onclick = () => submitAnswer(option);
        answersElement.appendChild(button);
    });
});

socket.on('update scoreboard', players => {
    let playersElement = document.getElementById('players');
    playersElement.innerHTML = ''; // Clear previous scoreboard
    for (let playerId in players) {
        console.log(playerId);
        let player = players[playerId];
        let playerElement = document.createElement('div');
        playerElement.innerText = `${player.name}: ${player.score}`;
        playersElement.appendChild(playerElement);
        console.log(playerElement);
    }
});



socket.on('end game', finalScores => {
    alert('Game over! Final scores: ' + JSON.stringify(finalScores));
    document.getElementById('question').innerText = '';
    document.getElementById('answers').innerHTML = '';
    document.getElementById('startButton').disabled = false;
});

// Submit an answer
function submitAnswer(answer) {
    socket.emit('answer', answer);
    // Disable all answer buttons after submitting
    document.querySelectorAll('.answer').forEach(button => {
        button.disabled = true;
    });
}

// Display question and answers
socket.on('question', question => {
    document.getElementById('question').innerText = question.text;
    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = ''; // Clear previous answers
    question.options.forEach(option => {
        let button = document.createElement('button');
        button.innerText = option;
        button.classList.add('answer');
        button.onclick = () => submitAnswer(option);
        answersElement.appendChild(button);
    });
});


  
  