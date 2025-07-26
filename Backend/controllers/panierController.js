const Panier = require("../models/Panier");
const LignePanier = require("../models/LignePanier");
const Produit = require("../models/Produit");

const addProduit = async (userId, produitId, quantite) => {
  const produit = await Produit.findById(produitId);
  if (!produit) {
    throw new Error("Produit non trouvé");
  }

  let panier = await Panier.findOne({ user: userId }).populate("lignes");

  if (!panier) {
    panier = new Panier({ user: userId, total: 0, lignes: [] });
  }

  let ligneExistante = null;
  if (panier.lignes && panier.lignes.length > 0) {
    ligneExistante = await LignePanier.findOne({
      panier: panier._id,
      produit: produitId,
    });
  }

  if (ligneExistante) {
    ligneExistante.quantite += quantite;
    await ligneExistante.save();
  } else {
    const nouvelleLigne = new LignePanier({
      panier: panier._id,
      produit: produitId,
      quantite: quantite,
      prix_unitaire: produit.price,
    });
    await nouvelleLigne.save();

    panier.lignes.push(nouvelleLigne._id);
  }
  const lignes = await LignePanier.find({ panier: panier._id });
  panier.total = lignes.reduce(
    (acc, ligne) => acc + ligne.quantite * ligne.prix_unitaire,
    0
  );

  await panier.save();

  return panier;
};
async function getPanier(userId) {
  const panier = await Panier.findOne({ user: userId })
    .populate({
      path: 'lignes',
      populate: {
        path: 'produit',
        model: 'Produit' // Assure-toi que ce modèle existe
      }
    });

  if (!panier) {
    return {
      lignes: [],
      total: 0,
      message: "Panier vide",
    };
  }

  return panier;
}
const retirerProduit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { produitId } = req.params;

    const panier = await Panier.findOne({ user: userId });
    if (!panier) return res.status(404).json({ message: "Panier non trouvé" });

    const ligne = await LignePanier.findOne({
      panier: panier._id,
      produit: produitId,
    });

    if (!ligne) return res.status(404).json({ message: "Produit non trouvé" });

    await LignePanier.deleteOne({ _id: ligne._id });

    panier.lignes = panier.lignes.filter(
      (id) => id.toString() !== ligne._id.toString()
    );

    const lignesRestantes = await LignePanier.find({ panier: panier._id });
    panier.total = lignesRestantes.reduce(
      (acc, l) => acc + l.quantite * l.prix_unitaire,
      0
    );

    await panier.save();

    res.status(200).json({ message: "Produit retiré", panier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
const viderPanier = async (userId) => {
  try {
    // Trouver le panier de l'utilisateur
    const panier = await Panier.findOne({ user: userId });

    if (!panier) {
      throw new Error("Aucun panier trouvé pour cet utilisateur.");
    }

    // Supprimer toutes les lignes du panier
    await LignePanier.deleteMany({ _id: { $in: panier.lignes } });

    // Vider les références dans le panier
    panier.lignes = [];
    panier.total = 0;

    // Sauvegarder les modifications
    await panier.save();

    return { success: true, message: "Panier vidé avec succès." };
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors du vidage du panier.");
  }
};


const calculerTotal = async (userId) => {
  const panier = await Panier.findOne({ user: userId });

  if (!panier) {
    throw new Error("Panier non trouvé");
  }

  const lignes = await LignePanier.find({ panier: panier._id });

  let total = 0;
  for (const ligne of lignes) {
    total += ligne.quantite * ligne.prix_unitaire;
  }

  panier.total = total;
  await panier.save();

  return total;
};

const modifierQuantiteProduit = async (req, res) => {
  const user = req.user; // récupéré via middleware d'authentification
  const produitId = req.params.produitId;
  const { quantite } = req.body;

  try {
    const userId = user._id?.toString() || user.id?.toString() || user;

    const panier = await Panier.findOne({ user: userId });
    if (!panier) return res.status(404).json({ message: "Panier non trouvé" });

    const ligne = await LignePanier.findOne({ panier: panier._id, produit: produitId });
    if (!ligne) return res.status(404).json({ message: "Produit non trouvé dans le panier" });

    if (quantite <= 0) {
      await LignePanier.deleteOne({ _id: ligne._id });
      panier.lignes = panier.lignes.filter(
        (id) => id.toString() !== ligne._id.toString()
      );
    } else {
      ligne.quantite = quantite;
      await ligne.save();
    }

    const lignesRestantes = await LignePanier.find({ panier: panier._id });
    panier.total = lignesRestantes.reduce(
      (acc, ligne) => acc + ligne.quantite * ligne.prix_unitaire,
      0
    );

    await panier.save();

    return res.status(200).json({ message: "Quantité mise à jour", panier });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la quantité:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = {
  modifierQuantiteProduit,
  getPanier,
  addProduit,
  retirerProduit,
  viderPanier,
  calculerTotal,
};
