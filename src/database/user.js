import con from "./index.js";
  
  const table = [
    "CREATE TABLE user_info (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , nickname VARCHAR(20) , last_update CURRENT_TIMESTAMP)",
    "CREATE TABLE user_vf (id INT AUTO_INCREMENT PRIMARY KEY, sid INTEGER , vf_code MEDIUMINT , expired_on CURRENT_TIMESTAMP , is_vf BOOLEAN)",
    "CREATE TABLE user_pwd (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , hashed_pwd VARCHAR(64) , last_update CURRENT_TIMESTAMP)",
    "CREATE TABLE user_baned (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , ban_type SMALLINT , unban_time CURRENT_TIMESTAMP , ban_by_uid SMALLINT)",
  ]
 
  function getUserDataByUID(id){
    con.query("SELECT * FROM user_info WHERE uid=" + id, function (error, results, fields){
      if (error) return null
      return results
    })
  }

  function getUser_vf_by_vf_code(id){
    con.query("SELECT * FROM user_vf WHERE vf_code=")
  }

  function getUser_pwd_by_hashed_pwd_ (VARCHAR){
    con.query("SELECT * FROM user_pwd WHERE hashed_pwd = ")
  }

  function getUser_baned_by_Ban_by_uid (SMALLINT){
    con.query("SELECT * FROM user_baned WHERE ban_by_uid = ")
  }
  //
