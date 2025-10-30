const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: Number
});

module.exports = mongoose.model('Topic', topicSchema);
