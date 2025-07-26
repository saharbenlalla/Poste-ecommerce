const Produit = require('../models/Produit');

const createProduit = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Vérifie si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "L'image est requise." });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Validation rapide
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const produit = new Produit({
      name,
      description,
      price,
      stock,
      category,
      image: imagePath,
    });

    await produit.save();
    res.status(201).json({ message: "Produit créé avec succès", produit });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateProduit = async (req, res) => {
  const produitId = req.params.id;
  const { name, description, price, stock } = req.body;

  try {
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // Mise à jour des champs
    produit.name = name || produit.name;
    produit.description = description || produit.description;
    produit.price = price || produit.price;
    produit.stock = stock || produit.stock;

    // Si une nouvelle image est uploadée
    if (req.file) {
      produit.image = `/uploads/${req.file.filename}`;
    }

    const produitMisAJour = await produit.save();

    res.status(200).json({
      message: '✅ Produit mis à jour avec succès.',
      produit: produitMisAJour
    });
  } catch (err) {
    console.error('❌ Erreur updateProduit :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
const getProduitByID = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findById(produitId).populate('category');

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    res.status(200).json(produit);
  } catch (err) {
    console.error("Erreur lors de la récupération du produit :", err);
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const updateStock = async (req, res) => {
  const produitId = req.params.id;
  const { stock } = req.body;

  if (stock === undefined || isNaN(stock)) {
    return res.status(400).json({ message: 'Le champ "stock" est requis et doit être un nombre.' });
  }

  try {
    const produit = await Produit.findById(produitId);

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    produit.stock = stock;
    const produitMisAJour = await produit.save();

    res.status(200).json({
      message: '✅ Stock mis à jour avec succès.',
      produit: produitMisAJour
    });
  } catch (err) {
    console.error('❌ Erreur updateStock :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const produits = await Produit.find().populate('category');
    res.status(200).json(produits);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
const deleteProduit = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findById(produitId);

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    await Produit.findByIdAndDelete(produitId);

    res.status(200).json({ message: "Produit supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression du produit :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  createProduit,
  updateProduit,
  updateStock,
  getAllProducts,
  deleteProduit,
  getProduitByID
};
