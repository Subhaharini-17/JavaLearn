// const express = require('express');
// const router = express.Router();
// const Tutorial = require('../models/Tutorial');
// const Topic = require('../models/Topic');
// const auth = require('../middlewares/auth');
// const roles = require('../middlewares/roles');

// // Get all tutorials with pagination and filtering
// router.get('/', async (req, res) => {
//   try {
//     const { topic, page = 1, limit = 10, search } = req.query;
//     const query = {};
    
//     if (topic) query.topic = topic;
    
//     // Add search functionality
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { content: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     const tutorials = await Tutorial.find(query)
//       .populate('topic', 'title description')
//       .populate('createdBy', 'name email')
//       .sort({ order: 1, createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     const total = await Tutorial.countDocuments(query);
    
//     res.json({
//       tutorials,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total
//     });
//   } catch (err) {
//     console.error('Error fetching tutorials:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Get single tutorial by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const tutorial = await Tutorial.findById(req.params.id)
//       .populate('topic')
//       .populate('createdBy', 'name email');
    
//     if (!tutorial) {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
    
//     res.json({
//       id: tutorial._id,
//       title: tutorial.title,
//       description: tutorial.description,
//       content: tutorial.content,
//       sampleCode: tutorial.sampleCode,
//       topic: tutorial.topic,
//       difficulty: tutorial.difficulty || 'Beginner',
//       order: tutorial.order,
//       estimatedDuration: tutorial.estimatedDuration,
//       prerequisites: tutorial.prerequisites,
//       learningObjectives: tutorial.learningObjectives,
//       createdBy: tutorial.createdBy,
//       createdAt: tutorial.createdAt,
//       updatedAt: tutorial.updatedAt
//     });
//   } catch (err) {
//     console.error('Error fetching tutorial:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Create tutorial (admin)
// router.post('/', auth, roles(['admin']), async (req, res) => {
//   try {
//     const { 
//       topic, 
//       title, 
//       description, 
//       content, 
//       sampleCode, 
//       difficulty, 
//       order,
//       estimatedDuration,
//       prerequisites,
//       learningObjectives
//     } = req.body;
    
//     // Validate required fields
//     if (!title || !content || !topic) {
//       return res.status(400).json({ 
//         msg: 'Title, content, and topic are required fields' 
//       });
//     }
    
//     const tutorial = new Tutorial({
//       topic,
//       title,
//       description,
//       content,
//       sampleCode,
//       difficulty: difficulty || 'Beginner',
//       order: order || 0,
//       estimatedDuration: estimatedDuration || 30,
//       prerequisites: prerequisites || [],
//       learningObjectives: learningObjectives || [],
//       createdBy: req.user._id
//     });
    
//     await tutorial.save();
//     await tutorial.populate('topic');
//     await tutorial.populate('createdBy', 'name email');
    
//     res.status(201).json({
//       msg: 'Tutorial created successfully',
//       tutorial
//     });
//   } catch (err) {
//     console.error('Error creating tutorial:', err);
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ msg: err.message });
//     }
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Update tutorial (admin)
// router.put('/:id', auth, roles(['admin']), async (req, res) => {
//   try {
//     const { 
//       topic, 
//       title, 
//       description, 
//       content, 
//       sampleCode, 
//       difficulty, 
//       order,
//       estimatedDuration,
//       prerequisites,
//       learningObjectives
//     } = req.body;
    
//     // Build update object
//     const updateFields = {};
//     if (topic !== undefined) updateFields.topic = topic;
//     if (title !== undefined) updateFields.title = title;
//     if (description !== undefined) updateFields.description = description;
//     if (content !== undefined) updateFields.content = content;
//     if (sampleCode !== undefined) updateFields.sampleCode = sampleCode;
//     if (difficulty !== undefined) updateFields.difficulty = difficulty;
//     if (order !== undefined) updateFields.order = order;
//     if (estimatedDuration !== undefined) updateFields.estimatedDuration = estimatedDuration;
//     if (prerequisites !== undefined) updateFields.prerequisites = prerequisites;
//     if (learningObjectives !== undefined) updateFields.learningObjectives = learningObjectives;
    
