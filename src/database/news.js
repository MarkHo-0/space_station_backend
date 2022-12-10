import { Pool } from 'mysql2'
import { jsDate2unixTime } from '../utils/parseTime.js'

export class News{

    /** @type {Pool} @private */
    db = null

    constructor(connection) {
        this.db = connection
    }

    async getMany(quantity, cursor) {
        const [raw_news, _] = await this.db.promise().query(
          "SELECT * FROM `school_news` WHERE public_time < NOW() AND discard_time > NOW() ORDER BY public_time DESC LIMIT ? OFFSET ?", 
          [quantity, cursor]
        )

        const news = raw_news.map( n => ({
          uuid: parseInt(n['uuid']),
          title: String(n['title']),
          content: String(n['content']),
          public_time: jsDate2unixTime(new Date(n['public_time']))
        }))
        return news
    } 
  }