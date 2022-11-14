import con from "./index.js";
  
  const table = [
    "CREATE TABLE program (id INT AUTO_INCREMENT PRIMARY KEY, code MEDIUMINT , eng_name VARCHAR(30) , fid SMALLINT)",
  ]
  
  function program(code){
    con.query("SELECT * FROM thread WHERE code=" + id, function (error, results, fields){
      if (error) return null
      return results
    })
  }
   

 