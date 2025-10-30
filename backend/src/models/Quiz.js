const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  answerIndex: Number
});

const quizSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  title: String,
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
