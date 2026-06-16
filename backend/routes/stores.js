const express = require('express');
const { Store, Rating, User, sequelize } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// System admin can add stores
router.post('/', authMiddleware, roleMiddleware(['System Administrator']), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const store = await Store.create({ name, email, address, ownerId });
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin and Normal user can list stores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;
    
    // Using simple literal query for average rating to support SQLite/PostgreSQL easily
    const stores = await Store.findAll({
      include: [
        { model: Rating, attributes: [] },
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('Ratings.score')), 'averageRating']
        ]
      },
      group: ['Store.id'],
    });

    // Also get the user's submitted ratings
    let userRatings = [];
    if (req.user) {
      userRatings = await Rating.findAll({ where: { userId: req.user.id } });
    }

    let result = stores.map(store => {
      const plainStore = store.toJSON();
      const userRating = userRatings.find(r => r.storeId === store.id);
      return {
        ...plainStore,
        averageRating: plainStore.averageRating ? parseFloat(plainStore.averageRating).toFixed(2) : null,
        userRating: userRating ? userRating.score : null,
        userRatingId: userRating ? userRating.id : null
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchLower) || 
        s.address.toLowerCase().includes(searchLower)
      );
    }

    if (sortBy) {
      result.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        if (order === 'DESC') {
          return aVal > bVal ? -1 : 1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ratings for owner's store
router.get('/my-ratings', authMiddleware, roleMiddleware(['Store Owner']), async (req, res) => {
  try {
    const stores = await Store.findAll({ where: { ownerId: req.user.id } });
    const storeIds = stores.map(s => s.id);
    
    const ratings = await Rating.findAll({
      where: { storeId: storeIds },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
