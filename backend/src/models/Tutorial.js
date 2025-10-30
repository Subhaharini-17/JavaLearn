const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  description: String,
  content: String,
  sampleCode: String,
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  order: { type: Number, default: 0 },
  estimatedDuration: Number, // in minutes
  prerequisites: [String],
  learningObjectives: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tutorialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Tutorial', tutorialSchema);