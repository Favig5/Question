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
let answers = {}; // CHANGED from [] to {} for user-based grouping

// Load questions from file
try {
  questions = JSON.parse(fs.readFileSync(questionPath));
} catch (err) {
  console.error("Error loading questions:", err);
}

// Load answers from file
try {
  answers = JSON.parse(fs.readFileSync(answerPath));
} catch (err) {
  console.error("Error loading answers:", err);
}

// ✅ GET all questions
app.get("/api/questions", (req, res) => {
  res.json(questions);
});

// ✅ GET all answers (now grouped by user)
app.get("/api/answers", (req, res) => {
  res.json(answers);
});

// ✅✅ POST a new answer and group it by userId
app.post("/api/answers", (req, res) => {
  const { userId, questionId, selectedOption } = req.body;

  // Dummy correct answers – you can replace this with actual logic later
  const correctAnswers = {
    q1: "B", q2: "A", q3: "C", q4: "D", q5: "B",
    q6: "A", q7: "C", q8: "D", q9: "A", q10: "B"
  };

  const isCorrect = selectedOption === correctAnswers[questionId];

  const newAnswer = {
    questionId,
    selectedOption,
    isCorrect,
    timestamp: new Date().toISOString()
  };

  // If user doesn't exist yet, create array
  if (!answers[userId]) {
    answers[userId] = [];
  }

  // Save answer under user
  answers[userId].push(newAnswer);

  // Write to file
  fs.writeFile(answerPath, JSON.stringify(answers, null, 2), (err) => {
    if (err) {
      console.error("Error saving answer:", err);
      return res.status(500).send("Failed to save answer.");
    }

    res.status(201).json({ message: "Answer saved.", isCorrect });
  });
});

// ✅ Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
