const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Categorie', categorieSchema);
