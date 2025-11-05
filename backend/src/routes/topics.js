const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Tutorial = require('../models/Tutorial');
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

// Get all topics with tutorials
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    
    // Get tutorials for each topic
    const topicsWithTutorials = await Promise.all(
      topics.map(async (topic) => {
        const tutorials = await Tutorial.find({ topic: topic._id })
          .populate('topic', 'title description')
          .sort({ order: 1 });
        
        return {
          ...topic.toObject(),
          tutorials: tutorials.map(tut => ({
            id: tut._id,
            title: tut.title,
            difficulty: tut.difficulty || 'Beginner',
            description: tut.description,
            content: tut.content,
            sampleCode: tut.sampleCode
          }))
        };
      })
    );
    
    res.json(topicsWithTutorials);
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single topic with full tutorial content
router.get('/:id/tutorials', async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ topic: req.params.id })
      .populate('topic')
      .sort({ order: 1 });
    
    res.json(tutorials);
  } catch (err) {
    console.error('Error fetching topic tutorials:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create topic (admin)
router.post('/', auth, roles(['admin']), async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const topic = new Topic({ title, description, order });
    await topic.save();
    res.json(topic);
  } catch (err) {
    console.error('Error creating topic:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;