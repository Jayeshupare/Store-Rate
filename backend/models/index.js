const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Attempt to connect to PostgreSQL. If no connection string is provided, use sqlite for local dev to avoid crashing
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:database.sqlite', {
  dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
  logging: false,
});

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 60]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400]
    }
  },
  role: {
    type: DataTypes.ENUM('System Administrator', 'Normal User', 'Store Owner'),
    allowNull: false,
    defaultValue: 'Normal User'
  }
});

const Store = sequelize.define('Store', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

const Rating = sequelize.define('Rating', {
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }
});

// Relationships
User.hasMany(Store, { foreignKey: 'ownerId', as: 'ownedStores' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });

Store.hasMany(Rating, { foreignKey: 'storeId' });
Rating.belongsTo(Store, { foreignKey: 'storeId' });

module.exports = { sequelize, User, Store, Rating };
