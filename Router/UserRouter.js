import express from 'express';
import {
  addLikedProduct,
  changePassword,
  convertRoleSellerToUser,
  convertRoleUsertoSeller,
  deleteUser,
  getProductsBySellerId,
  getUserById,
  loginUser,
  registerUser,
  updateProfileUser,
  importUser,
  deleteLikedProduct,
  getAllUser,
  getSellerById,
  
} from '../Controller/UserController.js';
import { admin, protect } from '../Middleware/Auth.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';
import {
  getNotifiUnread,
  sellerConfirmReadNotifi,
} from '../Controller/OrderController.js';
import sellerMiddleware from '../Middleware/sellerMiddleware.js';

const router = express.Router();
router.get('/import', importUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
/* router.post('/logout', logOutUser) */ // private routes
router.put('/updateProfile', protect, updateProfileUser);
router.put('/changepass', protect, changePassword);

router.put('/:id/convertRoleUserToSeller', protect, convertRoleUsertoSeller);
router.get('/getUserById', protect, getUserById);
router.get('/getProductsBySellerId', protect, getProductsBySellerId);

router.post('/addLikedProduct', protect, addLikedProduct);
router.delete('/deleteLikedProduct', protect, deleteLikedProduct);
// admin routes
router.delete('/:id/deleteUser', protect, adminMiddleware, deleteUser);
router.put(
  '/:id/convertRoleSellerToUser',
  protect,
  adminMiddleware,
  convertRoleSellerToUser
);
router.get('/getAllUser', protect, adminMiddleware, getAllUser);
router.get('/:id/getSeller', getSellerById);


// api notification
router.get('/getNotifiUnread', protect, sellerMiddleware, getNotifiUnread);
router.put('/:id/cofirmReadNotifi', protect, sellerConfirmReadNotifi);

export default router;
