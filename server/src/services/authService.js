const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email already registered');

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid email or password');

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin };
};

module.exports = { register, login, getProfile, generateToken };
