const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const mongoose = require('mongoose');

const validateUser = [
  body('firstName').trim().escape().notEmpty().withMessage('First name is required'),
  body('lastName').trim().escape().notEmpty().withMessage('Last name is required'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email format'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('age').optional().isInt({ min: 5, max: 120 }).withMessage('Age must be between 5 and 120'),
  body('university').optional().trim().escape(),
  body('image').optional().isURL().withMessage('Image must be a valid URL')
];

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all users with pagination (fixed query sanitization)
router.get('/', asyncHandler(async (req, res) => {
  const cleanQuery = { ...req.query }; // Create a new object instead of modifying req.query
  const page = parseInt(cleanQuery.page) || 1;
  const limit = parseInt(cleanQuery.limit) || 10;
  const skip = (page - 1) * limit;
  
  const [users, count] = await Promise.all([
    User.find().skip(skip).limit(limit).lean(),
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

// GET one user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  res.json({ success: true, data: user });
}));

// POST create a new user
router.post('/', validateUser, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      })) 
    });
  }

  const newUser = new User(req.body);
  const savedUser = await newUser.save();
  
  res.status(201).json({ success: true, data: savedUser });
}));

// PUT update an existing user
router.put('/:id', validateUser, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      })) 
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  );
  
  if (!updatedUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  res.json({ success: true, data: updatedUser });
}));

// DELETE a user
router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  res.json({ success: true, data: { id: deletedUser._id } });
}));

module.exports = router;