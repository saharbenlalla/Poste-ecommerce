const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lignes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LignePanier' }],
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Panier", panierSchema);
