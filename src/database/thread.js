  var mysql = require('mysql');

  var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE thread (id INT AUTO_INCREMENT PRIMARY KEY, tid INTEGER, pid INTEGER , fid INTEGER , content_cid INTEGER , sender_uid INTEGER , create_time CURRENT_TIMESTAMP , title VARCHAR(20) , pined_cid INTEGER)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(" thread Table created");
    });
  });

  con.connect(function(err){
    if(err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE thread_heat (id INT AUTO_INCREMENT PRIMARY KEY , tid INTEGER, degree INTEGER , adjust INTEGER)"
    if (err) throw err;
    console.log("thread_heat created");
  });

  