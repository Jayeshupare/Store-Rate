const express = require('express');
const cors = require('cors');
const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(async () => {
  console.log('Database synced');
  
  // Create default admin user
  const adminExists = await User.findOne({ where: { email: 'admin@system.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123!', 10);
    await User.create({
      name: 'System Administrator Super User',
      email: 'admin@system.com',
      password: hashedPassword,
      address: 'System HQ',
      role: 'System Administrator'
    });
    console.log('Default admin created: admin@system.com / Admin@123!');
  }

  // Create default normal user
  const userExists = await User.findOne({ where: { email: 'user@example.com' } });
  if (!userExists) {
    const hashedPassword = await bcrypt.hash('User@123!', 10);
    await User.create({
      name: 'John Normal User',
      email: 'user@example.com',
      password: hashedPassword,
      address: '123 User Lane',
      role: 'Normal User'
    });
    console.log('Default normal user created: user@example.com / User@123!');
  }

  // Create default store owner
  let ownerUser = await User.findOne({ where: { email: 'owner@techsuper.com' } });
  if (!ownerUser) {
    const hashedPassword = await bcrypt.hash('Owner@123!', 10);
    ownerUser = await User.create({
      name: 'Tech Owner Joe',
      email: 'owner@techsuper.com',
      password: hashedPassword,
      address: '456 Owner Blvd',
      role: 'Store Owner'
    });
    console.log('Default store owner created: owner@techsuper.com / Owner@123!');
  }

  // Seed default stores if none exist
  const { Store, Rating } = require('./models');
  const storeCount = await Store.count();
  let firstStore, secondStore;
  if (storeCount === 0) {
    const stores = await Store.bulkCreate([
      { name: 'Tech Superstore', email: 'contact@techsuper.com', address: '100 Silicon Ave', ownerId: ownerUser.id },
      { name: 'Fresh Groceries', email: 'hello@freshgroceries.com', address: '400 Market St', ownerId: ownerUser.id },
      { name: 'Daily Coffee', email: 'brew@dailycoffee.com', address: '22 Bean Blvd', ownerId: null },
    ]);
    firstStore = stores[0];
    secondStore = stores[1];
    console.log('Default stores seeded.');
  } else {
    firstStore = await Store.findOne({ where: { email: 'contact@techsuper.com' } });
    secondStore = await Store.findOne({ where: { email: 'hello@freshgroceries.com' } });
  }

  // Seed default ratings so Admin dashboard shows average ratings
  const ratingCount = await Rating.count();
  if (ratingCount === 0 && firstStore && secondStore) {
    await Rating.bulkCreate([
      { storeId: firstStore.id, userId: userExists ? userExists.id : 2, score: 5 },
      { storeId: secondStore.id, userId: userExists ? userExists.id : 2, score: 4 },
    ]);
    console.log('Default ratings seeded.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database', err);
});
