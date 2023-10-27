import express from 'express';
import asyncHandler from 'express-async-handler';
import moment from 'moment';
import config from '../Config/vtcpay.js'
import axios from "axios"
import CryptoJS from 'crypto-js';
import Order from '../Models/OrderModels.js';

const toPaymentGateway = asyncHandler(async(req,res) => {
    const {amount, reference_number} = req.body;

    const currency = 'VND';
    const url_return = config.vtc_Return;
    const website_id = config.vtc_WebID;
    const secretKey = config.vtc_SecretKey;
    const plaintext = `${amount}|${currency}|${reference_number}|${url_return}|${website_id}|${secretKey}`;
    const sha256 = CryptoJS.SHA256(plaintext)
    const signature = sha256.toString(CryptoJS.enc.Hex);
    const url = config.vtc_Url + '?' + `amount=${amount}&currency=${currency}&reference_number=${reference_number}&url_return=${url_return}&website_id=${website_id}&signature=${signature}` 

    res.send(url);
    
})

const resultGetMethod = asyncHandler(async(req,res) => {
    const orderCode = req.query.reference_number;
    const order = await Order.findOne({orderCode : orderCode})
    res.redirect(`http://localhost:3000/ordersuccess/${order._id}`)
    // console.log(req.query)
    
})

const resultPostMethod = asyncHandler(async(req,res) => {
    
    const params = req.body;
    
    const data = params.data.split('|');
    // console.log(params)
    const orderCode = data[3];
    
    const order = await Order.findOne({orderCode : orderCode})
    
    if(data[4] === String(1)){
        order.paymentStatus = "Đã thanh toán"
        await order.save();
        if(order.childOrders){
            for( const childOrder of order.childOrders){
            
                const orderChild = await Order.findById(childOrder.orderId);
                orderChild.paymentStatus = "Đã thanh toán";
                await orderChild.save();
            }
            
        }
    }
    res.send("OK")
})

const getSalesHistory = asyncHandler(async(req,res) => {

    const {fromDate,toDate} = req.body
    const revceiverAccount = "0963465816";
    const keySign = '1!2@3#4$5%';
    const intergratedID = config.vtc_WebID;
    const merchantType = 'WEBSITE';

    const data = keySign + revceiverAccount + intergratedID + merchantType + fromDate + toDate + config.vtc_SecretKey;

    const sign = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);

    const requestData = {
        'revceiverAccount' : revceiverAccount,
        'intergratedID' : intergratedID,
        'merchantType' : merchantType,
        'fromDate' : fromDate,
        'toDate' : toDate,
        'sign' : sign,
    }

    try{
        const response = await axios.post(
            'http://alpha1.vtcpay.vn/portalgateway/api/AccountApi/MerchantSaleHistoryGetList',
             requestData);
        console.log(response.data)
      } catch(error){
        console.log("Error: ", error.message)
      }
    
})

const getTransactionDetail = asyncHandler(async(req,res) => {

    const revceiverAccount = "0963465816";
    const keySign = '1!2@3#4$5%';
    const intergratedID = config.vtc_WebID;
    const merchantType = 'WEBSITE';
    const orderCodes = req.body;

    const data = keySign +revceiverAccount + intergratedID + merchantType + config.vtc_SecretKey;

    const sign = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);

    const requestData = {
        'merchantType' : merchantType,
        'intergratedID' : intergratedID,
        'revceiverAccount' : revceiverAccount,
        'sign' : sign,
        "listMerchantOrderCode": orderCodes.map(orderCode => (
                                {orderCode : orderCode}))
    }
    // console.log(requestData.listMerchantOrderCode);
    try{
        const response = await Axios.post(
            'http://alpha1.vtcpay.vn/portalgateway/api/AccountApi/VTCPayGetOrderStatus',
             requestData);
        console.log(response.data)
    } catch(error){
        console.log("Error: ", error.message)
    }

}) 

const refundRequest = asyncHandler(async(req,res) => {
    const revceiverAccount = "0963465816";
    const keySign = '1!2@3#4$5%';
    const intergratedID = config.vtc_WebID;
    const merchantType = 'WEBSITE';
    const refundDatas = req.body;

    const data = keySign + revceiverAccount + intergratedID + merchantType + config.vtc_SecretKey;
    const sign = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);

    const requestData = {
        'merchantType' : merchantType,
        'intergratedID' : intergratedID,
        'revceiverAccount' : revceiverAccount,
        'sign' : sign,
        "listMerchantOrderCode": refundDatas.map(
            refundData => (
                {refundAmount : refundData.refundAmount, 
                    orderCode:refundData.orderCode}))
        
    }

    try{
        const response = await Axios.post(
            'http://alpha1.vtcpay.vn/portalgateway/api/AccountApi/RefundMoneyVTC', 
            requestData);
        console.log(response.data)
    } catch(error){
        console.log("Error: ", error.message)
    }
})






export {toPaymentGateway, resultGetMethod, resultPostMethod, getSalesHistory, getTransactionDetail, refundRequest};
