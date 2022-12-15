import { commentFromDB } from '../models/comment.js'

export class Comment{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(cid){
    const [_, comment] = await this.db.execute(`
      SELECT 
      comment_id, content, sender, create_time, 
      like_count ,dislike_count, reply_to, my_reation
      WHERE 
      cid == ?
    `, [cid])

    return commentFromDB()
  }
  
  async getMany(cid_array){
    const arr_str = cid_array.join(" ");
    const [_, comments_raw] = await this.db.execute(`
      SELECT * FROM comment WHERE cid IN [?]
    `, [arr_str])

    return comments_raw.map( c => commentFromDB(c))
  }

  async createReaction(cid, type_id, user_id) {
    const [comment_reactions, _] =await this.db.execute(`
    INSERT into comment_reaction 
    ( 'cid', uid, type)
    `,[cid, type_id, user_id])

    return true
  }

  async updateReaction(cid, type_id, user_id) {
    const [comment_reactions, _] = await this.db.execute(`
    UPDATE comment 
    SET like_count = like_count + 1
    SET dislike_count = dislike_count + 1

    `,[type_id, user_id])
    
    return true
    
  }

  async removeReaction(cid, user_id) {
    const [raw_data ,_] = await this.db.execute(
      "SELECT `type` FROM comment_reactions WHERE `cid` = ? AND `uid` = ?",
      [cid, user_id]
    )

    const type = raw_data[0]['type'] 

    if (type == 0){
      await this.db.execute(
        "UPDATE comment_reaction SET `like_count` = `like_count` + 1  WHERE `cid` = ? AND `uid` = ?",
        [cid, user_id]
      )
    }else if (type == 1){
      await this.db.execute(
        "UPDATE comment_reaction SET `dislike_count` = `dislike_count` + 1  WHERE `cid` = ? AND `uid` = ?",
        [cid, user_id]
      )
    }
    return true
  }
  
  async setPinned(tid, pin_cid){
    await this.db.execute("UPDATE thread SET `pined_cid` = ? WHERE `tid` = ?",[pin_cid, tid])
    return true
  }

  async removePinned(tid) {
    await this.db.execute("UPDATE thread SET `pined_cid` = NULL  WHERE `tid` = ?", [tid])
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