import express from 'express';
import { 
    createOrder, 
    getMyOrderSeller, 
    getMyOrderUser, 
    getOrderAdmin, 
    getOrderDetail, 
    getOrderResult, 
    getOrderShipper, 
    orderComment, 
    orderSplit,
    
    updateStatus,
    userCancelOrder,
    userRefundOrder, 
     
} from '../Controller/OrderController.js';
import { protect } from '../Middleware/Auth.js';
import sellerMiddleware from '../Middleware/sellerMiddleware.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';

const router = express.Router();

router.post('/createOrder', protect, createOrder);
router.post('/orderSplit', protect, orderSplit);

router.get('/getOrderAdmin', protect,adminMiddleware, getOrderAdmin);
router.get('/getMyOrderUser', protect, getMyOrderUser);
router.get('/getMyOrderSeller',protect,sellerMiddleware,getMyOrderSeller)
router.get('/:id/getOrderDetail', protect, getOrderDetail);
router.get('/:id/getOrderResult', protect, getOrderResult);

router.post('/:id/userCancelOrder', protect, userCancelOrder);
router.post('/:id/userRefundOrder',protect, userRefundOrder)

router.put('/:id/updateStatus', updateStatus)

router.get('/getOrderShipper', getOrderShipper);

router.get('/:id/orderComment', protect, orderComment)
export default router;
