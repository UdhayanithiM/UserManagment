const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const mongoose = require('mongoose');


const router = express.Router();

// Validation middleware
const validateUser = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error('Email already in use');
    }),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1-120'),
  body('university').optional().trim().isLength({ max: 100 })
    .withMessage('University name cannot exceed 100 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL')
    .default('https://via.placeholder.com/150')
];

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create new user
router.post('/', validateUser, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  try {
    const newUser = await User.create(req.body);
    
    // Return user data without sensitive information
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Email address already exists'
      });
    }
    throw error;
  }
}));

// Get all users (with pagination)
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, count] = await Promise.all([
    User.find().select('-password -__v').skip(skip).limit(limit).lean(),
    User.countDocuments()
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    }
  });
}));

// Get single user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user ID format' 
    });
  }

  const user = await User.findById(req.params.id).select('-password -__v');
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({ 
    success: true, 
    data: user 
  });
}));

// Update user
router.put('/:id', validateUser, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user ID format' 
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  // Don't allow password updates via this endpoint
  if (req.body.password) {
    delete req.body.password;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { 
      new: true,
      runValidators: true 
    }
  ).select('-password -__v');

  if (!updatedUser) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({ 
    success: true, 
    data: updatedUser 
  });
}));

// Delete user
router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user ID format' 
    });
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({ 
    success: true, 
    data: { id: deletedUser._id } 
  });
}));

module.exports = router;