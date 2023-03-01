import { validateContactInfo, validateCourseCode, validateDiscription, validateGrade, validateInteger, validatePositiveInt, validateString, validateStudyPartnerPostData } from "../utils/dataValidation.js";
/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function searchStudyPartnerPosts(req, res) {
  const keyword = validateString(req.body['keyword'],1,10)
  if (!keyword) return res.status(422).send()

  req.db.course.queryMany(keyword)
    .then(courses => req.db.studyPartner.searchPosts(keyword, courses))
    .then(posts => res.send({posts: posts}))
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function postStudyPartnerPost(req, res) {
  //校驗科目代號
  const code = validateCourseCode(req.body['course_code'])
  const course = await req.db.course.getOne(code)
  if (!course) return res.status(422).send('Invalid Course Code')

  const aimed_Grade = validateGrade(req.body['aimed_grade'])
  if(!aimed_Grade) return res.status(422).send('Invalid or missing aimed grade')

  const discription = validateDiscription(req.body['discription'])
  if(!discription) return res.status(422).send('Invalid or missing discription')

  const contact = validateContactInfo(req.body)
  if (!contact) return res.status(422).send('Invalid Contact Info')

  //寫入資料庫
  req.db.studyPartner.createPost(req.user.user_id, contact, course, aimed_Grade, discription)
    .then(() => res.send())
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function editStudyPartnerPost(req, res) {
  //檢查貼文是否存在
  const post_id = validatePositiveInt(req.params['id'])
  const has_post = req.db.studyPartner.isPostBelongsToUser(post_id, req.user)
  if (has_post == false) return res.status(404).send()

  const {course_code, aimed_grade, discription, contact } = validateStudyPartnerPostData(req.body)
  if (!course_code || !aimed_grade || !discription || !contact) return res.status(422)

  //校驗科目代號
  const course = req.db.course.getOne(course_code)
  if (!course) return res.status(422).send('Invalid Course Code')

  req.db.studyPartner.editPost(course, aimed_grade, discription, contact)
    .then(() => res.send())
    .catch(() => res.status(400).send())  
}

/** @type {RouteFunction} */
export async function removeStudyPartnerPost(req, res) {
  //檢查貼文是否存在
  const post_id = validatePositiveInt(req.params['id'])
  const has_post = req.db.studyPartner.isPostBelongsToUser(post_id, req.user)
  if (has_post == false) return res.status(403).send()

  //在資料庫中刪除該項貼文
  req.db.studyPartner.removePost(post_id)
    .then(() => res.send())
    .catch(() => res.status(400).send())  
}
