// models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // prevent multiple votes
  },
  candidate: {
    type: String,
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);
