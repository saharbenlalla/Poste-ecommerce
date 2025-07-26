const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lignes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LigneCommande' }],
    dateCommande: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ["en attente", "confirmée", "expédiée", "livrée", "annulée", "payée"],
      default: "en attente",
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Commande", commandeSchema);
