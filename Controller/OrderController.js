import mongoose from 'mongoose';
import Order from '../Models/OrderModels.js';
import asyncHandler from 'express-async-handler';
import Product from '../Models/ProductModels.js';
import User from '../Models/UserModels.js';
import Notification from '../Models/NotificationModels.js';
import { query } from 'express';


const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    orderItems,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    orderCode,
    paymentStatus,
  } = req.body;



  
  const order = new Order({
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    orderCode,
    paymentStatus,
    orderItems : orderItems.map((x) => ({ ...x, product: x._id, image: x.images[0] })),
    user: req.user._id
    
  });
  

  const createdOrder = await order.save();

  
  res.status(201).json(createdOrder);
});

// api get my order
const getOrderAdmin = asyncHandler(async (req, res) => {
  try {
    const classify = req.query.classify || "";
    const filter = classify === '1' ?
    {
      
      $or : [
        {isOrderSplit: false,orderStatus: {$in: ["Chờ xử lý", "Đang hoàn tiền"]}},
        {isOrderSplit: true, isChildOrder: true,orderStatus: {$in: ["Chờ xử lý", "Đang hoàn tiền"]}},
        
      ]
    } : {

    }
    const myOrder = await Order.find(filter).sort({createdAt : -1}) ;
    const countOrders = await Order.countDocuments({ "classify" : "1"});
    if (!myOrder) {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
    res.status(200).json({myOrder, countOrders});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getMyOrderUser = asyncHandler(async (req, res) => {
  try {
    const classify = req.query.classify || "";
    
    
    
    const filter = classify === '1' ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false,orderStatus : "Chờ xác nhận"},
        {isOrderSplit: true, isChildOrder: true,orderStatus : "Chờ xác nhận", paymentStatus : { $in: ["Chưa thanh toán", "Đã thanh toán"] }},
        {isOrderSplit: true, isOriginalOrder : true ,paymentStatus: "Chờ thanh toán",orderStatus : "Chờ xác nhận"},
      ]
    } : classify ==="2" ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false ,orderStatus: { $in: ["Đã chuẩn bị xong", "Đang chuẩn bị hàng"] }},
        {isOrderSplit: true, isChildOrder: true, orderStatus: { $in: ["Đã chuẩn bị xong", "Đang chuẩn bị hàng"] }},
      ]
    } : classify ==="3" ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false ,orderStatus: { $in: ["Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng", "Đã giao xong"] }},
        {isOrderSplit: true, isChildOrder: true, orderStatus: { $in: ["Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng", "Đã giao xong"] }},
      ]
    } : classify ==="4" ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false ,orderStatus: "Đã nhận hàng"},
        {isOrderSplit: true, isChildOrder: true, orderStatus: "Đã nhận hàng"},
      ]
    } : classify ==="5" ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false ,orderStatus: "Đã hủy"},
        {isOrderSplit: true, isOriginalOrder : true,paymentStatus: "Chờ thanh toán", orderStatus: "Đã hủy"},
        {isOrderSplit: true, isChildOrder: true,orderStatus: "Đã hủy", paymentStatus: { $in: ["Chưa thanh toán", "Đã thanh toán"] }}
      ]
    } : classify ==="6" ?
    {
      user : req.user._id,
      $or : [
        {isOrderSplit: false ,isRefund: true},
        {isOrderSplit: true,isChildOrder: true, isRefund: true}
      ]
    }
    : {
      user : req.user._id,
      $or : [
        {isOrderSplit: false, paymentStatus : "Chưa thanh toán"},
        {isOrderSplit: true, isChildOrder: true, paymentStatus : "Chưa thanh toán" },
        {isOrderSplit: false, paymentStatus: "Đã thanh toán"},
        {isOrderSplit: true, isChildOrder: true, paymentStatus : "Đã thanh toán" },
        {isOrderSplit: false, paymentStatus: "Chờ thanh toán"},
        {isOrderSplit: true, isOriginalOrder : true ,paymentStatus: "Chờ thanh toán"},
      ]
    }
  
                
    const myOrder = await Order.find(filter).sort({createdAt : -1}) ;
    const countOrders = await Order.countDocuments(filter)
    if (!myOrder) {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
    res.status(200).json({myOrder, countOrders});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getMyOrderSeller = asyncHandler(async (req, res) => {
  try {
    const classify = req.query.classify || "";
    const filter =  classify === '1' ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false,orderStatus : "Chờ xác nhận"},
        {isOrderSplit: true, isChildOrder: true, orderStatus : "Chờ xác nhận"},
       
      ]
    } :  classify === '2' ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false ,orderStatus: { $in: ["Đã chuẩn bị xong", "Đang chuẩn bị hàng"] }},
        {isOrderSplit: true, isChildOrder: true, orderStatus: { $in: ["Đã chuẩn bị xong", "Đang chuẩn bị hàng"] }},
       
      ]
    } : classify ==="3" ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false ,orderStatus: { $in: ["Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng", "Đã giao xong"] }},
        {isOrderSplit: true, isChildOrder: true, orderStatus: { $in: ["Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng", "Đã giao xong"] }},
      ]
    } 
    : classify ==="4" ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false ,orderStatus: "Đã nhận hàng"},
        {isOrderSplit: true, isChildOrder: true, orderStatus: "Đã nhận hàng"},
      ]
    } 
    : classify ==="5" ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false ,orderStatus: "Đã hủy"},
        {isOrderSplit: true, isChildOrder: true, orderStatus: "Đã hủy"},
      ]
    }: classify ==="6" ?
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} },
      $or : [
        {isOrderSplit: false ,isRefund: true},
        {isOrderSplit: true,isChildOrder: true, isRefund: true}
      ]
    } :
    {
      orderItems : {$elemMatch : {sellerId : req.user._id} } ,
      $or : [
        {isOrderSplit: false, paymentStatus : "Chưa thanh toán"},
        {isOrderSplit: true, isChildOrder: true, paymentStatus : "Chưa thanh toán" },
        {isOrderSplit: false, paymentStatus: "Đã thanh toán"},
        {isOrderSplit: true, isChildOrder: true, paymentStatus : "Đã thanh toán" },
        {isOrderSplit: false, paymentStatus: "Chờ thanh toán"},
        {isOrderSplit: true, isChildOrder : true ,paymentStatus: "Chờ thanh toán"},
      ]
    }
    const myOrder = await Order.find(filter).sort({createdAt : -1});
    const countOrders = await Order.countDocuments(filter)
    if (!myOrder) {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
    res.status(200).json(myOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getOrderShipper = asyncHandler(async (req, res) => {
  try {
    const classify = req.query.classify || "";
    const filter = classify === "1" ? 
    {
      $or : [
        {isOrderSplit: false, orderStatus : {$in:[ "Đã giao xong", "Đã nhận hàng"]}},
        {isOrderSplit: true, isChildOrder: true, orderStatus : {$in:[ "Đã giao xong", "Đã nhận hàng"]}},
        
      ]
      
    } : {
      $or : [
        {isOrderSplit: false, orderStatus : { $in: [ "Đã chuẩn bị xong", "Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng"] }},
        {isOrderSplit: true, isChildOrder: true, orderStatus : { $in: [ "Đã chuẩn bị xong", "Đơn vị vận chuyển đã lấy hàng", "Đang giao hàng"] }},
        
      ]
    }

    const orders = await Order.find(filter).sort({createdAt : -1});
    if (!orders) {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// api get noftification unread

const getNotifiUnread = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    /* console.log('...id', req.user.id); */
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }
    const notifications = await Notification.find({
      sellerId: user._id,
      isRead: false,
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thông báo.' });
  }
});

// api confirm seller read notifications

const sellerConfirmReadNotifi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(id, {
      isRead: true,
    });
    if (!notification) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo.' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái thông báo.' });
  }
});

