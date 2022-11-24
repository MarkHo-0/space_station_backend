import { Thread } from './thread.js';
import { User } from './user';
import { Comment } from './comment';
import { News } from './news'
import { DataBaseModel } from '../types/database.js'

const mysql = require('mysql2')

/** @type {DataBaseModel} */
let db;

//連接資料庫函數
export async function connect() {
  const { DB_USER, DB_PWD, DB_HOST, DB_NAME } = process.env

  if (!DB_USER || !DB_PWD || !DB_HOST) {
    throw new Error('Cannot find database configuration.')
  }

  const connection = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME
  })

  try {
    await connection.connect()
    db = {
      'thread': new Thread(connection),
      'comment': new Comment(connection),
      'user': new User(connection),
      'news': new News(connection)
    }
  } catch (error) {
    throw new Error('Faild to connect the database.')
  }
}

export const getDB = () => db;