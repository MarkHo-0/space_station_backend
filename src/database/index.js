<<<<<<< HEAD
// db.js
const Mongoose = require("mongoose")
const localDB = `mongodb://localhost:27017/role_auth`
const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected")
}
module.exports = connectDB

=======
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
>>>>>>> cf06f3fe2fa301f27314dd685bc34dd6dfe0a3fd
