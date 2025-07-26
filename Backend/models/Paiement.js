const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datePaiement: {
    type: Date,
    default: Date.now
  },
  montant: {
    type: Number,
    required: true
  },
  methode: {
    type: String,
    enum: ['carte', 'paypal', 'Espèces'],
    required: true
  },
  statut: {
    type: String,
    enum: ['en attente', 'réussi', 'échoué'],
    default: 'en attente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paiement', paiementSchema);
