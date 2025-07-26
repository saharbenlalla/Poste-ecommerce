const Categorie = require('../models/Categorie');

const createCategorie = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Le nom et la description sont obligatoires.' });
  }

  try {
    const categorieExists = await Categorie.findOne({ name });
    if (categorieExists) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà.' });
    }

    const nouvelleCategorie = new Categorie({ name, description });
    await nouvelleCategorie.save();

    res.status(201).json({
      message: '✅ Catégorie créée avec succès.',
      categorie: nouvelleCategorie
    });
  } catch (err) {
    console.error('Erreur création catégorie:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur dans getAllCategories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Categorie.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categorie.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.json(category);
  } catch (error) {
    console.error("Erreur getCategoryById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une catégorie
const updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const updatedCategory = await Categorie.findByIdAndUpdate(
      id,
      { name, description, icon },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error("Erreur updateCategory:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { createCategorie, updateCategorie , getCategoryById, getAllCategories, deleteCategory};
