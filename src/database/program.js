import con from "./index.js";
  
  function program(code){
    con.query("SELECT * FROM thread WHERE code=" + id, function (error, results, fields){
      if (error) return null
      return results
    })
  }
   

 