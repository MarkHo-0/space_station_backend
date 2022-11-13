  var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE user_info (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , nickname VARCHAR(20) , last_update CURRENT_TIMESTAMP)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_info Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE user_vf (id INT AUTO_INCREMENT PRIMARY KEY, sid INTEGER , vf_code MEDIUMINT , expired_on CURRENT_TIMESTAMP , is_vf BOOLEAN)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_vf Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE user_pwd (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , hashed_pwd VARCHAR(64) , last_update CURRENT_TIMESTAMP)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_pwd Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE user_baned (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , ban_type SMALLINT , unban_time CURRENT_TIMESTAMP , ban_by_uid SMALLINT)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_baned Table created");
    });
  });

  function getUserDataByUID(id){
    con.query("SELECT * FROM user_info WHERE uid=") + id, function (error, results, fields){
      if (error) return null
      return results
    }
  }

