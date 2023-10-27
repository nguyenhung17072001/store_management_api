import express from 'express';
import { admin, protect } from '../Middleware/Auth.js';
import {
  createCategory,
  deletedCategory,
  getAllCategoies,
  updatedCategory,
} from '../Controller/CategoriesController.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';

const router = express.Router();
// admin routes
    
router.get('/getAllCategories', getAllCategoies)
router.post('/createCategory',protect, adminMiddleware, createCategory);
router.put('/:id/updateCategory',protect, adminMiddleware, updatedCategory);
router.delete('/:id/deleteCategory',protect, adminMiddleware, deletedCategory);
export default router;
