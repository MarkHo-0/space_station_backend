import { UserFromDB, SimpleUserFromDB } from '../models/user.js'
    
export class User{

  /** @type {import('mysql2/promise').Pool} @private */
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

  async getDetailedOne(uid) {
    return UserFromDB()
  }
  
  async decryptToken(token) {
    const [raw_data, _] = await this.db.execute("SELECT `uid`, `expire_on` < now() as `expired`, `device_name` FROM users_login_info WHERE `token` = ?", [token])

    const token_info = fields[0]
    if (!token_info) return null

    return {
      user_id: parseInt(token_info['uid']),
      expired: token_info['expired'] == 1,
      login_device: String(token_info['device_name'])
    }
  }

  async createToken(uid, token, valid_time_days, device_name) {
    return true
  }

  async removeToken(token) {
    return true
  }

  async hasUidAndPwd(uid, pwd) {
    return true
  }



  async updateNickname(uid, newName) {
    return true
  }

  async updadeFaculty(uid, newFid) {
    return true
  }

  async getVerificationData(sid) {
    const [raw_data, _] = await this.db.execute("SELECT `vf_code`, `expired_on` < NOW() AS `expired`, `used` FROM users_vf WHERE `sid` = ?", [sid])
    const vf_data = raw_data[0]
    if (!vf_data) return null
    return {
      vf_code: vf_data['vf_code'],
      expired: vf_data['expired'] == 1,
      used: vf_data['used'] == 1
    }
  }

  async setVerified(sid) {
    await this.db.execute("UPDATE users_vf SET `used` = 1, `vf_code` = 0 WHERE `sid` = ?", [sid])
    return true
  }

  async createVerificationData(sid = 0, vf_data = 0, valid_time_mins = 1) {
    await this.db.execute("INSERT INTO users_vf (`vf_code`, `sid`, `expired_on`) VALUES (?, ?, ADDDATE(NOW(), INTERVAL ? MINUTE))", 
      [vf_data, sid, valid_time_mins])

    return true
  }

  async removeVerificationData(sid) {
    await this.db.execute("DELETE FROM users_vf WHERE `sid` = ?", [sid])
    return true
  }

  async setBannedStatus(uid, type_id, valid_time_hours) {
    return true
  }

  async getBannedStatus(uid) {
    return 0
  }
}
