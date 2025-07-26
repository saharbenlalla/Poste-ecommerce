const Panier = require("../models/Panier");
const LignePanier = require("../models/LignePanier");
const Commande = require("../models/Commande");
const LigneCommande = require("../models/LigneCommande");
const Produit = require("../models/Produit");

const validerCommande = async (req, res) => {
  try {
    const userId = req.user.id;

    const panier = await Panier.findOne({ user: userId });
    if (!panier) return res.status(404).json({ message: "Panier non trouvé." });

    const lignesPanier = await LignePanier.find({
      panier: panier._id,
    }).populate("produit");
    if (lignesPanier.length === 0)
      return res.status(400).json({ message: "Votre panier est vide." });

    let total = 0;
    lignesPanier.forEach((ligne) => {
      total += ligne.produit.price * ligne.quantite;
    });

    const commande = await Commande.create({
      user: userId,
      total,
      statut: "en attente",
      lignes: [],
    });

    const ligneCommandeIds = [];
    for (const ligne of lignesPanier) {
      const ligneCommande = await LigneCommande.create({
        commande: commande._id,
        produit: ligne.produit._id,
        quantite: ligne.quantite,
        prix_unitaire: ligne.produit.price,
      });
      ligneCommandeIds.push(ligneCommande._id);
    }
    commande.lignes = ligneCommandeIds;
    await commande.save();
    await LignePanier.deleteMany({ panier: panier._id });
    panier.lignes = [];
    panier.total = 0;
    await panier.save();

    res.status(200).json({
      message: "Commande validée avec succès.",
      commandeId: commande._id,
      total,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de commande :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

const validerCommandeAdmin = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut: "validée" },
      { new: true }
    );
    if (!commande)
      return res.status(404).json({ message: "Commande non trouvée." });

    res.json(commande);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const annulerCommandeAdmin = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut: "annulée" },
      { new: true }
    );
    if (!commande)
      return res.status(404).json({ message: "Commande non trouvée." });

    res.json(commande);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate("user")
      .populate({
        path: "lignes",
        populate: {
          path: "produit",
          model: "Produit",
        },
      });

    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const annulerCommande = async (commandeId, userId, userRole) => {
  const commande = await Commande.findById(commandeId);

  if (!commande) {
    throw new Error("Commande introuvable.");
  }

  if (commande.utilisateur.toString() !== userId && userRole !== "admin") {
    throw new Error("Accès refusé. Vous ne pouvez pas annuler cette commande.");
  }

  if (commande.statut === "annulée" || commande.statut === "livrée") {
    throw new Error(`La commande est déjà ${commande.statut}.`);
  }

  commande.statut = "annulée";
  await commande.save();

  return { message: "Commande annulée avec succès." };
};

const creerCommande = async (req, res) => {
  try {
    const { produits, total } = req.body; // produits = [{produit, quantite, prix_unitaire}]
    const userId = req.user.id; // ou req.user._id selon ton middleware

    // 1. Créer la commande sans lignes pour l'instant
    const commande = await Commande.create({
      user: userId,
      total,
      statut: "en attente",
      lignes: [],
    });

    // 2. Créer les lignes de commande
    const lignesData = produits.map((p) => ({
      commande: commande._id,
      produit: p.produit,
      quantite: p.quantite,
      prix_unitaire: p.prix_unitaire,
    }));

    const lignes = await LigneCommande.insertMany(lignesData);

    // 3. Associer les lignes à la commande
    commande.lignes = lignes.map((l) => l._id);
    await commande.save();

    res.status(201).json({ message: "Commande créée avec succès", commande });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création", error: error.message });
  }
};
const getMesCommandes = async (req, res) => {
  try {
    const userId = req.user.id;

    const commandes = await Commande.find({ user: userId }).sort({
      dateCommande: -1,
    });

    const commandesAvecProduits = await Promise.all(
      commandes.map(async (commande) => {
        const lignes = await LigneCommande.find({
          commande: commande._id,
        }).populate("produit");
        return { ...commande.toObject(), produits: lignes };
      })
    );

    res.json(commandesAvecProduits);
  } catch (err) {
    console.error("Erreur récupération commandes:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = {
  creerCommande,
  getAllCommandes,
  annulerCommandeAdmin,
  validerCommandeAdmin,
  validerCommande,
  annulerCommande,
  getMesCommandes,
};
