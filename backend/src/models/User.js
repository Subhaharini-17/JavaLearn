// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['student', 'admin'], default: 'student' },
//   class: { type: String },
//   department: { type: String },
//   year: { type: Number },
//   completedTutorials: [{ 
//     tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
//     completedAt: { type: Date, default: Date.now }
//   }],
//   progress: {
//     totalTutorials: { type: Number, default: 0 },
//     completedTutorials: { type: Number, default: 0 },
//     completionPercentage: { type: Number, default: 0 }
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// // Update progress when tutorials are completed
// UserSchema.methods.updateProgress = async function() {
//   const totalTutorials = await mongoose.model('Tutorial').countDocuments();
//   this.progress.totalTutorials = totalTutorials;
//   this.progress.completedTutorials = this.completedTutorials.length;
//   this.progress.completionPercentage = totalTutorials > 0 
//     ? Math.round((this.completedTutorials.length / totalTutorials) * 100) 
//     : 0;
//   await this.save();
// };

// module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  class: { type: String },
  department: { type: String },
  year: { type: Number },
  completedTutorials: [{ 
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    completedAt: { type: Date, default: Date.now }
  }],
  progress: {
    totalTutorials: { type: Number, default: 0 },
    completedTutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }], // ✅ Change to array
    completionPercentage: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Update progress when tutorials are completed
// In models/User.js - Update the updateProgress method
UserSchema.methods.updateProgress = async function() {
  const totalTutorials = await mongoose.model('Tutorial').countDocuments();
  
  // Sync the counts between both arrays
  const progressCompletedCount = Array.isArray(this.progress.completedTutorials) 
    ? this.progress.completedTutorials.length 
    : 0;
  
  const legacyCompletedCount = Array.isArray(this.completedTutorials) 
    ? this.completedTutorials.length 
    : 0;
  
  // Use the larger count to be safe
  const effectiveCompletedCount = Math.max(progressCompletedCount, legacyCompletedCount);
  
  this.progress.totalTutorials = totalTutorials;
  this.progress.completedTutorialsCount = effectiveCompletedCount;
  this.progress.completionPercentage = totalTutorials > 0 
    ? Math.round((effectiveCompletedCount / totalTutorials) * 100) 
    : 0;
    
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);