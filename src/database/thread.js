import { threadFormDB, Thread as ThreadModel }  from '../models/thread.js'
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

  /** @returns {Promise<Array<number>>} */
  async getHeatestIndexes(page_id = 0, faculty_id = 0, query = '', quantity = 0, cursor) {
    
    //呼叫資料庫內的 GET_HEATEST_THREADS_ID 函數
    //第四個參數代表是否包括屏蔽的貼文，0 為否，1 為是
    //最後一個參數是指按什麼時候的熱度計算
    const [raw_data, _] = await this.db.execute(
      "CALL GET_HEATEST_THREADS_ID(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))",
      [page_id, faculty_id, query, 0, quantity, cursor.offset, cursor.beforeTime]
    )

    const indexes = raw_data[0] || []
    return indexes.map(i => i.tid)
  }

  /** @returns {Promise<Array<number>>} */
  async getNewestIndexes(page_id = 0, faculty_id = 0, query = '', quantity = 0, cursor) {

    //呼叫資料庫內的 GET_NEWEST_THREADS_ID 函數
    //第四個參數代表是否包括屏蔽的貼文，0 為否，1 為是
    //最後一個參數是指按什麼時候的更新時間計算
    const [raw_data, _] = await this.db.execute(
      "CALL GET_NEWEST_THREADS_ID(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))",
      [page_id, faculty_id, query, 0, quantity, cursor.offset, cursor.beforeTime]
    )

    const indexes = raw_data[0] || []
    return indexes.map(i => i.tid)
  }

  /** @returns {Promise<Array<number>>} */
  async getUserIndexes(user, quantity, cursor) {
    const [raw_ids, _] = await this.db.execute(
      "SELECT `tid` FROM threads WHERE `sender_uid` = ? AND `hidden` = FALSE ORDER BY `create_time` DESC LIMIT ? OFFSET ?",
      [user.user_id, quantity.toString(), cursor.offset.toString()]
    )
    return raw_ids.map(i => i.tid)
  }

  async createNew(title, content, user_id, page_id, faculty_id) {
    //呼叫資料庫內的 CREATE_THREAD 函數，該函數會做以下 5 件事：
    //1. 將內文以留言方式寫入資料庫 
    //2. 將標題以貼文方式寫入資料庫
    //3. 將貼文和留言透過ID關聯在一起
    //4. 初始化貼文熱度值
    //5. 用戶發文數加 1
    const [raw_data, _] = await this.db.execute("CALL CREATE_THREAD(?, ?, ?, ?, ?)", [title, content, page_id, faculty_id, user_id])
    const new_tid = Object.values(raw_data[1][0])[0]
    return parseInt(new_tid)
  }

  /** @returns {Promise<import('../types/threadInteraction.js').ThreadInteraction[]>} */
  async getInteractions(valid_days = 7, quantity = 5, cursor) {
    const [raw_data, _] = await this.db.execute(
      "CALL GET_THREADS_INTERACTIONS(?, ?, ?)", 
      [valid_days, cursor.pointer, quantity]
    )
    return raw_data[0]
  }

  async createHotnessRecords(records = [[]]) {
    if (!Array.isArray(records) || records.length == 0) return false
    await this.db.query("INSERT INTO threads_heat_logs (`tid`, `new_degree`) VALUES ?", [records])
    return true
  }

  async createViewLog(thread_id = 0, user_id, view_time = 0) {
    await this.db.execute(
      "INSERT INTO threads_view_logs (`tid`, `viewer_uid`, `duration`) VALUE (?, ?, ?)", 
      [thread_id, user_id, view_time]
    )
    return true
  }
}
  