//     const tutorial = await Tutorial.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     ).populate('topic').populate('createdBy', 'name email');
    
//     if (!tutorial) {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
    
//     res.json({
//       msg: 'Tutorial updated successfully',
//       tutorial
//     });
//   } catch (err) {
//     console.error('Error updating tutorial:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ msg: err.message });
//     }
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Partial update tutorial (admin) - PATCH
// router.patch('/:id', auth, roles(['admin']), async (req, res) => {
//   try {
//     const tutorial = await Tutorial.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     ).populate('topic').populate('createdBy', 'name email');
    
//     if (!tutorial) {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
    
//     res.json({
//       msg: 'Tutorial updated successfully',
//       tutorial
//     });
//   } catch (err) {
//     console.error('Error updating tutorial:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ msg: err.message });
//     }
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Delete tutorial (admin)
// router.delete('/:id', auth, roles(['admin']), async (req, res) => {
//   try {
//     const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    
//     if (!tutorial) {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
    
//     res.json({
//       msg: 'Tutorial deleted successfully',
//       tutorial: {
//         id: tutorial._id,
//         title: tutorial.title
//       }
//     });
//   } catch (err) {
//     console.error('Error deleting tutorial:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Tutorial not found' });
//     }
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Get tutorials by topic
// router.get('/topic/:topicId', async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const { topicId } = req.params;
    
//     const tutorials = await Tutorial.find({ topic: topicId })
//       .populate('topic')
//       .populate('createdBy', 'name email')
//       .sort({ order: 1, createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     const total = await Tutorial.countDocuments({ topic: topicId });
    
//     res.json({
//       tutorials,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total
//     });
//   } catch (err) {
//     console.error('Error fetching tutorials by topic:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Get tutorials count by difficulty
// router.get('/stats/difficulty', async (req, res) => {
//   try {
//     const stats = await Tutorial.aggregate([
//       {
//         $group: {
//           _id: '$difficulty',
//           count: { $sum: 1 }
//         }
//       }
//     ]);
    
//     res.json(stats);
//   } catch (err) {
//     console.error('Error fetching difficulty stats:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Search tutorials
// router.get('/search/:query', async (req, res) => {
//   try {
//     const { query } = req.params;
//     const { page = 1, limit = 10 } = req.query;
    
//     const searchQuery = {
//       $or: [
//         { title: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { content: { $regex: query, $options: 'i' } },
//         { sampleCode: { $regex: query, $options: 'i' } }
//       ]
//     };
    
//     const tutorials = await Tutorial.find(searchQuery)
//       .populate('topic')
//       .populate('createdBy', 'name email')
//       .sort({ order: 1, createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     const total = await Tutorial.countDocuments(searchQuery);
    
