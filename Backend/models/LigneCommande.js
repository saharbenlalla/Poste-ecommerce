const mongoose = require('mongoose');

const ligneCommandeSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
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
  prix_unitaire: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LigneCommande', ligneCommandeSchema);
