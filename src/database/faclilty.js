import con from "./index.js";
  
  function getfacility_by_fid(id){
    con.query("SELECT * FROM facility WHERE fid=" + id, function (error, results, fields){
      if (error) return null
      return results
    })
  }

  
