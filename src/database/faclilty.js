import con from "./index.js";

  const table = [
    "CREATE TABLE facility (id INT AUTO_INCREMENT PRIMARY KEY, fid SMALLINT , eng_name VARCHAR(30))"
  ]
  
  function getfacility_by_fid(id){
    con.query("SELECT * FROM facility WHERE fid=") + id, function (error, results, fields){
      if (error) return null
      return results
    }
  }
