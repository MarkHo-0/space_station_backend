import { Pool } from 'mysql2'
import { threadFormDB, Thread as ThreadModel }  from '../models/thread.js'
export class Thread{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(tid) {
    //TODO: 完成搜索語句
    return threadFormDB(fields[0])
  }

  /**
   * 獲取多則貼文資料
   * @param {number[]} tid_array 
   * @returns {Promise<Array<ThreadModel>}
   */
  async getMany(tid_array = []) {
    if (tid_array.length < 1) return []

    const [raw_threads, _] = await this.db.promise().query("SELECT t.tid, t.pid, t.fid, t.title, t.create_time, t.last_update_time, t.content_cid, u.uid, u.nickname, t.comment_count, c.like_count, c.dislike_count, t.pined_cid, c.status FROM threads t INNER JOIN users u ON u.uid = t.sender_uid INNER JOIN comments c ON c.cid = t.content_cid WHERE t.tid IN (?) ORDER BY FIELD(t.tid, ?)",
      [tid_array, tid_array]
    )

    return raw_threads.map(t => threadFormDB(t))
  }

  /**
   * 獲取N則熱門貼文的編號
   * @param {number | null} page_id 
   * @param {number | null} faculty_id 
   * @param {number} quantity 
   * @param {number} cursor 
   * @returns {Promise<number[]>}
   */
  async getHeatestIndexes(page_id, faculty_id, quantity, cursor) {
    const filters = getSqlFilterCode(page_id, faculty_id, 'normal')

    const [indexes, _] = await this.db.promise().execute(`SELECT h.tid FROM threads_heat h INNER JOIN threads t ON h.tid = t.tid INNER JOIN comments c ON c.cid = t.content_cid${filters} ORDER BY h.degree DESC, t.last_update_time DESC LIMIT ? OFFSET ?`,
      [quantity.toString(), cursor.toString()]
    )

    return indexes.map(i => parseInt(i.tid))
  }

  /**
   * 獲取N則最新貼文的編號
   * @param {number | null} page_id 
   * @param {number | null} faculty_id 
   * @param {number} quantity 
   * @param {number} cursor 
   * @returns {Promise<number[]>}
   */
  async getNewestIndexes(page_id, faculty_id, quantity, cursor) {
    const filters = getSqlFilterCode(page_id, faculty_id, 'normal')

    const [indexes, _] = await this.db.promise().execute(`SELECT t.tid FROM threads t INNER JOIN comments c ON c.cid = t.content_cid${filters} ORDER BY t.last_update_time DESC LIMIT ? OFFSET ?`,
      [quantity.toString(), cursor.toString()]
    )

    return indexes.map(i => parseInt(i.tid))
  }

  async search(query_text, cursor) {
    //TODO: 完成搜尋內容邏輯
    const thread = null

    return threadFormDB(thread)
  }

  async createNew(title, content, user_id, page_id, faculty_id) {
    //TODO: 完成創建貼文資料庫操作

    return true
  }
}

/**
 * @param {number | null} page_id 
 * @param {number | null} faculty_id 
 * @param {"normal" | "blocked" | "all"} visibility 
 * @returns {String}
 */
function getSqlFilterCode(page_id, faculty_id, visibility) {
  let conditions = []

  if (page_id) conditions.push("AND t.pid = " + page_id)
  if (faculty_id) conditions.push("AND t.fid = " + faculty_id)

  if (visibility == 'normal') conditions.push("c.status < 3")
  if (visibility == 'blocked') conditions.push("c.status > 2")

  return conditions.length ? " WHERE "+ conditions.join(" AND ") : ""
}


  