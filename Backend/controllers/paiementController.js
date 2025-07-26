const Paiement = require('../models/Paiement');
const Commande = require('../models/Commande');

const createPaiement = async (req, res) => {
  const { commande, montant, methode, statut } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const commandeExiste = await Commande.findById(commande);
    if (!commandeExiste) {
      return res.status(404).json({ message: "Commande non trouvée." });
    }

    if (commandeExiste.utilisateur.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const nouveauPaiement = await Paiement.create({
      commande,
      montant,
      methode,
      statut: statut || 'en attente',
      datePaiement: new Date()
    });

    if (statut === 'réussi') {
      commandeExiste.statut = 'confirmée';
      await commandeExiste.save();
    }

    res.status(201).json({ message: "Paiement enregistré avec succès.", paiement: nouveauPaiement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
const getPaiementByCommande = async (req, res) => {
  const commandeId = req.params.commandeId;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const paiement = await Paiement.findOne({ commande: commandeId }).populate('commande');

    if (!paiement) {
      return res.status(404).json({ message: "Aucun paiement trouvé pour cette commande." });
    }

    if (
      paiement.commande.utilisateur.toString() !== userId &&
      userRole !== 'admin'
    ) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    res.status(200).json(paiement);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
const getAllPaiements = async (req, res) => {
  try {
  const paiements = await Paiement.find()
  .populate("user", "name") 
  .populate({
    path: "commande",
    select: "total statut user",
    populate: {
      path: "user",
      select: "name"
    }
  });

    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


const updateStatutPaiement = async (req, res) => {
  const paiementId = req.params.paiementId;
  const { statut } = req.body;
  const userRole = req.user.role;

  try {
    // Autorisation : seulement admin
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Accès refusé. Réservé à l'admin." });
    }

    const paiement = await Paiement.findById(paiementId);
    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé." });
    }

    paiement.statut = statut;
    await paiement.save();

    // Si le statut devient "réussi", mettre à jour la commande liée
    if (statut === 'réussi') {
      await Commande.findByIdAndUpdate(paiement.commande, { statut: 'confirmée' });
    }

    res.status(200).json({ message: "Statut du paiement mis à jour.", paiement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getMesPaiements = async (req, res) => {
  const userId = req.user.id;

  try {
    // Récupérer les commandes de l'utilisateur
    const commandes = await Commande.find({ utilisateur: userId }).select('_id');
    const commandeIds = commandes.map(c => c._id);

    // Récupérer les paiements liés aux commandes
    const paiements = await Paiement.find({ commande: { $in: commandeIds } })
      .populate('commande')
      .sort({ createdAt: -1 });

    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const effectuerPaiement = async (req, res) => {
  const { commandeId, methode } = req.body;
  const userId = req.user.id;

  try {
    const commande = await Commande.findById(commandeId);
    if (!commande) return res.status(404).json({ message: "Commande introuvable." });

    const paiement = await Paiement.create({
      commande: commandeId,
      user: userId,
      montant: commande.total,
      methode,
      statut: "réussi",
    });

    commande.statut = "payée";
    await commande.save();

    res.status(201).json({ message: "Paiement effectué avec succès.", paiement });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
module.exports = {
  createPaiement,
  getPaiementByCommande,
  getAllPaiements,
  updateStatutPaiement,
  getMesPaiements,
  effectuerPaiement
};
