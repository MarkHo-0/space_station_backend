import { Pool } from 'mysql2'
import { threadFormDB }  from '../models/thread'

  const table = [
    "CREATE TABLE thread (id INT AUTO_INCREMENT PRIMARY KEY, tid INTEGER, pid INTEGER , fid INTEGER , content_cid INTEGER , sender_uid INTEGER , create_time CURRENT_TIMESTAMP , title VARCHAR(20) , pined_cid INTEGER)",
    "CREATE TABLE thread_heat (id INT AUTO_INCREMENT PRIMARY KEY , tid INTEGER, degree INTEGER , adjust INTEGER)"
  ]

  export class Thread{

    /** @type {Pool} */
    db

    constructor(connection) {
      this.db = connection
    }

    async getAll(offset, quantity) {
      
    }

    /**
     * @description 透過編號獲取一則貼文
     * @param {int} tid 
     */
    async getByTID(tid) {
      const [_, fields] = await this.db.promise().execute('SELECT * FROM thread WHERE tid=?', [tid])

      if (fields.length == 0) {
        throw Error('Thread not found!')
      }

      return threadFormDB(fields[0])
    }


  }
  

  