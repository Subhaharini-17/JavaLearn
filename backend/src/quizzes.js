// const express = require('express');
// const router = express.Router();
// const Quiz = require('../models/Quiz');
// const auth = require('../middlewares/auth');
// const roles = require('../middlewares/roles');

// // list quizzes
// router.get('/', async (req, res) => {
//   const { topic } = req.query;
//   const q = {};
//   if (topic) q.topic = topic;
//   const items = await Quiz.find(q).populate('topic').sort({ createdAt: -1 });
//   res.json(items);
// });

// // create quiz (admin)
// router.post('/', auth, roles(['admin']), async (req, res) => {
//   const { topic, title, questions } = req.body;
//   const quiz = new Quiz({ topic, title, questions, createdBy: req.user._id });
//   await quiz.save();
  
//   res.json(quiz);
// });

// // submit answers and grade
// router.post('/:id/submit', auth, async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);
//   if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
//   const answers = req.body.answers || [];
//   let correct = 0;
//   quiz.questions.forEach((q, i) => { if (typeof answers[i] !== 'undefined' && answers[i] === q.answerIndex) correct++; });
//   const percent = Math.round((correct / quiz.questions.length) * 100);
//   const passed = percent === 100;
//   // NOTE: For brevity we do not create a separate QuizSubmission model here.
//   res.json({ score: percent, passed, correct, total: quiz.questions.length });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const ActivityLog = require('../models/activityLog'); // Add this
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// list quizzes
router.get('/', async (req, res) => {
  const { topic } = req.query;
  const q = {};
  if (topic) q.topic = topic;
  const items = await Quiz.find(q).populate('topic').sort({ createdAt: -1 });
  
  // Log quiz browsing activity
  if (req.user) {
    await ActivityLog.logActivity(
      req.user._id,
      'browsed',
      'quizzes',
      'quiz',
      { 
        topicFilter: topic,
        resultsCount: items.length
      }
    );
  }
  
  res.json(items);
});

// create quiz (admin)
router.post('/', auth, roles(['admin']), async (req, res) => {
  const { topic, title, questions } = req.body;
  const quiz = new Quiz({ topic, title, questions, createdBy: req.user._id });
  await quiz.save();
  
 // Add this to the quiz creation route after quiz.save()
await ActivityLog.logActivity(
  req.user._id,
  'created',
  `quiz: ${quiz.title}`,
  'quiz',
  { 
    quizId: quiz._id,
    quizTitle: quiz.title,
    questionsCount: questions.length,
    timeLimit: quiz.timeLimit,
    passingScore: quiz.passingScore
  }
);

// Add update and delete routes for quizzes with activity logging
router.put('/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Log quiz update activity
    await ActivityLog.logActivity(
      req.user._id,
      'updated',
      `quiz: ${quiz.title}`,
      'quiz',
      { 
        quizId: quiz._id,
        quizTitle: quiz.title,
        updatedFields: Object.keys(req.body)
      }
    );

    res.json({
      msg: 'Quiz updated successfully',
      quiz
    });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Log quiz deletion activity
    await ActivityLog.logActivity(
      req.user._id,
      'deleted',
      `quiz: ${quiz.title}`,
      'quiz',
      { 
        quizId: quiz._id,
        quizTitle: quiz.title,
        questionCount: quiz.questions?.length || 0
      }
    );

    await quiz.deleteOne();
    res.json({ msg: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
  
  res.json(quiz);
});

// submit answers and grade
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    const answers = req.body.answers || [];
    let correct = 0;
    quiz.questions.forEach((q, i) => { 
      if (typeof answers[i] !== 'undefined' && answers[i] === q.answerIndex) correct++; 
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    const passed = percent >= 70; // Assuming 70% passing score
    
    // Log quiz submission activity
    await ActivityLog.logActivity(
      req.user._id,
      'submitted',
      `quiz: ${quiz.title}`,
      'quiz',
      { 
        quizId: quiz._id,
        quizTitle: quiz.title,
        score: percent,
        passed: passed,
        correctAnswers: correct,
        totalQuestions: quiz.questions.length
      }
    );
    
    res.json({ 
      score: percent, 
      passed, 
      correct, 
      total: quiz.questions.length 
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add more quiz routes with activity logging...

module.exports = router;
