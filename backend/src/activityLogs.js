const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/activityLog');
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// Get activity logs with pagination and filtering
router.get('/', auth, roles(['admin']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type, 
      userId, 
      action,
      startDate,
      endDate 
    } = req.query;
    
    const query = {};
    
    // Add filters
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (action) query.action = action;
    
    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const activityLogs = await ActivityLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ActivityLog.countDocuments(query);
    
    res.json({
      activityLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get activity stats
router.get('/stats', auth, roles(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Activity by type
    const activityByType = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Activity by action
    const activityByAction = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Daily activity
    const dailyActivity = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      activityByType,
      activityByAction,
      dailyActivity,
      period: `${days} days`
    });
  } catch (err) {
    console.error('Error fetching activity stats:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user-specific activity
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { userId } = req.params;
    
    // Check if user is requesting their own activity or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const activityLogs = await ActivityLog.find({ userId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ActivityLog.countDocuments({ userId });
    
    res.json({
      activityLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching user activity:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;