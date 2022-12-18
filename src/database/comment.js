import { commentFromDB } from '../models/comment.js'

export class Comment{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(cid, user_id){
    if (!user_id) user_id = 0
    const [raw_comment, _] = await this.db.execute(
      "CALL GET_COMMENT(?, ?)", [cid, user_id]
    )
    if (raw_comment[0].length !== 1) return null
    return commentFromDB(raw_comment[0][0], raw_comment[1][0])
  }
  
  async getMany(cid_array){
    const arr_str = cid_array.join(" ");
    const [_, comments_raw] = await this.db.execute(`
      SELECT * FROM comment WHERE cid IN [?]
    `, [arr_str])

    return comments_raw.map( c => commentFromDB(c))
  }

  async createNew(content, tid, user_id, reply_to) {
    //因為 mysql 不支援傳入 null，所以改為傳入 0
    if (reply_to == null) reply_to = 0

    //呼叫資料庫內的 POST_COMMENT 函數，該函數會做以下 5 件事：
    // 1.將留言內容寫入資料庫
    // 2.將所屬貼文留言數 +1
    // 3.如果屬於回復其它留言，則將該留言的回復數 +1
    // 4.將所屬貼文的最後更新時間更改為現在
    // 5.將留言者的總留言數 +1
    const [raw_data, _] = await this.db.execute(
      "CALL POST_COMMENT(?, ?, ?, ?)", 
      [content, tid, user_id, reply_to]
    )

    const new_cid = Object.values(raw_data[0][0])[0]
    return parseInt(new_cid)
  }

  async createReaction(cid, user_id, type_id) {
    //呼叫資料庫內的 CREATE_REACTION 函數，該函數會做以下 2 件事：
    // 1.將互動類型寫入資料庫
    // 2.點讚數/踩數 +1
    await this.db.execute("CALL CREATE_REACTION(?, ?, ?)", [cid, user_id, type_id])
    return true
  }

  async removeReaction(cid, user_id) {
    //呼叫資料庫內的 REMOVE_REACTION 函數，該函數會做以下 3 件事：
    // 1.獲取用戶上次的互動類型
    // 2.刪除互動資料
    // 3.點讚數/踩數 -1
    await this.db.execute("CALL REMOVE_REACTION(?, ?)", [cid, user_id])
    return true
  }
  
  async setPinned(tid, pin_cid){
    await this.db.execute("UPDATE thread SET `pined_cid` = ? WHERE `tid` = ?",[pin_cid, tid])
    return true
  }

  async removePinned(tid) {
    await this.db.execute("UPDATE thread SET `pined_cid` = NULL WHERE `tid` = ?", [tid])
    return true
  }

  async updateStatus(cid, new_status_id) {
    await this.db.excute("UPDATE comment SET `status` = ?", [new_status_id])
    return true
  }
  
  async createReport(cid, reason_id, user_id){
    await this.db.excute("INSERT into comment_reports (`cid`,`by_uid`,`reason_id`) VALUES (?,?,?)", [cid, user_id, reason_id])
    return true 
  }

}