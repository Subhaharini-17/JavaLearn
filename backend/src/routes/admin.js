// src/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// ----------------------
// 🧩 Admin Stats
// ----------------------
// ----------------------
// 🧩 Admin Stats (Enhanced)
// ----------------------
router.get('/stats', auth, roles(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTutorials = await Tutorial.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await User.countDocuments({
      role: 'student',
      $or: [
        { 'completedTutorials.0': { $exists: true } },
        { lastActive: { $gte: thirtyDaysAgo } }
      ]
    });

    // Calculate recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Calculate completion rate
    const usersWithProgress = await User.countDocuments({
      'progress.completionPercentage': { $gt: 0 }
    });
    const completionRate = totalUsers > 0 ? Math.round((usersWithProgress / totalUsers) * 100) : 0;

    // Calculate average quiz score
    const quizSubmissions = await Submission.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' }
        }
      }
    ]);
    const averageQuizScore = quizSubmissions.length > 0 ? Math.round(quizSubmissions[0].averageScore) : 0;

    // Calculate total progress hours (estimated)
    const totalProgress = await User.aggregate([
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $ifNull: ['$progress.totalHours', 0] } }
        }
      }
    ]);
    const totalProgressHours = totalProgress.length > 0 ? Math.round(totalProgress[0].totalHours) : 0;

    // Weekly activity (users active in last 7 days)
    const weeklyActivity = await User.countDocuments({
      lastActive: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTutorials,
        totalQuizzes,
        activeStudents,
        recentRegistrations,
        completionRate,
        averageQuizScore,
        totalProgressHours,
        weeklyActivity
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching stats' });
  }
});

// ----------------------
// 🧩 Get Users with Pagination
// ----------------------
// ----------------------
// 🧩 Get Users with Enhanced Progress Data (FIXED)
// ----------------------
router.get('/users', auth, roles(['admin']), async (req, res) => {
  try {
    const { limit = 100, page = 1, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Get total tutorials count once
    const totalTutorialsCount = await Tutorial.countDocuments();

    // Enhance users with progress data (FIXED - no await in map)
    const enhancedUsers = users.map(user => {
      const completedCount = user.completedTutorials ? user.completedTutorials.length : 0;
      const completionPercentage = totalTutorialsCount > 0 
        ? Math.round((completedCount / totalTutorialsCount) * 100) 
        : 0;

      // Convert mongoose document to plain object
      const userObj = user.toObject ? user.toObject() : user;
      
      return {
        ...userObj,
        progress: {
          totalTutorials: totalTutorialsCount,
          completedTutorials: userObj.completedTutorials || [],
          completionPercentage: completionPercentage,
          averageScore: userObj.averageScore || 0,
          currentStreak: userObj.currentStreak || 0
        }
      };
    });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: enhancedUsers,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching users' });
  }
});

// ----------------------
// 🧩 Get Single User
// ----------------------
router.get('/users/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('completedTutorials.tutorial')
      .populate('progress.completedTutorials');

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching user' });
  }
});

// ----------------------
// 🧩 Create User (Admin)
// ----------------------
// ----------------------
// 🧩 Create User (Admin) - Return without password
// ----------------------
router.post('/users', auth, roles(['admin']), async (req, res) => {
  try {
    const { name, email, password, role, class: className, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password, // Plain text password
      role: role || 'student',
      class: className || '',
      department: department || '',
      year: year || ''
    });

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      department: user.department,
      year: user.year,
      progress: user.progress,
      completedTutorials: user.completedTutorials,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      data: userResponse,
      msg: 'User created successfully'
    });
  } catch (err) {
    console.error('Create user error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ success: false, msg: 'Email already exists' });
    }
    
    res.status(500).json({ success: false, msg: 'Server error creating user' });
  }
});

// ----------------------
// 🧩 Update User
// ----------------------
// ----------------------
// 🧩 Update User (WITH PASSWORD SUPPORT)
// ----------------------
router.put('/users/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const { name, email, role, password, class: className, department, year } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, msg: 'Email already taken by another user' });
      }
      user.email = email.toLowerCase().trim();
    }

    // Update basic fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (className) user.class = className;
    if (department) user.department = department;
    if (year) user.year = year;

    // ✅ IMPORTANT: Update password if provided (plain text)
    if (password && password.trim() !== '') {
      user.password = password; // Store as plain text
    }

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      department: user.department,
      year: user.year,
      progress: user.progress,
      completedTutorials: user.completedTutorials,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ 
      success: true, 
      data: userResponse, 
      msg: password ? 'User updated with new password' : 'User updated successfully' 
    });
  } catch (err) {
    console.error('Update user error:', err);
    
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ success: false, msg: 'Email already exists' });
    }
    
    res.status(500).json({ success: false, msg: 'Server error updating user' });
  }
});

