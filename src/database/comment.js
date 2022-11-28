import { Pool } from 'mysql2'
import { commentFromDB, Comment } from '../models/comment.js'

export class Comment{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  /**
   * 根據提供提供的編號獲取一則留言
   * @param {int} cid 留言編號 
   * @return {Promise<Comment>}
   */
  async getOne(cid){
  }
  
  /**
   * 根據提供的編號列表獲取多則留言
   * @param {int[]} cid_array 
   * @return {Promise<Comment[]>}
   */
  async getMany(cid_array){
  }

  /**
   * 對一則留言進行互動
   * @param {int} cid 留言編號
   * @param {int} type_id 互動類型編號
   * @param {int} user_id 互動者編號
   * @return {boolean}
   */
  async react(cid, type_id, user_id) {

  }
  
  /**
   * 頂置一則留言
   * @param {int} cid 留言編號
   * @return {boolean}
   */
  async pin(cid){
  }

  /**
   * 去除頂置一則留言
   * @param {int} cid 留言編號
   * @return {boolean}
   */
  async unpin(cid){

  }
  
  /**
   * 舉報一則留言
   * @param {int} cid 留言編號
   * @param {int} reason_id 舉報的原因編號
   * @param {int} user_id 舉報的用戶編號
   * @return {boolean}
   */
  async report(cid, reason_id, user_id){
  }
}


