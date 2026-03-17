const { sequelize } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

syncDatabase();
