'use strict';
const User = require("../models/User");
const DeviceToken = require("../models/DeviceToken")
const Notification = require("../models/Notification")
const AdminAccount = require("../models/AdminAccount")
const { mutipleMongooseToObject, mongooseToObject} = require("../../util/mongoose");
const { render } = require("node-sass");


const success = {
    status: 200,
    code: "SUCCESS",
    message: "Thành công",
};

const fail = {
    message: "Tài khoản không tồn tại",
};

class AdminController {
    login(req, res, next) {
        res.render('admin/login')
    }
    
    loginAction(req, res, next) {
        AdminAccount.findOne({
            username: req.body.username,
            password: req.body.password,
        }).then((acc)=> {
            if(acc) {
                res.redirect('/admin/home')

                
            } else {
                console.log('Tài khoản không tồn tại')
            }

        }).catch(next)
    }

    showHome(req, res, next) {
        User.find({}).then((user)=> {
            //console.log(user)
            res.render('admin/home', {
                user: mutipleMongooseToObject(user)
            })
            
        })
    }

    upload(req, res, next) {
        //console.log(req.params)
        res.render('admin/upload', {
            userId: req.params.id
        });
    }

    event(req, res, next) {
        res.render('admin/event')
    }


    eventPerson(req, res, next) {
        res.render('admin/eventperson', {
            userId: req.params.id
        })
    }



}

module.exports = new AdminController();
