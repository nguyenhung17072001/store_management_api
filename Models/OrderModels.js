import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({

  orderItems: [
    {
      
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      category: { type: String, required: true },
      sellerId: {  // Đây là khai báo của trường sellerId
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: {type: String},
  reasonRefund : {type: String},
  isRefund : {type: Boolean},

  // refundStatus: {type: String},
  


  isOrderSplit: { type: Boolean, default: false },
  isOriginalOrder: { type: Boolean, default: false },
  isChildOrder : { type: Boolean, default: false },
  orderStatus: {type: String, default: "Chờ xác nhận"},
  // transactionStatus : {type: String, default: "Giao dịch đang khởi tạo"},
  paymentStatus : {type: String},
  orderCode : {type:Number, required: true},
  childOrders: [
    {
      orderCode : {type: String},
      orderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      }, 
    }
  ]
},
{
  timestamps: true,
}

);

export default mongoose.model('Order', orderSchema);
