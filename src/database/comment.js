var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE comment (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , tid INTEGER , replyto_cid INTEGER , sender_uid INTEGER , content VARCHAR(3000) , create_time CURRENT_TIMESTAMP , like_count INTEGER , dislike_count INTEGER , reply_count INTEGER , soft_blocked BOOLEAN)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("comment Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE comment_reported (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , uid INTEGER , reason_id SMALLINT , create_time CURRENT_TIMESTAMP)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("comment_reported Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE comment_reaction (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , uid INTEGER , r_type SMALLINT , r_time CURRENT_TIMESTAMP)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("comment_reaction Table created");
    });
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE comment_w_list (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , expired_on CURRENT_TIMESTAMP , bay_auid INT)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user_baned Table created");
    });
  });