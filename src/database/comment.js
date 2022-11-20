import con from "./index.js";

  const table = [
    "CREATE TABLE comment (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , tid INTEGER , replyto_cid INTEGER , sender_uid INTEGER , content VARCHAR(3000) , create_time CURRENT_TIMESTAMP , like_count INTEGER , dislike_count INTEGER , reply_count INTEGER , soft_blocked BOOLEAN)",
    "CREATE TABLE comment_reported (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , uid INTEGER , reason_id SMALLINT , create_time CURRENT_TIMESTAMP)",
    "CREATE TABLE comment_reaction (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , uid INTEGER , r_type SMALLINT , r_time CURRENT_TIMESTAMP)",
    "CREATE TABLE comment_w_list (id INT AUTO_INCREMENT PRIMARY KEY, cid INTEGER , expired_on CURRENT_TIMESTAMP , bay_auid INT)"
  ]
  
  function getcomment_by_cid (id){
    con.query("SELECT * FROM  WHERE cid=") + id, function (error, results, fields){
      if (error) return null
      return results
    }
  }

  function getcomment_reported_by_uid (id){
    con.query("SELECT * FROM WHERE uid=")
  }

  function getcomment_reaction_by_uid (id){
    con.query("SELECT * FROM WHERE uid=")
  }

  function getcomment_w_list_by_auid (id){
    con.query("SELECT * FROM WHERE auid=")
  }