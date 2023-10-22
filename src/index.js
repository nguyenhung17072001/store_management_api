const express = require('express')
const morgan = require('morgan')
const {engine} = require('express-handlebars')
const path = require('path')
const cors = require('cors')
const app = express()
const port = 3001

const route = require('./routes')
const db = require('./config/db')

//connect to DB
db.connect();
app.use(cors())
app.use(morgan('combined'))
//console.log('__dirname: ', __dirname)
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());



route(app);


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})