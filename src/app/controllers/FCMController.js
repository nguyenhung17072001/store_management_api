'use strict';
const User = require("../models/User");
const FCM = require("fcm-node");
const Event = require("../models/Event")

const schedule = require('node-schedule'); // hen gio
const moment = require('moment');
const DeviceToken = require('../models/DeviceToken');
const Notification = require("../models/Notification");
const { mutipleMongooseToObject, mongooseToObject} = require("../../util/mongoose");
const { json } = require("express");
const SERVER_KEY = "AAAAX_oOyes:APA91bGXtfGKFhOGQA7U_I2Pr_Da23b8iHs6DrHYOKh4XlgzITDP6FolRzj09hMxbASDve9at5drdBVtudrWL4M8J-y71FFxQixrTXUuAnjVK0SYZlAgQO_uJpexCku0YUXUQFGJagyh";

const success = {
  status: 200,
  code: "SUCCESS",
  message: "Thành công",
};

const fail = {
  message: "Tài khoản không tồn tại",
};

class NewsControllers {
    // [Post] api/fcm/notification/push
    async pushNotification(req, res, next) {
        
        try {
            let fcm = new FCM(SERVER_KEY);
            let notification= {
                title: req.body.title,
                body: req.body.body,
                sound: 'default',
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "icon": "fcm_push_icon"
            }
            

            DeviceToken.find({
                userId: req.body.userId,
                
            }).then((devices)=> {
                const noti = new Notification({
                    userId: req.body.userId,
                    body: notification.body,
                    title: notification.title,
                });

                if(devices) {
                    devices.forEach((device)=> {
                        let message={
                            to: device.token,
                            notification,
                            //data: req.body.data
                        }
                        //let mess = mutipleMongooseToObject(message)
                        //console.log(mess)
                        fcm.send(message, (err, response)=> {
                            if(err) {
                                //console.log('errr')
                                //next(err);
                                return res.status(500).json(err)
                            }
                            else {
                                //res.json(JSON.parse(response));
                                let resp={
                                    ...notification,
                                    ...JSON.parse(response) 
                                }
                                noti.save()
                                res.redirect('/admin/home')
                                //res.json(resp)
                                
                            }
                        })

                    })
                    
                    
                } else{
                    res.json({fail})
                }
            })

            
            
        }
        catch(err) {
            console.log('err push notification', err)
            next(err)
        }
    }

    async pushNotificationService(req, res, next) {
        schedule.scheduleJob({hour: 1, minute: 7}, ()=> {
            
            try{
                let fcm = new FCM(SERVER_KEY);
                //console.log('date: ', moment('2022-12-15T07:30:00.000Z').format('L'))
                Event.find({})
                .then((events)=> {
                    //console.log("events :", events);
                    let matchingEvent = events.filter((event)=> {
                        let eventOfToday = moment(event.time).format('L');
                        let today = moment(new Date).format('L');
                        return eventOfToday==today
                    });
                    console.log(matchingEvent);

                    let listHours = matchingEvent.map((event)=> {
                        return moment(event.time).format('LT');
                        
                    }).toString();
                    
                    DeviceToken.find({})
                    .then((devices)=> {
                        if(devices) {
                            
                            devices.forEach((device)=> {
                                let notification= {
                                    title: `Bạn có lịch vào lúc ${listHours} ngày hôm nay`,
                                    body: 'Thông báo về lịch',
                                    sound: 'default',
                                    "click_action": "FCM_PLUGIN_ACTIVITY",
                                    "icon": "fcm_push_icon"
                                }
                                let message={
                                    to: device.token,
                                    notification,
                                    //data: req.body.data
                                }
                                fcm.send(message, (err, response)=> {
                                    if(err) {
                                        console.log('errr')
                                        
                                        
                                    }
                                    else {
                                        //res.json(JSON.parse(response));
                                        let resp={
                                            ...notification,
                                            ...JSON.parse(response) 
                                        }
                                        const noti = new Notification({
                                            userId: device.userId,
                                            body: `Bạn có lịch vào lúc ${listHours} `,
                                            title: 'Thông báo về lịch',
                                        });
                                        noti.save()
                                        //res.redirect('/admin/home')
                                        //res.json(resp)
                                        
                                    }
                                })
                            })
                        }
                    })
                    
                    
                })

                


                
            } catch(err) {
                next(err);
            }
        });
        
        
        /* res.json({
            hung: 'hi'
        }); */

        
        /* try {
            let fcm = new FCM(SERVER_KEY);
            let notification= {
                title: req.body.title,
                body: req.body.body,
                sound: 'default',
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "icon": "fcm_push_icon"
            }


        } catch (error) {
            //console.log("error: ", error)
            next(error)
        } */

    }
    
}

module.exports = new NewsControllers();
