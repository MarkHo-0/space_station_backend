
/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

import { validateString } from '../utils/dataValidation.js';

/** @type {RouteFunction} */
export function completeCourse(req, res) {
  const keyword = validateString(req.query['q'], 1, 20)
  if (!keyword) return res.status(422).send()
  
  req.db.course.queryMany(keyword)
    .then(courses => res.send({'courses': courses.map(c=> c.toJSON())}))
    .then(_ => res.status(400).send())
}