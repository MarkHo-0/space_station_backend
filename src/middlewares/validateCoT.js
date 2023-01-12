/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

import { validatePositiveInt } from '../utils/dataValidation.js'

/** @type {RouteFunction} */
export async function validateComment(req, res, next) {
  const comment_id = validatePositiveInt(req.params['cid'])

  if (!comment_id) {
    return res.status(404).send('Comment ID Invalid.')
  }

  const comment = await req.db.comment.getOne(comment_id, req.user.user_id)

  if (!comment || comment.isHidden) {
    return res.status(404).send('Comment not Found or Unavailable.')
  }

  req.target = {comment}
  next()
}

/** @type {RouteFunction} */
export async function validateThread(req, res, next) {
  const thread_id = validatePositiveInt(req.params['tid'])

  if (!thread_id) {
    return res.status(404).send('Thread ID Invalid.')
  }

  const thread = await req.db.thread.getOne(thread_id)

  if (!thread || thread.isHidden) {
    return res.status(404).send('Thread not Found or Unavailable.')
  }

  req.target = {thread}
  next()
}