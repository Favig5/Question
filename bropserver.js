const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const questionPath = path.join(__dirname, "questions.json");
const answerPath = path.join(__dirname, "answers.json");

let questions = [];
let answers = {}; // ✅ Now an object grouped by username

// ✅ Load data safely
function loadJSONSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback));
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    fs.writeFileSync(filePath, JSON.stringify(fallback));
    return fallback;
  }
}

function saveQuestions(qs) {
  fs.writeFileSync(questionPath, JSON.stringify(qs, null, 2));
}

function saveAnswers(ans) {
  fs.writeFileSync(answerPath, JSON.stringify(ans, null, 2));
}

// ✅ Load initial data
questions = loadJSONSafe(questionPath, []);
answers = loadJSONSafe(answerPath, {}); // default is an object

// ✅ GET questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// ✅ POST new question
app.post('/api/questions', (req, res) => {
  const { username, question, choices, answer } = req.body;

  if (!username || !question || !Array.isArray(choices) || choices.length < 2 || !answer) {
    return res.status(400).json({ error: "Invalid question input." });
  }

  if (!choices.includes(answer)) {
    return res.status(400).json({ error: "Answer must be one of the choices." });
  }

  const newQuestion = {
    id: questions.length + 1,
    question,
    choices,
    answer,
    createdBy: username
  };

  questions.push(newQuestion);
  saveQuestions(questions);

  res.status(201).json({ success: true, data: newQuestion });
});

// ✅ POST submit answers (grouped by user)
app.post('/api/submit', (req, res) => {
  const submissions = req.body;

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return res.status(400).json({ message: "Invalid submission data." });
  }

  submissions.forEach(sub => {
    const { username, questionId, answer } = sub;
    if (!username || !questionId || !answer) return;

    const userAnswers = answers[username] || [];

    userAnswers.push({
      questionId,
      answer,
      submittedAt: new Date().toISOString()
    });

    answers[username] = userAnswers;
  });

  saveAnswers(answers);
  res.json({ message: "✅ Answers submitted successfully!" });
});

// ✅ GET answers
app.get('/api/answers', (req, res) => {
  res.json(answers);
});

// ✅ Homepage
app.get('/', (req, res) => {
  res.send('Questionnaire API is running.');
});

// ✅ Start server
app.listen(3000, () => {
  console.log(`✅ Server is running on http://localhost:3000`);
});
