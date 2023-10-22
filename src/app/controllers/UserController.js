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
    //console.log("body: ", req.body)
    //console.log("params: ", req.params)
    //console.log("query: ", req.query)
    //Create token

    
    User.findOne({
      username: req.body.username.toLowerCase(),
      password: req.body.password,
    })
      .then((user) => {
        if (user) {
         const token = jwt.sign(
            { username: user.username, 
              password: user.password },
            'RESTFULAPIs',
            {
              expiresIn: "2h",
            }
          );
          
          //console.log('token: ', token)
          res.status(200).json({
            ...success,
            data: {
              user,
              token: `JWT ${token}`
            },
            
          });
        } else {
          res.json(fail);
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
