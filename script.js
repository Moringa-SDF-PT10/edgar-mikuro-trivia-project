let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
let timeLeft = 10;

const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const scoreDisplay = document.getElementById('score-display');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('toggle-theme');
const categorySelect = document.getElementById('category-select');
const startBtn = document.getElementById('start-btn');
const timerDisplay = document.getElementById('timer');

// Theme toggle
themeToggle.addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
});

//  Keyboard support (Enter)
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && nextBtn.style.display === "inline-block") {
    nextBtn.click();
  }
});

//  Start Game
startBtn.addEventListener("click", startGame);

function startGame() {
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  nextBtn.style.display = 'none';
  restartBtn.style.display = 'none';

  categorySelect.style.display = 'none';
  startBtn.style.display = 'none';

  const selectedCategory = categorySelect.value;
  let apiURL = `https://opentdb.com/api.php?amount=10&type=multiple`;
  if (selectedCategory) {
    apiURL += `&category=${selectedCategory}`;
  }

  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        questions = data.results;
        showQuestion();
      } else {
        useMockQuestions();
      }
    })
    .catch(err => {
      console.error("Trivia API Error", err);
      useMockQuestions();
    });
}

function useMockQuestions() {
  questions = [
    {
      question: "What is the capital of Kenya?",
      correct_answer: "Nairobi",
      incorrect_answers: ["Mombasa", "Kisumu", "Eldoret"]
    }
  ];
  showQuestion();
}

// Show Question and Start Timer
function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.innerHTML = decodeHTML(question.question);

  const answers = [...question.incorrect_answers];
  answers.splice(Math.floor(Math.random() * 4), 0, question.correct_answer);

  answersContainer.innerHTML = '';
  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = decodeHTML(answer);
    btn.addEventListener('click', () => {
      stopTimer();
      checkAnswer(btn, answer, question.correct_answer);
    });
    answersContainer.appendChild(btn);
  });

  startTimer();
}

// Answer Checking
function checkAnswer(button, selected, correct) {
  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === decodeHTML(correct)) {
      btn.classList.add('correct');
    } else if (btn.textContent === decodeHTML(selected)) {
      btn.classList.add('incorrect');
    }
  });

  if (selected === correct) score++;
  scoreDisplay.textContent = `Score: ${score}`;
  nextBtn.style.display = 'inline-block';
}

// Countdown Timer
function startTimer() {
  timeLeft = 10;
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      stopTimer();
      disableAnswersOnTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

// Time Ran Out: Show correct answer
function disableAnswersOnTimeout() {
  const correct = decodeHTML(questions[currentQuestionIndex].correct_answer);

  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add('correct');
    }
  });

  nextBtn.style.display = 'inline-block';
}

// Next Button Logic
nextBtn.addEventListener('click', () => {
  stopTimer();
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    nextBtn.style.display = 'none';
    showQuestion();
  } else {
    questionText.textContent = `Quiz Complete! You scored ${score} out of ${questions.length}.`;
    answersContainer.innerHTML = '';
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    timerDisplay.textContent = ''; // Clear timer
  }
});

// Restart Button Logic
restartBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  restartBtn.style.display = 'none';
  timerDisplay.textContent = '';
  questionText.textContent = "Select a category and start the game!";
  answersContainer.innerHTML = '';

  categorySelect.style.display = 'inline-block';
  startBtn.style.display = 'inline-block';
});

// HTML Entity Decoder
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
