const mongoose = require('mongoose');

const lignePanierSchema = new mongoose.Schema({
  panier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panier',
    required: true
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  prix_unitaire: { type: Number, required: true },
});

module.exports = mongoose.model('LignePanier', lignePanierSchema);
