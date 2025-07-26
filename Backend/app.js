const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const produitRoute = require('./routes/produitRoute');
const categorieRoute = require('./routes/categorieRoute');
const panierRoute = require('./routes/panierRoute');
const commandeRoute = require('./routes/commandeRoute');
const paiementRoute = require('./routes/paiementRoute');
const path = require('path');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoute);
app.use('/api/produit', produitRoute);
app.use('/api/category', categorieRoute);
app.use('/api/panier', panierRoute);
app.use('/api/commande', commandeRoute);
app.use('/api/paiement', paiementRoute);
connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Serveur lancé sur le port ${port}`));