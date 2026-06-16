const express = require('express');
const { Rating } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Normal user submit rating
router.post('/', authMiddleware, roleMiddleware(['Normal User']), async (req, res) => {
  try {
    const { storeId, score } = req.body;
    
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existingRating = await Rating.findOne({ where: { storeId, userId: req.user.id } });
    if (existingRating) {
      existingRating.score = score;
      await existingRating.save();
      return res.json(existingRating);
    }

    const rating = await Rating.create({ storeId, userId: req.user.id, score });
    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware(['Normal User']), async (req, res) => {
  try {
    const { score } = req.body;
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const rating = await Rating.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!rating) return res.status(404).json({ error: 'Rating not found' });

    rating.score = score;
    await rating.save();
    res.json(rating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
