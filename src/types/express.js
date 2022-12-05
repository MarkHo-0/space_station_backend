 import express from 'express';
 import { SimpleUser } from '../models/user.js'

 /** @typedef {import('./database.js').DataBaseModel} DBModel */
 
// express 的 request 拓展，加入了資料庫入口和用戶資料

 /**
 * @typedef {Object} ChildType
 * @property {DBModel} db
 * @property {SimpleUser} [user]
 * @typedef {express.Request & ChildType} CompleteRequest
 */

// express 的 route 函數拓展，將原本的 request 替換為上者

/**
 * @callback RouteFunction
 * @param {CompleteRequest} req
 * @param {express.Response} res
 * @param {express.NextFunction} [next]
 * @returns {void}
 */

export const Types = {}