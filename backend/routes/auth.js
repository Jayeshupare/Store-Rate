const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

const validatePassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
  return re.test(password);
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (name.length < 10 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be between 10 and 60 characters.' });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must be max 400 characters.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be 8-16 characters, include one uppercase letter and one special character.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role && role === 'Store Owner' ? role : 'Normal User'; // Only normal user signup is explicitly mentioned, but we allow Store Owner to be created or maybe Admin adds them? Normal user should be able to sign up. Admin can add others.

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: userRole
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
