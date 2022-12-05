import { Pool } from 'mysql2'
import { commentFromDB} from '/models/commentjs'

export class Comment{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    db = connection
  }

  async getOne(cid){
    const [_, comment] = await this.db.promise().execute(`--sql
    SELECT 
    comment_id, content, sender, create_time, 
    like_count ,dislike_count, reply_to, my_reation
    WHERE 
    cid == ?
    `[cid])

    return commentFromDB()
  }
  
  async getMany(cid_array){
    const arr_str = cid_array.join(" ");
    const [_, comment] = await this.db.promise().execute(`--sql
    SELECT * FROM comment WHERE cid IN [?]
    const comments_raw = []`)
    return comments_rawmap( c => commentFromDB(c))
  }

  async createReaction(cid, type_id, user_id) {
    const [_, comment_reaction] =await this.db.promise().execute(`--sql
    INSERT into comment_reaction 
    ( 'cid', uid, type)
    `,[cid, type_id, user_id])

    return true
  }

  async updateReaction(cid, type_id, user_id) {
    const [_, comment_reaction] = await this.db.promise().execute(`--sql
    UPDATE comment 
    SET like_count = like_count + 1
    SET dislike_count = dislike_count + 1

    `,[type_id, user_id])
    
    return true
    
  }

  async removeReaction(cid, user_id) {
    const [_, comment_reaction] = await this.db.promise().execute(`--sql
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


