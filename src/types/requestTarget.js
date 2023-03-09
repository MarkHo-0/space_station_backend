import { Comment } from '../models/comment.js'
import { Thread } from '../models/thread.js'
import { SimpleUser } from '../models/user.js'
 
//資料庫的類型，分別有3個子模塊

 /**
 * @typedef RequestTarget
 * @property {Thread} thread
 * @property {Comment} comment
 * @property {SimpleUser} user
 */

export const Types = {}