import { Pool } from 'mysql2'
import { threadFormDB }  from '../models/thread'
export class Thread{

  /** @type {Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async get(tid) {
    const [_, fields] = await this.db.promise().execute('SELECT * FROM thread WHERE tid=?', [tid])

    if (fields.length == 0) {
      throw Error('Thread not found!')
    }

    return threadFormDB(fields[0])
  }

  /**
   * 獲取指定數量的熱門貼文
   * @param {int} quantity 
   * @param {int} cursor 
   */
  async getHeatest(quantity, cursor) {
    //TODO: 完成熱度搜尋資料庫操作
    const [_, threads] = await this.db.promise().execute(
      `SELECT * FROM thread_heat h INNER JOIN thread t LIMIT ? ORDER BY h.degree DESC`,
      [quantity, cursor]
    )

    return threads.map( t => threadFormDB(t) )
  }

  async getHeatestWithParams(page_id, faculty_id, quantity, cursor) {
    //TODO: 完成熱度搜尋資料庫操作
    const threads = []

    return threads.map( t => threadFormDB(t) )
  }

  async getNewest(quantity, cursor) {
    //TODO: 完成時間搜尋資料庫操作
    const [_, threads] = await this.db.promise().execute(`
        SELECT
          t.tid, t.pid, t.fid, t.title, t.create_time,
          u.uid, u.nickname, c.like_count, c.dislike_count,
          (SELECT COUNT(*) - 1 FROM comments WHERE comments.tid = t.tid) as 'reply_count'
        FROM
          threads t
          INNER JOIN users u ON u.uid = t.sender_uid
          INNER JOIN comments c on c.cid = t.content_cid
        WHERE
          c.soft_blocked = 0
        ORDER BY t.last_update_time DESC
        LIMIT ? OFFSET ?`,
      [quantity, cursor]
    )

    return threads.map( t => threadFormDB(t) )
  }

  async getNewestWithParams(page_id, faculty_id, quantity, cursor) {
    //TODO: 完成時間搜尋資料庫操作
    const threads = []

    return threads.map( t => threadFormDB(t) )
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


const table = [
  "CREATE TABLE thread (id INT AUTO_INCREMENT PRIMARY KEY, tid INTEGER, pid INTEGER , fid INTEGER , content_cid INTEGER , sender_uid INTEGER , create_time CURRENT_TIMESTAMP , title VARCHAR(20) , pined_cid INTEGER)",
  "CREATE TABLE thread_heat (id INT AUTO_INCREMENT PRIMARY KEY , tid INTEGER, degree INTEGER , adjust INTEGER)"
]
  

  