import { Thread }  from '../database/thread.js'
import { Comment }  from '../database/comment.js'
import { User }  from '../database/user.js'
import { News }  from '../database/news.js'
import { Course } from '../database/course.js'
import { ClassSwap } from '../database/class_swap.js'

//資料庫的類型，分別有6個子模塊
 /**
 * @typedef DataBaseModel
 * @property {Thread} thread
 * @property {Comment} comment
 * @property {User} user
 * @property {News} news
 * @property {Course} course
 * @property {ClassSwap} classSwap
 */

export const Types = {}