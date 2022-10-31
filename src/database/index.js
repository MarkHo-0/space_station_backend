// db.js
const Mongoose = require("mongoose")
const localDB = `mongodb://localhost:3000/role_auth`
const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected")
}
module.exports = connectDB

const mysql = require('mysql');

exports.connect = function() {
    const connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'me',
        password : 'secret',
        database : 'my_db'
    });
    
    connection.connect();
    return connection
}
