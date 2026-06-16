const express = require('express');
const { User, Store, Rating, sequelize } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// System Administrator routes
router.get('/dashboard', authMiddleware, roleMiddleware(['System Administrator']), async (req, res) => {
  try {
    const userCount = await User.count();
    const storeCount = await Store.count();
    const ratingCount = await Rating.count();
    res.json({ userCount, storeCount, ratingCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware(['System Administrator']), async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, address, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authMiddleware, roleMiddleware(['System Administrator']), async (req, res) => {
  try {
    const { search, role, sortBy, order } = req.query;
    const queryOptions = { where: {} };

    if (search) {
      queryOptions.where = {
        ...queryOptions.where,
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.like]: `%${search}%` } },
          { email: { [sequelize.Op.like]: `%${search}%` } },
          { address: { [sequelize.Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (role) {
      queryOptions.where.role = role;
    }

    if (sortBy) {
      queryOptions.order = [[sortBy, order || 'ASC']];
    }

    const users = await User.findAll({
      ...queryOptions,
      attributes: { exclude: ['password'] }
    });

    // We also need to fetch average ratings for Store Owners
    const usersWithRatings = await Promise.all(users.map(async (user) => {
      let avgRating = null;
      if (user.role === 'Store Owner') {
        const stores = await Store.findAll({ where: { ownerId: user.id } });
        const storeIds = stores.map(s => s.id);
        if (storeIds.length > 0) {
          const ratings = await Rating.findAll({ where: { storeId: storeIds } });
          if (ratings.length > 0) {
            avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
          }
        }
      }
      return { ...user.toJSON(), avgRating };
    }));

    res.json(usersWithRatings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Any logged-in user can update their password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!re.test(newPassword)) {
      return res.status(400).json({ error: 'Password does not meet requirements' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: req.user.id } });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
