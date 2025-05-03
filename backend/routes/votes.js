const express = require('express');
const router = express.Router();

const Vote = require('../models/Vote');
const User = require('../models/User'); // If you're using this elsewhere, keep it

// ✅ Cast a vote - POST /api/votes
router.post('/', async (req, res) => {
  const { voterId, candidate } = req.body;

  // 🧪 Debug log
  console.log('Vote submission received:', { voterId, candidate });

  try {
    // Check if the voter already voted
    const existingVote = await Vote.findOne({ voterId });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted.' });
    }

    // Create and save new vote
    const newVote = await Vote.create({ voterId, candidate });

    // 📝 Log the saved vote
    console.log('Vote saved:', newVote);

    res.status(201).json({ success: true, data: newVote });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ✅ Get voting results - GET /api/votes/results
router.get('/results', async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $group: {
          _id: '$candidate',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
});

module.exports = router;
