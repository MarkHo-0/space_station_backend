var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE program (id INT AUTO_INCREMENT PRIMARY KEY, code MEDIUMINT , eng_name VARCHAR(30) , fid SMALLINT)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_info Table created");
    });
  });

 