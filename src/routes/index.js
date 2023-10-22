
const userRouter = require('./user');
const fcmRouter = require('./fcm');
const adminRouter = require('./admin')

const cors = require('cors')
function route(app) {
    app.use('/api/user', userRouter); // read db
    app.use('/api/fcm', fcmRouter)

    app.use('/admin', adminRouter)

    //login
    //home
    //chi tiet
    //them


}


module.exports = route;