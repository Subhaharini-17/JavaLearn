// const mongoose = require('mongoose');

// const submissionSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
//   code: String,
//   language: { type: String, enum: ['java','cpp','python'], default: 'java' },
//   saved: { type: Boolean, default: false },
//   result: {
//     stdout: String,
//     stderr: String,
//     exitCode: Number,
//     runTimeMs: Number
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Submission', submissionSchema);

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
  code: String,
  language: { type: String, enum: ['java','cpp','python'], default: 'java' },
  saved: { type: Boolean, default: false },
  result: {
    stdout: String,
    stderr: String,
    exitCode: Number,
    runTimeMs: Number
  },
  input: { type: String, default: '' }, // Added input field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);