//     res.json({
//       tutorials,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total,
//       searchQuery: query
//     });
//   } catch (err) {
//     console.error('Error searching tutorials:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');
const Topic = require('../models/Topic');
const ActivityLog = require('../models/activityLog'); // Add this
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// Get all tutorials with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { topic, page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (topic) query.topic = topic;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tutorials = await Tutorial.find(query)
      .populate('topic', 'title description')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Tutorial.countDocuments(query);
    
    // Log activity for tutorial browsing
    if (req.user) {
      await ActivityLog.logActivity(
        req.user._id,
        'browsed',
        'tutorials',
        'tutorial',
        { 
          searchTerm: search,
          topicFilter: topic,
          page: parseInt(page),
          resultsCount: tutorials.length
        }
      );
    }
    
    res.json({
      tutorials,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching tutorials:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single tutorial by ID
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id)
      .populate('topic')
      .populate('createdBy', 'name email');
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Log tutorial view activity
    if (req.user) {
      await ActivityLog.logActivity(
        req.user._id,
        'viewed',
        `tutorial: ${tutorial.title}`,
        'tutorial',
        { 
          tutorialId: tutorial._id,
          tutorialTitle: tutorial.title,
          difficulty: tutorial.difficulty
        }
      );
    }
    
    res.json({
      id: tutorial._id,
      title: tutorial.title,
      description: tutorial.description,
      content: tutorial.content,
      sampleCode: tutorial.sampleCode,
      topic: tutorial.topic,
      difficulty: tutorial.difficulty || 'Beginner',
      order: tutorial.order,
      estimatedDuration: tutorial.estimatedDuration,
      prerequisites: tutorial.prerequisites,
      learningObjectives: tutorial.learningObjectives,
      createdBy: tutorial.createdBy,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt
    });
  } catch (err) {
    console.error('Error fetching tutorial:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create tutorial (admin)
router.post('/', auth, roles(['admin']), async (req, res) => {
  try {
    const { 
      topic, 
      title, 
      description, 
      content, 
      sampleCode, 
      difficulty, 
      order,
      estimatedDuration,
      prerequisites,
      learningObjectives
    } = req.body;
    
    // Validate required fields
    if (!title || !content || !topic) {
      return res.status(400).json({ 
        msg: 'Title, content, and topic are required fields' 
      });
    }
    
    const tutorial = new Tutorial({
      topic,
      title,
      description,
      content,
      sampleCode,
      difficulty: difficulty || 'Beginner',
      order: order || 0,
      estimatedDuration: estimatedDuration || 30,
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      createdBy: req.user._id
    });
    
    await tutorial.save();
    await tutorial.populate('topic');
    await tutorial.populate('createdBy', 'name email');
    
    // Log tutorial creation activity
    await ActivityLog.logActivity(
      req.user._id,
      'created',
      `tutorial: ${tutorial.title}`,
      'tutorial',
      { 
        tutorialId: tutorial._id,
        tutorialTitle: tutorial.title,
        difficulty: tutorial.difficulty
      }
    );
    
    res.status(201).json({
      msg: 'Tutorial created successfully',
      tutorial
    });
  } catch (err) {
    console.error('Error creating tutorial:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update tutorial (admin)
router.put('/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const { 
      topic, 
      title, 
      description, 
      content, 
      sampleCode, 
      difficulty, 
      order,
      estimatedDuration,
      prerequisites,
      learningObjectives
    } = req.body;
    
    // Build update object
    const updateFields = {};
    if (topic !== undefined) updateFields.topic = topic;
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (content !== undefined) updateFields.content = content;
    if (sampleCode !== undefined) updateFields.sampleCode = sampleCode;
    if (difficulty !== undefined) updateFields.difficulty = difficulty;
    if (order !== undefined) updateFields.order = order;
    if (estimatedDuration !== undefined) updateFields.estimatedDuration = estimatedDuration;
    if (prerequisites !== undefined) updateFields.prerequisites = prerequisites;
    if (learningObjectives !== undefined) updateFields.learningObjectives = learningObjectives;
    
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('topic').populate('createdBy', 'name email');
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Log tutorial update activity
    await ActivityLog.logActivity(
      req.user._id,
      'updated',
      `tutorial: ${tutorial.title}`,
      'tutorial',
      { 
        tutorialId: tutorial._id,
        tutorialTitle: tutorial.title,
        updatedFields: Object.keys(updateFields)
      }
    );
    
    res.json({
      msg: 'Tutorial updated successfully',
      tutorial
    });
  } catch (err) {
    console.error('Error updating tutorial:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete tutorial (admin)
router.delete('/:id', auth, roles(['admin']), async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Log tutorial deletion activity
    await ActivityLog.logActivity(
      req.user._id,
      'deleted',
      `tutorial: ${tutorial.title}`,
      'tutorial',
      { 
        tutorialId: tutorial._id,
        tutorialTitle: tutorial.title
      }
    );
    
    res.json({
      msg: 'Tutorial deleted successfully',
      tutorial: {
        id: tutorial._id,
        title: tutorial.title
      }
    });
  } catch (err) {
    console.error('Error deleting tutorial:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add more activity logging to other tutorial routes...

module.exports = router;