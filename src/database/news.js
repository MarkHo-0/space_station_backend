import { Pool } from 'mysql2'

export class News{

    /** @type {Pool} @private */
    db = null

    constructor(connection) {
        this.db = connection
    }

    async getAll() {
        //TODO: 完成查詢校園資訊
        return []
    } 
  }