// ----------------------
// 🧩 Delete User
// ----------------------
router.delete('/users/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, msg: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ success: true, msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, msg: 'Server error deleting user' });
  }
});

// ----------------------
// 🧩 Delete Tutorial
// ----------------------
router.delete('/tutorials/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ success: false, msg: 'Tutorial not found' });
    }

    await tutorial.deleteOne();
    res.json({ success: true, msg: 'Tutorial deleted successfully' });
  } catch (err) {
    console.error('Delete tutorial error:', err);
    res.status(500).json({ success: false, msg: 'Server error deleting tutorial' });
  }
});

// ----------------------
// 🧩 Delete Quiz
// ----------------------
router.delete('/quizzes/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, msg: 'Quiz not found' });
    }

    await quiz.deleteOne();
    res.json({ success: true, msg: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ success: false, msg: 'Server error deleting quiz' });
  }
});

// ----------------------
// 🧩 Get All Tutorials (Admin)
// ----------------------
router.get('/tutorials', auth, roles(['admin']), async (req, res) => {
  try {
    const { limit = 100, page = 1, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const tutorials = await Tutorial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Tutorial.countDocuments(query);

    res.json({
      success: true,
      data: {
        tutorials,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (err) {
    console.error('Get tutorials error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching tutorials' });
  }
});

// ----------------------
// 🧩 Get All Quizzes (Admin)
// ----------------------
router.get('/quizzes', auth, roles(['admin']), async (req, res) => {
  try {
    const { limit = 100, page = 1, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching quizzes' });
  }
});

// ----------------------
// 🧩 Enhanced Stats with More Data
// ----------------------
router.get('/stats', auth, roles(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTutorials = await Tutorial.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await User.countDocuments({
      role: 'student',
      $or: [
        { 'completedTutorials.0': { $exists: true } },
        { lastActive: { $gte: thirtyDaysAgo } }
      ]
    });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Calculate completion rate
    const usersWithProgress = await User.countDocuments({
      'completedTutorials.0': { $exists: true }
    });
    const completionRate = totalUsers > 0 ? Math.round((usersWithProgress / totalUsers) * 100) : 0;

    // Calculate average quiz score from submissions
    const quizSubmissions = await Submission.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' }
        }
      }
    ]);
    const averageQuizScore = quizSubmissions.length > 0 ? Math.round(quizSubmissions[0].averageScore || 0) : 0;

    // Weekly activity
    const weeklyActivity = await User.countDocuments({
      lastActive: { $gte: sevenDaysAgo }
    });

    // Total progress hours (estimated - 10 min per tutorial completion)
    const totalCompletedTutorials = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCompletions: { $sum: { $size: '$completedTutorials' } }
        }
      }
    ]);
    const totalProgressHours = totalCompletedTutorials.length > 0 
      ? Math.round((totalCompletedTutorials[0].totalCompletions * 10) / 60) 
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTutorials,
        totalQuizzes,
        activeStudents,
        recentRegistrations,
        completionRate,
        averageQuizScore,
        totalProgressHours,
        weeklyActivity
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching stats' });
  }
});

// ----------------------
// 🧩 Get Users with Enhanced Progress Data
// ----------------------
router.get('/users', auth, roles(['admin']), async (req, res) => {
  try {
    const { limit = 100, page = 1, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Get total tutorials count once
    const totalTutorialsCount = await Tutorial.countDocuments();

    // Enhance users with progress data
    const enhancedUsers = users.map(user => {
      const completedCount = user.completedTutorials ? user.completedTutorials.length : 0;
      const completionPercentage = totalTutorialsCount > 0 
        ? Math.round((completedCount / totalTutorialsCount) * 100) 
        : 0;

      return {
        ...user.toObject(),
        progress: {
          totalTutorials: totalTutorialsCount,
          completedTutorials: user.completedTutorials || [],
          completionPercentage: completionPercentage,
          averageScore: user.averageScore || 0,
          currentStreak: user.currentStreak || 0
        }
      };
    });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: enhancedUsers,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, msg: 'Server error fetching users' });
  }
});

module.exports = router;
