'use strict';
const User = require("../models/User");
const jwt = require('jsonwebtoken')

const { mutipleMongooseToObject, mongooseToObject} = require("../../util/mongoose");


const success = {
  status: 200,
  code: "SUCCESS",
  message: "Thành công",
};

const fail = {
  message: "Tài khoản không tồn tại",
};

class NewsControllers {
  // [Post] api/user/login
  login(req, res, next) {
    console.log("req.body.phone: ", req.body.phone)
    User.findOne({
      phone: req.body.phone,
      password: req.body.password,
    })
      .then((user) => {
        if (user) {
         const token = jwt.sign(
            { phone: user.phone, 
              password: user.password },
            'RESTFULAPIs',
            {
              expiresIn: "2h",
            }
          );

          res.status(200).json({
            ...success,
            data: {
              _id: user.id,
              phone: user.phone,
              address: user.address,
              birthday: user.birthday,
              name: user.name,
              thumb: user.thumb,
              
              token: `JWT ${token}`
            },
            
          });
        } else {
          res.status(400).json(fail);
        }
      })
      .catch(next);
  }



  //[POST]/api/user/register
  register(req, res, next) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      position: req.body.position,
      name: req.body.name,
    });

    User.findOne({ username: req.body.username }).then((username) => {
        if (!username) {
            user.save()
            .then((user) => {
                if (user) {
                    res.json({
                        ...success,
                        data: user,
                    });
                } else {
                    res.json(fail);
                }
            })
            .catch(next);
        }
        else {
            res.json({
                data: {
                    message: "Tài khoản đã tồn tại"
                }
            })
        }
    });
  }
}

module.exports = new NewsControllers();
