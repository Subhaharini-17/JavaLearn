const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// class report
router.get('/class/:className', auth, roles(['admin']), async (req, res) => {
  const cls = req.params.className;
  const students = await User.find({ class: cls, role: 'student' }).select('_id name email class');
  const studentIds = students.map(s => s._id);
  const submissions = await Submission.find({ user: { $in: studentIds } });
  res.json({ students, submissions });
});

// student report
router.get('/student/:studentId', auth, roles(['admin']), async (req, res) => {
  const uid = req.params.studentId;
  const student = await User.findById(uid).select('-passwordHash');
  if (!student) return res.status(404).json({ msg: 'Student not found' });
  const submissions = await Submission.find({ user: uid }).sort({ createdAt: -1 });
  res.json({ student, submissions });
});

module.exports = router;
