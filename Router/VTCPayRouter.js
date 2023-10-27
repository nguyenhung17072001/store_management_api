import express from 'express';
import { protect } from '../Middleware/Auth.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';

import { 
    getSalesHistory,
    getTransactionDetail,
    refundRequest,
    resultGetMethod,
    resultPostMethod,
    toPaymentGateway 
} from '../Controller/VTCPayController.js';

const router = express.Router();

router.post('/toPaymentGateway', toPaymentGateway);
router.get('/resultGetMethod', resultGetMethod);
router.post('/resultPostMethod', resultPostMethod);
router.post('/getSalesHistory', getSalesHistory);
router.post('/getTransactionDetail', getTransactionDetail);
router.post('/refundRequest', refundRequest)

export default router;
