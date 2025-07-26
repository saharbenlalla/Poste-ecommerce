const User = require('../models/User');
const Commande = require('../models/Commande');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Produit = require('../models/Produit');
const editProfile = async (req, res) => {
  const userId = req.user.id; 
  const { name, email, adresse, telephone } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (adresse) user.adresse = adresse;
    if (telephone) user.telephone = telephone;

    await user.save();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        adresse: user.adresse,
        telephone: user.telephone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, adresse, telephone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, adresse, telephone, role });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }


    res.status(200).json({ user });
  } catch (err) {
    console.error('Erreur getProfile:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // On exclut le mot de passe

    res.status(200).json({ users });
  } catch (err) {
    console.error('Erreur getAllUsers:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const toggleUserRole = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.role = user.role === 'admin' ? 'client' : 'admin';
    await user.save();

    res.status(200).json({ message: 'Rôle mis à jour.', updatedUser: user });
  } catch (error) {
    console.error("Erreur dans toggleUserRole:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, adresse, telephone } = req.body;

    // Vérifier si l'email existe déjà (pour un autre utilisateur)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Email déjà utilisé." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, adresse, telephone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json({ message: "Utilisateur mis à jour avec succès.", user: updatedUser });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
const getUserById = async (req, res) => {
  const { id } = req.params;

  // ✅ Vérifie que c’est un ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const totalProduits = await Produit.countDocuments();
    const totalCommandes = await Commande.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });

    res.status(200).json({
      totalProduits,
      totalCommandes,
      totalClients,
    });
  } catch (error) {
    console.error("Erreur dashboard admin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = {
  editProfile,
  getProfile,
  getAllUsers,
  toggleUserRole,
  updateUser, 
  getUserById,
  addUser
};
