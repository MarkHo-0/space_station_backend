import { createPool } from 'mysql2/promise'

import { Thread } from './thread.js';
import { User } from './user.js';
import { Comment } from './comment.js';
import { News } from './news.js'
import { Course } from './course'
import { ClassSwap } from './class_swap.js'

/** @type {import('../types/database.js').DataBaseModel} */
let db;

//連接資料庫函數
export async function connect() {
  const { DB_USER, DB_PWD, DB_HOST, DB_NAME, DB_PORT } = process.env

  if (!DB_USER || !DB_PWD || !DB_HOST || !DB_PORT) {
    throw new Error('Cannot find database configuration.')
  }

  try {
    const connection = await createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PWD,
      database: DB_NAME,
      connectionLimit: 5,
      multipleStatements: true
    })

    db = {
      'thread': new Thread(connection),
      'comment': new Comment(connection),
      'user': new User(connection),
      'news': new News(connection),
      'course': new Course(connection),
      'classSwap': new ClassSwap(connection) 
    }
  } catch (error) {
    throw new Error('Faild to connect the database.')
  }
}

export const getDB = () => db;