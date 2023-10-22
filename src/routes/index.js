
const userRouter = require('./user');

const cors = require('cors')
function route(app) {
    //user
    app.use('/api/user', userRouter); // read db


    
    //home
    //chi tiet
    //them


}


module.exports = route;