import { Thread }  from '../database/thread.js'
import { Comment }  from '../database/comment.js'
import { User }  from '../database/user.js'
import { News }  from '../database/news.js'
import { Data } from '../database/data.js'
//資料庫的類型，分別有3個子模塊

 /**
 * @typedef DataBaseModel
 * @property {Thread} thread
 * @property {Comment} comment
 * @property {User} user
 * @property {News} news
 * @property {Data} data
 */

export const Types = {}