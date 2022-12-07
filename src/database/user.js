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

  async getVerificationData(sid) {
    const [raw_data, _] = await this.db.promise().execute("SELECT `vf_code`, `expired_on` < now() as `expired`, `used` FROM users_vf WHERE sid = ?", [sid])
    const vf_data = raw_data[0]
    if (!vf_data) return null
    return {
      vf_code: vf_data['vf_code'],
      expired: vf_data['expired'] == 1,
      used: vf_data['used'] == 1
    }
  }

  async setVerified(sid) {
    await this.db.promise().execute("UPDATE users_vf SET `used` = 1, `vf_code` = 0 WHERE `sid` = ?", [sid])
    return true
  }

  async createVerificationData(sid = 0, vf_data = 0, valid_time_mins = 0) {
    const currTime = new Date()
    const expired_time = Math.floor(currTime.setMinutes(currTime.getMinutes() + valid_time_mins) / 1000)
    await this.db.promise().execute("INSERT INTO users_vf (`vf_code`, `sid`, `expired_on`) VALUES (?, ?, FROM_UNIXTIME(?))", 
      [vf_data, sid, expired_time])

    return true
  }

  async removeVerificationData(sid) {
    await this.db.promise().execute("DELETE FROM users_vf WHERE `sid` = ?", [sid])
    return true
  }

  async setBannedStatus(uid, type_id, valid_time_hours) {
    return true
  }

  async getBannedStatus(uid) {
    return 0
  }
}
