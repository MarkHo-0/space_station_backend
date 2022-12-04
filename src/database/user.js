import { Pool } from 'mysql2'
import { UserFromDB, SimpleUserFromDB } from '../models/user.js'
    
export class User{

  /** @type {Pool} @private */
  db = null

  constructor(db) {
    this.db = db
  }

  async getOne(uid) {
    return SimpleUserFromDB()
  }

  async getMany(uid_array) {
    const users_raw = []
    return users_raw.map( u => SimpleUser())
  }

  async getInfo(uid) {
    return UserFromDB()
  }
  
  async getOneByLoginToken(token) {
    const [_, fields] = await this.db.promise().execute(`SELECT * FROM user_login_state WHERE token=?`, [token])

    if (fields.length == 0) {
      throw new Error('Token Invalid')
    }

    //TODO: 待完善令牌獲取用戶資料過程
    return SimpleUserFromDB(fields[0])
  }

  async setLoginToken(uid, token) {
    return true
  }

  async removeLoginToken(uid, token) {
    return true
  }

  async hasUidAndPwd(uid, pwd) {
    return true
  }

  async createOne(user_data) {
    return 0 //更換為用戶編號
  }

  async updateNickname(uid, newName) {
    return true
  }

  async updadeFaculty(uid, newFid) {
    return true
  }

  async isVerificationDataValid(sid, vf_data) {
    return true
  }

  async setVerificationData(sid, vf_data) {
    return true
  }

  async createVerificationData(sid, vf_data) {
    return true
  }

  async setBannedStatus(uid, type_id, expired_on) {
    return true
  }

  async getBannedStatus(uid) {
    return 0
  }
}
