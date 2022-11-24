 import { Request, Response, NextFunction } from 'express'
 import { DataBaseModel } from './database.js'
 import { User } from '../models/user.js'
 
// express 的 request 拓展，加入了資料庫入口和用戶資料

 /**
 * @typedef {Object} ChildType
 * @property {DataBaseModel} db
 * @property {User} [user]
 * @typedef {Request & ChildType} CompleteRequest
 */

// express 的 route 函數拓展，將原本的 request 替換為上者

/**
 * @callback RouteFunction
 * @param {CompleteRequest} req
 * @param {Response} res
 * @param {NextFunction} [next]
 * @returns {void}
 */

export const Types = {}