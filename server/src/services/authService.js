const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const registerUser = async (userData) => {
  const { name, email, password, role, department, studentId, batch, phone } = userData;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    department: department || null,
    studentId: studentId || '',
    batch: batch || '2023-2027',
    phone: phone || '',
    lastLogin: new Date()
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      batch: user.batch,
      phone: user.phone,
      avatar: user.avatar
    },
    token
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      departmentName: user.departmentName,
      studentId: user.studentId,
      batch: user.batch,
      phone: user.phone,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    },
    token
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).populate('department', 'name code location color icon');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'phone', 'batch', 'avatar'];
  const sanitized = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) sanitized[field] = updateData[field];
  });

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true
  });
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
