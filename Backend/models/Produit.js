const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' },
  image: { type: String, required: true } 
}, {
  timestamps: true 
});

module.exports = mongoose.model('Produit', produitSchema);
