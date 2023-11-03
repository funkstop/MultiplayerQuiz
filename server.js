const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const { MongoClient } = require('mongodb');

const { Database } = require('quickmongo');
const db = new Database("mongodb+srv://cl-class:1Ha7YbXmi3Ia6sfS@cluster0.ox7so8q.mongodb.net/?retryWrites=true&w=majority");
db.on("ready", () => {  
    console.log("Database connected!");
} );
db.connect(); 


 async function getQuestionsFromDb() {
  try {
    await db.connect();
    console.log('waiting for db');
    const questions = await db.get("questions").then(qs => {
      let obj = { value: qs }
      console.log('got questions from db ');
      console.log(obj);
      return qs;
    }); // Assuming "questions" is the key where questions are stored
    console.log('got questions: '); 
    console.log(questions);
    return questions || [];
  } catch (e) {
    console.error('Failed to retrieve questions', e);
    return [];
  }
} 


// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Quiz game data and logic
const questions2 = [
  { text: "What is 2 + 2?", options: ['3', '4', '5', '6'], correct: '4' },
  { text: "What is the capital of France?", options: ['Paris', 'London', 'Berlin', 'Rome'], correct: 'Paris' },
  // Add more questions as needed
];

let players = {};
let currentQuestionIndex = 0;
let gameInProgress = false;
let questions = [];

  
// Handle socket connections
io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);

  socket.on('join game', (playerName) => {
    players[socket.id] = { name: playerName, score: 0 };
    console.log('joining game' + players);
    io.emit('update scoreboard', players);
  });

  socket.on('start game', async () => {
    if (!gameInProgress) {
      questions = await getQuestionsFromDb(); // Fetch questions from the database
      console.log('questions ' + questions);
      if (questions.length === 0) {
        console.log('no questions');
        socket.emit('no questions', 'No questions available in the database.');
        return;
      }
      gameInProgress = true;
      currentQuestionIndex = 0;
      for (let id in players) {
        players[id].score = 0; // Reset scores
      }
      sendQuestionToAll();
    }
  });


  socket.on('answer', (answer) => {
    if (gameInProgress) {
      console.log(socket.id);
      const player = players[socket.id];
      console.log("answer..." + player);
      if (player && questions[currentQuestionIndex].correct === answer) {
        player.score++;
        io.emit('update scoreboard', players);
        console.log(players);
      }
      nextQuestionOrEndGame();
    }
  });
  

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    delete players[socket.id];
    io.emit('update scoreboard', players);
  });
});

function sendQuestionToAll() {
  const question = questions[currentQuestionIndex];
  io.emit('question', { text: question.text, options: question.options });
}

function nextQuestionOrEndGame() {
  if (currentQuestionIndex >= questions.length - 1) {
    gameInProgress = false;
    io.emit('end game', players);
  } else {
    currentQuestionIndex++;
    sendQuestionToAll();
  }
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
