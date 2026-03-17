const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Employee, as: 'employee' }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        employee: user.employee ? {
          id: user.employee.id,
          first_name: user.employee.first_name,
          last_name: user.employee.last_name,
          email: user.employee.email,
          department_id: user.employee.department_id
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Employee, as: 'employee' }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
