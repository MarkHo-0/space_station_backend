import express from 'express'

import dotenv from 'dotenv';
dotenv.config();

import { connect as connectDB } from './src/database/index.js'
import API_ROUTES from './src/routes/index.js'

//連接資料庫
await connectDB()
console.log('Connected to database.')

//初始化路由
const app = express();
app.use(express.json())
app.use('/api', API_ROUTES)

app.listen(3000)