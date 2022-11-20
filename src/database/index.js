// db.js
var mysql = require('mysql')

var con = mysql.createConnection({
  host: "localhost",
  user: "space-station",
  password: "password"
})

export default con

con.connect(function(err){
  if(err) throw err;
  console.log("Connected!")
});

con.connect(function(err) {
  if (err) throw err;
  con.query(sql, function(err, result){
    if (err) throw err;
    console.log("Result:" + result);
  });
});

con.connect(function(err){
  if(err) throw err;
  console.log("Connection acomplished");
  con.query("CREATE DATABASE mydb", function(err,result){
    if (err) throw err;
    console.log("Database created")
  })
})