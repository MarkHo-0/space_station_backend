const express = require('express')
require('dotenv').config();

const app = express();
const database = require('./src/database/index')
const API_ROUTE = require('./src/routes/index.js')

const db_connection = await database.connect()
import { getDB } from './src/middlewares/database.js'

app.use(express.json())
 
app.use(getDB(db_connection))

app.use('/api',API_ROUTE)