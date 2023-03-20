import { validatePositiveInt, validateString, validateStudyPartnerPostData } from "../utils/dataValidation.js";
import { OffsetedCursor } from "../utils/pagination.js";
/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function getPosts(req, res) {
  const keyword = validateString(req.query['q'], 1, 20)
  const cursor = OffsetedCursor.fromBase64(req.query['cursor'])

  req.db.studyPartner.getPosts(keyword, 10, cursor)
    .then(posts => res.send({
      'posts': posts.map(p => p.toJSON()),
      'continuous': posts.length < 10 ? '' : cursor.increaseOffset(posts.length).toBase64()
    }))
    .catch((e) => res.status(400).send(e))
}

/** @type {RouteFunction} */
export async function postStudyPartnerPost(req, res) {
  //校驗科目代號
  const {course_code, aimed_grade, description, contact} = validateStudyPartnerPostData(req.body)
  const course = await req.db.course.getOne(course_code)
  if (!course || aimed_grade == null || !description || !contact) {
    return res.status(422).send()
  }

  //寫入資料庫
  req.db.studyPartner.createPost(req.user, course, aimed_grade, description, contact)
    .then(() => res.send())
    .catch((e) => res.status(400).send(e))
}

/** @type {RouteFunction} */
export async function editStudyPartnerPost(req, res) {
  //檢查貼文是否存在
  const post_id = validatePositiveInt(req.params['id'])
  const has_post = req.db.studyPartner.isPostBelongsToUser(post_id, req.user)
  if (has_post == false) return res.status(404).send()

  const {course_code, aimed_grade, description, contact } = validateStudyPartnerPostData(req.body)
  const course = await req.db.course.getOne(course_code)
  if (!course || aimed_grade == null || !description || !contact) {
    return res.status(422).send()
  }

  req.db.studyPartner.editPost(post_id, course, aimed_grade, description, contact)
    .then(() => res.send())
    .catch((e) => res.status(400).send(e))  
}

/** @type {RouteFunction} */
export async function removeStudyPartnerPost(req, res) {
  //檢查貼文是否存在
  const post_id = validatePositiveInt(req.params['id'])
  const has_post = await req.db.studyPartner.isPostBelongsToUser(post_id, req.user)
  if (has_post == false) return res.status(404).send()

  //在資料庫中刪除該項貼文
  req.db.studyPartner.removePost(post_id)
    .then(() => res.send())
    .catch(e => res.status(400).send(e))  
}

/** @type {RouteFunction} */
export async function viewPostRecords(req, res) {
  req.db.studyPartner.getPostsByUser(req.user)
    .then(posts => res.send({'posts': posts.map(p => p.toJSON())}))
    .catch(e => res.status(400).send(e))
}
