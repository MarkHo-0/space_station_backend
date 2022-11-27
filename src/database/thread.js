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
    const [_, threads] = await this.db.promise().execute(`--sql
      SELECT
        t.tid, t.title, t.create_time, t.last_update_time, t.pid, t.fid,
        u.uid, u.nickname, c.like_count, c.dislike_count,
        (SELECT COUNT(cc.tid) - 1 FROM comments cc WHERE cc.tid = t.tid) as 'reply_count',
        (SELECT IF(t.pined_cid IS NULL, 0, 1)) as 'has_pinned_reply'
      FROM 
        threads_heat h
        INNER JOIN threads t ON t.tid = h.tid
        INNER JOIN users u ON u.uid = t.sender_uid 
        INNER JOIN comments c ON c.cid = t.content_cid 
      WHERE
        t.pid = ? AND t.fid = ? AND c.status < 3
      ORDER BY 
        h.degree DESC,
        t.last_update_time DESC
      LIMIT ? OFFSET ?`,
      [page_id, faculty_id, quantity, cursor]
    )

    if (threads.length == 0) {
      return []
    }

    return threads.map( t => threadFormDB(t) )
  }

  async getNewest(quantity, cursor) {
    const [_, threads] = await this.db.promise().execute(`--sql
        SELECT
          t.tid, t.pid, t.fid, t.title, t.create_time, t.last_update_time,
          u.uid, u.nickname, c.like_count, c.dislike_count,
          (SELECT COUNT(*) - 1 FROM comments WHERE comments.tid = t.tid) as 'reply_count',
          (SELECT IF(t.pined_cid IS NULL, 0, 1)) as 'has_pinned_reply'
        FROM
          threads t
          INNER JOIN users u ON u.uid = t.sender_uid
          INNER JOIN comments c on c.cid = t.content_cid
        WHERE
          c.status < 3
        ORDER BY t.last_update_time DESC
        LIMIT ? OFFSET ?`,
      [quantity, cursor]
    )

    if (threads.length == 0) {
      return []
    }

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
  

  