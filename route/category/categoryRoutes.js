const express = require('express');
const { createCategoryCtrl, fetchCategoriesCtrl, fetchCategoryCtrl, updateCategoryCtrl, deleteCategoryCtrl } = require('../../controllers/category/categoryCtrl');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

const categoryRoutes = express.Router();

categoryRoutes.post('/', authMiddleware, createCategoryCtrl);
categoryRoutes.get('/', fetchCategoriesCtrl);
categoryRoutes.get('/:id', fetchCategoryCtrl);
categoryRoutes.put('/:id', authMiddleware, updateCategoryCtrl);
categoryRoutes.delete('/:id', authMiddleware, deleteCategoryCtrl);

module.exports = categoryRoutes;