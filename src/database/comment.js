import { Pool } from 'mysql2'

export class Comment{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }
}


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

