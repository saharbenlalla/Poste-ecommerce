const express = require('express');
const { createCategorie, updateCategorie , getCategoryById, getAllCategories, deleteCategory} = require('../controllers/categorieController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCategorie);
router.put('/:id', authMiddleware, updateCategorie);
router.get("/", getAllCategories);
router.delete("/delete/:id", authMiddleware, deleteCategory);
router.get('/:id', getCategoryById);
module.exports = router;
