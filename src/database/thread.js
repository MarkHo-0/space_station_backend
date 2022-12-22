import { threadFormDB, Thread as ThreadModel }  from '../models/thread.js'
import { CURSOR_TYPE, decryptCursor_Timebased, generateCursor_Timebased} from '../utils/pagination.js'
export class Thread{

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async getOne(tid) {
    const [raw_thread] = await this.db.execute(
      "SELECT t.*, u.nickname, c.like_count, c.dislike_count, c.status FROM threads t INNER JOIN users u ON u.uid = t.sender_uid INNER JOIN comments c ON c.cid = t.content_cid WHERE t.tid = ?;", [tid]
    )
    if (raw_thread.length !== 1) return null
    return threadFormDB(raw_thread[0])
  }

  /**
   * 獲取多則貼文資料
   * @param {number[]} tid_array 
   * @returns {Promise<Array<ThreadModel>}
   */
  async getMany(tid_array = []) {
    if (tid_array.length < 1) return []

    const [raw_threads, _] = await this.db.query("SELECT t.*, u.nickname, c.like_count, c.dislike_count, c.status FROM threads t INNER JOIN users u ON u.uid = t.sender_uid INNER JOIN comments c ON c.cid = t.content_cid WHERE t.tid IN (?) ORDER BY FIELD(t.tid, ?)",
      [tid_array, tid_array]
    )

    return raw_threads.map(t => threadFormDB(t))
  }

  async getHeatestIndexes(page_id = 0, faculty_id = 0, query = '', quantity = 0, cursor_base64 = '') {
    //解析分頁索引
    const { beforeTime, offset } = decryptCursor_Timebased(CURSOR_TYPE.HEATEST, cursor_base64)

    //呼叫資料庫內的 GET_HEATEST_THREADS_ID 函數
    //第四個參數代表是否包括屏蔽的貼文，0 為否，1 為是
    //最後一個參數是指按什麼時候的熱度計算
    const [raw_data, _] = await this.db.execute(
      "CALL GET_HEATEST_THREADS_ID(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))",
      [page_id, faculty_id, query, 0, quantity, offset, beforeTime]
    )

    const indexes = raw_data[0] || []
    
    return {
      'threads_id': indexes.map(i => {return parseInt(i.tid)}),
      'cursor': generateCursor_Timebased(CURSOR_TYPE.HEATEST, beforeTime, offset + indexes.length)
    }
  }

  async getNewestIndexes(page_id = 0, faculty_id = 0, query = '', quantity = 0, cursor_base64 = '') {
    //解析分頁索引
    const { beforeTime, offset } = decryptCursor_Timebased(CURSOR_TYPE.NEWEST, cursor_base64)

    //呼叫資料庫內的 GET_NEWEST_THREADS_ID 函數
    //第四個參數代表是否包括屏蔽的貼文，0 為否，1 為是
    //最後一個參數是指按什麼時候的更新時間計算
    const [raw_data, _] = await this.db.execute(
      "CALL GET_NEWEST_THREADS_ID(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))",
      [page_id, faculty_id, query, 0, quantity, offset, beforeTime]
    )

    const indexes = raw_data[0] || []
    
    return {
      'threads_id': indexes.map(i => {return parseInt(i.tid)}),
      'cursor': generateCursor_Timebased(CURSOR_TYPE.NEWEST, beforeTime, offset + indexes.length)
    }
  }

  async search(query_text, cursor) {
    //TODO: 完成搜尋內容邏輯
    const thread = null

    return threadFormDB(thread)
  }

  async createNew(title, content, user_id, page_id, faculty_id) {
    //呼叫資料庫內的 CREATE_THREAD 函數，該函數會做以下 5 件事：
    //1. 將內文以留言方式寫入資料庫 
    //2. 將標題以貼文方式寫入資料庫
    //3. 將貼文和留言透過ID關聯在一起
    //4. 初始化貼文熱度：50
    //5. 用戶發文數加 1
    const [raw_data, _] = await this.db.execute("CALL CREATE_THREAD(?, ?, ?, ?, ?)", [title, content, page_id, faculty_id, user_id])
    const new_tid = Object.values(raw_data[1][0])[0]
    return parseInt(new_tid)
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

  if (page_id != null) conditions.push("t.pid = " + page_id)
  if (faculty_id != null) conditions.push("t.fid = " + faculty_id)

  if (visibility == 'normal') conditions.push("c.status < 3")
  if (visibility == 'blocked') conditions.push("c.status > 2")

  return conditions.length ? " WHERE "+ conditions.join(" AND ") : ""
}

  