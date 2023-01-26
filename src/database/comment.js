import { Comment as CommentModel } from '../models/comment.js'

export class Comment{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(cid, user_id = 0, reply_depth = 0){
    const [raw_comment, _] = await this.db.execute(
      "SELECT c.*, u.nickname, r.type AS `reaction_type` FROM (SELECT * FROM comments WHERE `cid` = ?) c LEFT JOIN comments_reactions r ON r.cid = c.cid AND r.uid = ? LEFT JOIN users u ON u.uid = c.sender_uid",
      [cid, user_id]
    )
    if (raw_comment.length !== 1) return null

    const comment = CommentModel.fromDB(raw_comment[0])

    if (reply_depth > 0 && comment.replytoCommentID != null) {
      const reply = await this.getOne(comment.replytoCommentID, user_id, reply_depth -= 1)
      comment.setReplyToModel(reply)
    }

    return comment
  }
  

  /** @returns {Promise<CommentModel[]>} */
  async getManyByTID(tid, user_id = 0, reply_depth = 0, quantity = 0, cursor){
    const [raw_comments, _] = await this.db.execute(
      "SELECT c.*, u.nickname, r.type AS `reaction_type` FROM (SELECT * FROM comments WHERE `tid` = ?) c LEFT JOIN comments_reactions r ON r.cid = c.cid AND r.uid = ? LEFT JOIN users u ON u.uid = c.sender_uid LIMIT ? OFFSET ?",
      [tid, user_id, quantity.toString(), cursor.offset.toString()]
    )

    return Promise.all(
      raw_comments.map(async (raw_comment) => {
        const comment = CommentModel.fromDB(raw_comment)

        if (reply_depth > 0 && comment.replytoCommentID != null) {
          const reply = await this.getOne(comment.replytoCommentID, user_id, reply_depth -= 1)
          comment.setReplyToModel(reply)
        }

        return comment
      })
    )
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
    await this.db.execute("UPDATE threads SET `pined_cid` = ? WHERE `tid` = ?",[pin_cid, tid])
    return true
  }

  async removePinned(tid) {
    await this.db.execute("UPDATE threads SET `pined_cid` = NULL WHERE `tid` = ?", [tid])
    return true
  }

  async updateStatus(cid, new_status_id) {
    await this.db.execute("UPDATE comments SET `status` = ? WHERE `cid` = ?", [new_status_id, cid])
    return true
  }

  async countHidden(uid) {
    const [raw_data, _] = await this.db.execute("SELECT COUNT(`cid`) as `count` FROM comments WHERE `uid` = ? AND `status` > 2", [uid])
    return parseInt(raw_data[0]['count']) || 0
  }
  
  async createReport(cid, reason_id, user_id){
    await this.db.execute("INSERT into comments_reports (`cid`,`by_uid`,`reason_id`) VALUES (?,?,?)", [cid, user_id, reason_id])
    return true 
  }

  async getReportsCount(cid) {
    const [raw_data, _] = await this.db.execute("SELECT COUNT(`create_time`) as `count` FROM comments_reports WHERE `cid` = ?", [cid])
    return parseInt(raw_data[0]['count']) || 0
  }

  async isUserReported(cid, uid) {
    const [raw_data, _] = await this.db.execute("SELECT `reason_id` FROM comments_reports WHERE `cid` = ? AND `by_uid` = ?", [cid, uid])
    return raw_data.length > 0
  }
}  