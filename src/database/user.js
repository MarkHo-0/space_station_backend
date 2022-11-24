import { Pool } from 'mysql2'
    
export class User{

  /** @type {Pool} @private */
  db = null

  constructor(db) {
    this.db = db
  }

  async getByToken(token) {
    const [_, fields] = await this.db.promise().execute('SELECT * FROM user_login_state WHERE token=?', [token])

    if (fields.length == 0) {
      throw new Error('Token Invalid')
    }

    //TODO: 待完善令牌獲取用戶資料過程
    return true
  }

}

const table = [
  "CREATE TABLE user_info (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , nickname VARCHAR(20) , subject_id INTEGER, last_update CURRENT_TIMESTAMP)",
  "CREATE TABLE user_vf (id INT AUTO_INCREMENT PRIMARY KEY, sid INTEGER , vf_code MEDIUMINT , expired_on CURRENT_TIMESTAMP , is_vf BOOLEAN)",
  "CREATE TABLE user_pwd (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , hashed_pwd VARCHAR(64) , last_update CURRENT_TIMESTAMP)",
  "CREATE TABLE user_baned (id INT AUTO_INCREMENT PRIMARY KEY, uid INTEGER , ban_type SMALLINT , unban_time CURRENT_TIMESTAMP , ban_by_uid SMALLINT)",
]

async function getUserByUid(uid){
  con.query("SELECT * FROM user_info WHERE uid=" + uid, function (error, results, fields){
    if (error) return null
    return results
  })
}

function getUserVerificationData(sid){
  con.query("SELECT * FROM user_vf WHERE vf_code = " + sid)
}

function hasUidAndPassword(uid, pwd){
  con.query("SELECT uid FROM user_pwd WHERE uid = " + uid + " AND hashed_pwd = " + pwd)
}

function getBanedUser(uid){
  con.query("SELECT * FROM user_baned WHERE uid = " + uid)
}
