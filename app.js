const express = require('express')
require('dotenv').config();

const database = require('./src/database/index')
const API_ROUTE = require('./src/routes/index.js')

//連接資料庫
await database.connect()
console.log('Connected to database.')

//初始化路由
const app = express();
app.use(express.json())
app.use('/api', API_ROUTE)