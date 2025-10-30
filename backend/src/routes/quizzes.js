const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// list quizzes
router.get('/', async (req, res) => {
  const { topic } = req.query;
  const q = {};
  if (topic) q.topic = topic;
  const items = await Quiz.find(q).populate('topic').sort({ createdAt: -1 });
  res.json(items);
});

// create quiz (admin)
router.post('/', auth, roles(['admin']), async (req, res) => {
  const { topic, title, questions } = req.body;
  const quiz = new Quiz({ topic, title, questions, createdBy: req.user._id });
  await quiz.save();
  res.json(quiz);
});

// submit answers and grade
router.post('/:id/submit', auth, async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
  const answers = req.body.answers || [];
  let correct = 0;
  quiz.questions.forEach((q, i) => { if (typeof answers[i] !== 'undefined' && answers[i] === q.answerIndex) correct++; });
  const percent = Math.round((correct / quiz.questions.length) * 100);
  const passed = percent === 100;
  // NOTE: For brevity we do not create a separate QuizSubmission model here.
  res.json({ score: percent, passed, correct, total: quiz.questions.length });
});

module.exports = router;
