// script.js

// LAYER: DATA
function getFlashcardData() {
  return [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "Which planet is known as the Red Planet?", answer: "Mars" },
    { question: "What is the largest ocean on Earth?", answer: "Pacific Ocean" },
    { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
    { question: "What chemical element has the symbol 'O'?", answer: "Oxygen" },
    { question: "How many continents are there on Earth?", answer: "7" },
    { question: "What is the hardest natural substance on Earth?", answer: "Diamond" },
    { question: "Which language has the most native speakers?", answer: "Mandarin Chinese" },
    { question: "What is the speed of light in a vacuum (approx.)?", answer: "300,000 km/s" },
    { question: "What is the smallest unit of life?", answer: "The Cell" }
  ];
}

// LAYER: LOGIC
function createGameLogic() {
  let deck = [...getFlashcardData()];
  let currentIndex = 0;
  let score = 0;
  let answeredCount = 0;
  let isFlipped = false;

  function getCurrentCard() {
    return deck[currentIndex];
  }

  function toggleFlip() {
    isFlipped = !isFlipped;
    return isFlipped;
  }

  function resetFlip() {
    isFlipped = false;
  }

  function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    currentIndex = 0;
    score = 0;
    answeredCount = 0;
    isFlipped = false;
  }

  function recordAnswer(isCorrect) {
    if (isCorrect) score++;
    answeredCount++;
    currentIndex = (currentIndex + 1) % deck.length;
    isFlipped = false;
  }

  function resetProgress() {
    score = 0;
    answeredCount = 0;
    currentIndex = 0;
    isFlipped = false;
  }

  function getStats() {
    return {
      score,
      answeredCount,
      total: deck.length,
      currentIndex,
      isFlipped
    };
  }

  return {
    getCurrentCard,
    toggleFlip,
    resetFlip,
    shuffleDeck,
    recordAnswer,
    resetProgress,
    getStats
  };
}

// LAYER: DISPLAY
function initDisplay() {
  const game = createGameLogic();

  const cardElement = document.getElementById("flashcard");
  const cardContainer = document.getElementById("card-container");
  const questionElement = document.getElementById("card-question");
  const answerElement = document.getElementById("card-answer");
  const scoreTextElement = document.getElementById("score-text");
  const progressFillElement = document.getElementById("progress-fill");
  const btnCorrect = document.getElementById("btn-correct");
  const btnIncorrect = document.getElementById("btn-incorrect");
  const btnShuffle = document.getElementById("btn-shuffle");
  const btnReset = document.getElementById("btn-reset");

  function render() {
    const card = game.getCurrentCard();
    const stats = game.getStats();

    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;

    if (stats.isFlipped) {
      cardElement.classList.add("flipped");
    } else {
      cardElement.classList.remove("flipped");
    }

    scoreTextElement.textContent = `Score: ${stats.score} / ${stats.answeredCount}`;
    
    const progressPercent = (stats.answeredCount / stats.total) * 100;
    progressFillElement.style.width = `${Math.min(progressPercent, 100)}%`;
  }

  cardContainer.addEventListener("click", () => {
    game.toggleFlip();
    render();
  });

  btnCorrect.addEventListener("click", () => {
    game.recordAnswer(true);
    render();
  });

  btnIncorrect.addEventListener("click", () => {
    game.recordAnswer(false);
    render();
  });

  btnShuffle.addEventListener("click", () => {
    game.shuffleDeck();
    render();
  });

  btnReset.addEventListener("click", () => {
    game.resetProgress();
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", initDisplay);
