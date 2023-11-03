class QuizGame {
    constructor() {
      this.players = {};
      this.questions = [...]; // Add your questions here
      this.currentQuestionIndex = 0;
      this.inProgress = false;
    }
  
    addPlayer(playerId, playerName) {
      this.players[playerId] = { name: playerName, score: 0 };
    }
  
    startGame() {
      this.inProgress = true;
      this.currentQuestionIndex = 0;
      // Reset scores if needed
      for (const player of Object.values(this.players)) {
        player.score = 0;
      }
      this.sendNextQuestion();
    }
  
    sendNextQuestion() {
      const question = this.questions[this.currentQuestionIndex];
      // Emit event to send question to all players
      io.emit('question', question);
    }
  
    receiveAnswer(playerId, answer) {
      const correctAnswer = this.questions[this.currentQuestionIndex].correct;
      if (answer === correctAnswer) {
        this.players[playerId].score++;
        // Emit event for correct answer
        io.emit('correct answer', { playerId, playerName: this.players[playerId].name });
      }
      // Move to next question or end game if it was the last question
      if (this.currentQuestionIndex === this.questions.length - 1) {
        this.endGame();
      } else {
        this.currentQuestionIndex++;
        this.sendNextQuestion();
      }
    }
  
    endGame() {
      this.inProgress = false;
      // Emit event to end the game and send final scores
      io.emit('end game', this.players);
    }
  }
  
  module.exports = QuizGame;
  