// routes/progress.js - UPDATED TO SYNC BOTH ARRAYS
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const auth = require('../middlewares/auth');

// ----------------------
// 🧩 Get progress for logged-in user
// ----------------------
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Ensure progress has proper structure
    if (!user.progress) {
      user.progress = {
        totalTutorials: 0,
        completedTutorials: [],
        completionPercentage: 0
      };
    }

    // Fix: If completedTutorials is a number, convert to array
    if (typeof user.progress.completedTutorials === 'number') {
      user.progress.completedTutorials = [];
      await user.save();
    }

    const totalTutorials = await Tutorial.countDocuments();
    const completedCount = Array.isArray(user.progress.completedTutorials) 
      ? user.progress.completedTutorials.length 
      : 0;
    
    const completionPercentage = totalTutorials > 0 
      ? (completedCount / totalTutorials) * 100 
      : 0;

    res.json({
      progress: {
        totalTutorials,
        completedTutorials: Array.isArray(user.progress.completedTutorials) 
          ? user.progress.completedTutorials.map(id => id.toString()) 
          : [],
        completedTutorialsCount: completedCount,
        completionPercentage
      }
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ msg: 'Server error fetching progress' });
  }
});

// ----------------------
// 🧩 Mark tutorial as complete - UPDATED TO SYNC BOTH ARRAYS
// ----------------------
router.post('/complete', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const { tutorialId } = req.body;
    
    if (!tutorialId) {
      return res.status(400).json({ msg: 'Tutorial ID is required' });
    }

    // Validate tutorialId
    if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
      return res.status(400).json({ msg: 'Invalid tutorial ID format' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Convert to ObjectId
    const tutorialObjectId = new mongoose.Types.ObjectId(tutorialId);

    // Verify tutorial exists
    const tutorialExists = await Tutorial.findById(tutorialObjectId);
    if (!tutorialExists) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }

    // Initialize progress if needed
    if (!user.progress) {
      user.progress = {
        totalTutorials: 0,
        completedTutorials: [],
        completionPercentage: 0
      };
    }

    // FIX: Ensure completedTutorials is an array (not a number)
    if (typeof user.progress.completedTutorials === 'number') {
      user.progress.completedTutorials = [];
    }

    if (!Array.isArray(user.progress.completedTutorials)) {
      user.progress.completedTutorials = [];
    }

    // Ensure legacy completedTutorials is an array
    if (!Array.isArray(user.completedTutorials)) {
      user.completedTutorials = [];
    }

    // Check if already completed in progress array
    const isAlreadyCompletedInProgress = user.progress.completedTutorials.some(
      completedId => completedId.toString() === tutorialObjectId.toString()
    );

    // Check if already completed in legacy array
    const isAlreadyCompletedInLegacy = user.completedTutorials.some(
      ct => {
        try {
          const tutorialRef = ct.tutorial || ct;
          return tutorialRef.toString() === tutorialObjectId.toString();
        } catch (error) {
          return false;
        }
      }
    );

    let wasAdded = false;

    if (!isAlreadyCompletedInProgress) {
      // Add to progress.completedTutorials
      user.progress.completedTutorials.push(tutorialObjectId);
      wasAdded = true;
    }

    if (!isAlreadyCompletedInLegacy) {
      // Add to legacy completedTutorials
      user.completedTutorials.push({
        tutorial: tutorialObjectId,
        completedAt: new Date()
      });
      wasAdded = true;
    }

    if (wasAdded) {
      // Update progress stats
      const totalTutorials = await Tutorial.countDocuments();
      user.progress.totalTutorials = totalTutorials;
      user.progress.completionPercentage = totalTutorials > 0
        ? (user.progress.completedTutorials.length / totalTutorials) * 100
        : 0;

      await user.save();
      // In the mark tutorial as complete route - Add this after user.save()
await ActivityLog.logActivity(
  userId,
  'completed',
  `tutorial: ${tutorialExists.title}`,
  'tutorial',
  { 
    tutorialId: tutorialExists._id,
    tutorialTitle: tutorialExists.title,
    progress: {
      completedCount: user.progress.completedTutorials.length,
      totalTutorials: user.progress.totalTutorials,
      percentage: user.progress.completionPercentage
    }
  }
);
      
      console.log('✅ Tutorial marked complete for user:', user.email);
      console.log('📊 Progress updated:', {
        progressCompleted: user.progress.completedTutorials.length,
        legacyCompleted: user.completedTutorials.length
      });
    }

    res.json({
      success: true,
      msg: 'Tutorial marked complete',
      progress: {
        totalTutorials: user.progress.totalTutorials,
        completedTutorials: user.progress.completedTutorials.map(id => id.toString()),
        completedTutorialsCount: user.progress.completedTutorials.length,
        completionPercentage: user.progress.completionPercentage,
      },
      legacyCompletedCount: user.completedTutorials.length
    });
  } catch (err) {
    console.error('Mark complete error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error updating progress',
      error: err.message 
    });
  }
});

module.exports = router;