import { commentFromDB } from '../models/comment.js'

export class Comment{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(cid){
    const [_, comment] = await this.db.execute(`--sql
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
    const [_, comments_raw] = await this.db.execute(`--sql
      SELECT * FROM comment WHERE cid IN [?]
    `, [arr_str])

    return comments_raw.map( c => commentFromDB(c))
  }

  async createReaction(cid, type_id, user_id) {
    const [_, comment_reaction] =await this.db.execute(`--sql
    INSERT into comment_reaction 
    ( 'cid', uid, type)
    `,[cid, type_id, user_id])

    return true
  }

  async updateReaction(cid, type_id, user_id) {
    const [_, comment_reaction] = await this.db.execute(`--sql
    UPDATE comment 
    SET like_count = like_count + 1
    SET dislike_count = dislike_count + 1

    `,[type_id, user_id])
    
    return true
    
  }

  async removeReaction(cid, user_id) {
    const [_, comment_reaction] = await this.db.execute(`--sql
    UPDATE comment 
    SET like_count = like_count - 1
    SET dislike_count = dislike_count - 1

    `,[type_id, user_id])
    return true
  }
  
  async setPinned(cid, new_cid){
    return true
  }

  async removePinned(cid) {
    return true
  }

  async updateStatus(cid, new_status_id) {
    return true
  }
  
  async createReport(cid, reason_id, user_id){
    return true
  }
}


