/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

//統一驗證留言編號函數

/** @type {RouteFunction} */
export default function validate(req, res, next) {
  const comment_id = parseInt(req.params['cid'])

  if (isNaN(comment_id) || comment_id < 1) {
    return res.status(404).send('Comment ID Invalid.')
  }

  req.db.comment.getOne(comment_id).then( c => {
    req.target.comment = c
    next()
  }).catch( e => {
    res.status(404).send('Thread Not Found.')
  })
}