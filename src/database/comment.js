import { Pool } from 'mysql2'
import { commentFromDB} from '../models/comment.js'

export class Comment{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(cid){
    return commentFromDB()
  }
  
  async getMany(cid_array){
    const comments_raw = []
    return comments_raw.map( c => commentFromDB(c))
  }

  async createReaction(cid, type_id, user_id) {
    return true
  }

  async updateReaction(cid, type_id, user_id) {
    return true
  }

  async removeReaction(cid, user_id) {
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


