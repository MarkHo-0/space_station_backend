const mysql = require('mysql2')

let connection;

export async function connect() {
  const { DB_USER, DB_PWD, DB_HOST, DB_NAME } = process.env

  if (!DB_USER || !DB_PWD || !DB_HOST) {
    throw new Error('Cannot find database configuration.')
  }

  const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME
  })

  try {
    await db.connect()
    connection = db
  } catch (error) {
    throw new Error('Faild to connect the database.')
  }

  return db
}

export const getDB = () => connection;