import express from 'express'

import dotenv from 'dotenv';
dotenv.config();

import { connect as connectDB } from './src/database/index.js'
import { connectGmail } from './src/utils/emailService.js'
import API_ROUTES from './src/routes/index.js'
import { initManagers } from './src/managers/runner.js';

//連接資料庫
await connectDB()
console.log('Connected to database.')

//連接電郵系統
await connectGmail()
console.log('Connected to Email Server')

//初始化路由
const app = express();
app.use(express.json())
app.use('/api', API_ROUTES)

app.listen(3000)

//初始化管理器
await initManagers()