const getOrderDetail = asyncHandler(async (req, res) => {
  try{
    const order = await Order.findById(req.params.id);
    if(order){
      res.send(order)
    }
  }catch(error){
    res.status(500).json({ message: error.message })
  }
})


const getOrderResult = asyncHandler(async (req, res) => {
  try{
    const order = await Order.findById(req.params.id);
    if(order){
      res.send(order)
    }
  }catch(error){
    res.status(500).json({ message: error.message })
  }
})

const orderSplit = asyncHandler(async (req, res) => {
  try {
    const { orderId,orderCode,orderItems, shippingAddress, paymentMethod, shippingPrice,itemsPrice,totalPrice, paymentStatus } = req.body;
    const uniqueSellerIds = new Set(orderItems.map(item => item.sellerId));
    if (uniqueSellerIds.size >= 2){
    const sellerOrdersMap = new Map();
    // Tạo một bản đồ để nhóm orderItems theo sellerId
    orderItems.forEach(item => {
      if (!sellerOrdersMap.has(item.sellerId)) {
        sellerOrdersMap.set(item.sellerId, []);
      }
      sellerOrdersMap.get(item.sellerId).push(item);
    });
    const calculateItemsPrice = (items) => {
      let totalPrice = 0;
      items.forEach(item => {
        totalPrice += item.price * item.quantity;
      });
      return totalPrice;
    };
    const calculateTotalPrice = (items, shippingPrice) => {
      const itemsPrice = calculateItemsPrice(items);
      return itemsPrice + shippingPrice;
    };
    let createdOrdersCount = 0;
    let index = 0;
    const childOrders = [];
    // Lặp qua từng nhóm sản phẩm và tạo đơn hàng cho từng seller
    for (const [sellerId, items] of sellerOrdersMap.entries()) {
      const newOrder = new Order({
        orderItems: items,
        shippingAddress,
        paymentMethod,
        itemsPrice: calculateItemsPrice(items), 
        shippingPrice: shippingPrice/uniqueSellerIds.size,
        totalPrice: calculateTotalPrice(items, shippingPrice/uniqueSellerIds.size), 
        user: req.user._id,
        sellerId,
        isOrderSplit : true,
        isOriginalOrder: false,
        isChildOrder : true,
        paymentStatus,
        orderCode : orderCode + String(index),
      });
      await newOrder.save();
      childOrders.push({
        orderCode : newOrder.orderCode,
        orderId : newOrder._id
      })
      createdOrdersCount++;
      index++;
    
  }
  const order = await Order.findById(orderId);
  order.childOrders = childOrders;
  order.isOrderSplit = true;
  order.isOriginalOrder = true;
  await order.save();
  if (createdOrdersCount > 0) {
    res.send(createdOrdersCount + " đơn hàng mới được tạo.");
  }
} else {
  res.send("Không có đơn hàng mới được tạo.");
}
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


const userCancelOrder = asyncHandler(async (req, res) => {
  try {
    const {reason} = req.body;
    const order = await Order.findById(req.params.id);
    
    if(order){
      if(order.childOrders){
        for(const childOrder of order.childOrders){
            const orderId = childOrder.orderId;
            const childOrderObj = await Order.findById(orderId);
            if(childOrderObj){
              childOrderObj.orderStatus = "Đã hủy";
              childOrderObj.reason = reason;
              await childOrderObj.save();
            }
        }
      }
      order.orderStatus = "Đã hủy";
      order.reason = reason;
      await order.save();
      res.send(order)
    } else {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const userRefundOrder = asyncHandler(async (req, res) => {
  try {
    const {reasonRefund} = req.body;
    const order = await Order.findById(req.params.id);
    
    if(order){
      
      order.orderStatus = "Chờ xử lý";
      order.reasonRefund = reasonRefund;
      order.isRefund = true;
      await order.save();
      res.send(order)
    } else {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const updateStatus = asyncHandler(async (req, res) => {
  try {
    const {status} =req.body
    const order = await Order.findById(req.params.id);
    
    if(order){
      order.orderStatus = status;
      if(status === "Đã nhận hàng"){
        order.paymentStatus = "Đã thanh toán";
      }
      if(order.isRefund){

        if(status === "Đã nhận hàng" && order.isRefund === true ){
          order.isRefund = false;
        }
      }
      await order.save();
      
      res.send(order)
    } else {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const orderComment = asyncHandler(async (req, res) => {
  try {
    const {id} =req.params;


    const order = await Order.findOne({ "orderItems": { $elemMatch: { product: id } }, "user" : req.user._id
    });
    // console.log(req.user._id)
    if(order){
      
      
      res.send(order)
    } else {
      res.status(404).json({
        message:
          'Your order could not be found or you do not have an order yet ',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});



export { createOrder, getOrderAdmin, getNotifiUnread, sellerConfirmReadNotifi, getOrderDetail, getOrderResult, orderSplit, getMyOrderUser, getMyOrderSeller, userCancelOrder, updateStatus, getOrderShipper,orderComment, userRefundOrder };
