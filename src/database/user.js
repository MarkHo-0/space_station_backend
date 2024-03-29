import { SimpleUser, User as DetailedUser } from '../models/user.js'
    
export class User{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(db) {
    this.db = db
  }

  async getOneByUID(uid) {
    if (uid == null) return null
    const [raw_user, _] = await this.db.execute("SELECT `uid`, `nickname` FROM users WHERE `uid` = ?", [uid])

    if (raw_user.length !== 1) return null
    return SimpleUser.fromDB(raw_user[0])
  }

  async getOneBySID(sid) {
    if (sid == null) return null
    const [raw_user, _] = await this.db.execute(
      "SELECT `uid`, `nickname` FROM users WHERE `uid` = (SELECT `uid` FROM users_info WHERE `sid` = ?)",
      [sid]
    )

    if (raw_user.length !== 1) return null
    return SimpleUser.fromDB(raw_user[0])
  }

  async getDetailedOne(user_id) {
    const [raw_user, _] = await this.db.execute( "SELECT i.*, u.nickname FROM users_info i, users u WHERE u.uid = i.uid AND i.uid = ?", [user_id])
    if (raw_user.length !== 1) return null
    return DetailedUser.fromDB(raw_user[0])
  }

  async getStudentID(user) {
    const [raw_id, _] = await this.db.execute("SELECT `sid` FROM users_info WHERE `uid` = ?", [user.user_id])
    if (raw_id.length !== 1) return null
    return Number(raw_id[0]['sid'])
  }
  
  async decryptToken(token) {
    const [raw_data, _] = await this.db.execute(
      "SELECT `uid`, `expire_on` < now() as `expired`, `device_name` FROM users_login_info WHERE `token` = UNHEX(?)",
      [token]
    )

    const token_info = raw_data[0]
    if (!token_info) return null

    return {
      user_id: parseInt(token_info['uid']),
      expired: token_info['expired'] == 1,
      login_device: String(token_info['device_name'])
    }
  }

  async createLoginState(uid, token, valid_time_days, device_name) {
    await this.db.execute(
      "INSERT INTO users_login_info (`token`, `uid`, `expire_on`, `device_name`) VALUES (UNHEX(?), ?, ADDDATE(NOW(), INTERVAL ? DAY), ?)",
      [token, uid, valid_time_days, device_name]
    )
    return true
  }

  async removeLoginState(token) {
    await this.db.execute("DELETE FROM users_login_info WHERE `token` = UNHEX(?)", [token])
    return true
  }

  async removeAllLoginStates(user) {
    await this.db.execute("DELETE FROM users_login_info WHERE `uid` = ?", [user.user_id])
    return;
  }

  async isSidAndPwdMatched(sid, pwd) {
    const [raw_data, _] = await this.db.execute("SELECT `sid` FROM users_pwd WHERE `sid` = ? AND `hashed_pwd` = UNHEX(?)", [sid, pwd])
    return raw_data.length == 1
  }

  async createOne(sid, nickname, pwd) {
    await this.db.query(
      "INSERT INTO users (`nickname`) VALUES (?);" +
      "INSERT INTO users_info (`uid`, `sid`, `fid`) VALUES (LAST_INSERT_ID(), ?, null);" +
      "INSERT INTO users_pwd (`sid`, `hashed_pwd`) VALUES ((SELECT `sid` FROM users_info WHERE `uid` = LAST_INSERT_ID()), UNHEX(?));"
      , [nickname, sid, pwd]
    )

    return true
  }

  async getNickNameData(user) {
    const [data, _] = await this.db.execute("SELECT * FROM users WHERE `uid` = ?", [user.user_id])
    return {
      nickname: String(data[0]["nickname"]),
      last_update: new Date(data[0]["last_update"])
    }
  }

  async updateNickname(user, newName) {
    await this.db.execute("UPDATE users SET `nickname` = ?, `last_update` = NOW() WHERE `uid` = ? ", [newName, user.user_id])
    return;
  }

  async updadeFaculty(user, newFid) {
    await this.db.execute("UPDATE users_info SET `fid` = ? WHERE `uid` = ? ", [newFid, user.user_id])
    return;
  }

  async updadePassword(student_id, new_pwd) {
    await this.db.execute(
      "UPDATE users_pwd SET `hashed_pwd` = UNHEX(?), `last_update` = NOW(), `should_change` = FALSE WHERE `sid` = ?" ,
      [new_pwd, student_id]
    )
    return;
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

  async createBanRecord(uid, ban_type, ban_days) {
    await this.db.execute("INSERT INTO users_baned VALUES (?, ?, NOW(), ADDDATE(NOW(), INTERVAL ? DAY))",[uid, ban_type, ban_days])
    return true
  }

  async isBannedFrom(user, ban_type) {
    const [raw_data, _] = await this.db.execute(
      "SELECT `unban_time` FROM users_baned WHERE `uid` = ? AND `ban_type` = ? AND `unban_time` < NOW()",
      [user.user_id, ban_type]
    )
    return raw_data.length > 0
  }
}
