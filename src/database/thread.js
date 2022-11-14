import con from "./index.js";
  
  const table = [
    "CREATE TABLE thread (id INT AUTO_INCREMENT PRIMARY KEY, tid INTEGER, pid INTEGER , fid INTEGER , content_cid INTEGER , sender_uid INTEGER , create_time CURRENT_TIMESTAMP , title VARCHAR(20) , pined_cid INTEGER)",
    "CREATE TABLE thread_heat (id INT AUTO_INCREMENT PRIMARY KEY , tid INTEGER, degree INTEGER , adjust INTEGER)"
  ]

  function thread(tid){
    con.query("SELECT * FROM thread WHERE tid=") + id, function (error, results, fields){
      if (error) return null
      return results
    }
  }
  
  
  

  