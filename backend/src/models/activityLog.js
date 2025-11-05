const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'tutorial', 'quiz', 'system'],
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to log activity
activityLogSchema.statics.logActivity = async function(userId, action, target, type, details = {}) {
  try {
    await this.create({
      userId,
      action,
      target,
      type,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);