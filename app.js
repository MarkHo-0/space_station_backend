const express = require('express')

const app = express();
const database = require('./src/database/index')

app.use(express.json())

app.db = database.connect()

const API_ROUTE = require('./src/routes/index.js')

app.use('/api',API_ROUTE)