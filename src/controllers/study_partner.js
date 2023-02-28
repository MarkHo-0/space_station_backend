import { validateContactInfo, validateCourseCode, validateDiscription, validateGrade, validateInteger, validatePositiveInt, validateString } from "../utils/dataValidation.js";
/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function searchStudyPartnerResearch(req, res) {
    const keyword = validateString(req.body['keyword'],1,10)
    req.db.studyPartner.searchPost(keyword)
    .then(sReqs => res.send({course: course.toJSON(), Postss: sReqs}))
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function postStudyPartnerPosts(req, res) {
    //校驗科目代號
    const code = validateCourseCode(req.body['course_code'])
    const course = await req.db.course.getOne(code)
    if (!course) return res.status(422).send('Invalid Course Code')
  
    const contact = validateContactInfo(req.body)
    if (!contact) return res.status(422).send('Invalid Contact Info')

    const publisher_uid = req.user.user_id
    const aimed_Grade = validateGrade(req.body['aimed_grade'])
    const discription = validateDiscription(req.body['discription'])
    if(!aimed_Grade) return res.status(422).send('Invalid or missing aimed grade')
    if(!discription) return res.status(422).send('Invalid or missing discription')
  //寫入資料庫
  req.db.studyPartner.createPost(publisher_uid, contact, course, aimed_Grade, discription)
    .then(() => res.send())
    .catch(() => res.status(400).send())
}

export async function editStudyPartnerPosts(req, res) {


}

/** @type {RouteFunction} */
export async function removeStudyPartnerPosts(req, res) {
    const post_id = validatePositiveInt(req.params['id'])
    const post = await req.db.studyPartner.getPost(post_id)
  
    //檢查互換請求是否存在
    if (post == null) return res.status(404).send()
  
    //只有屬於用戶自己的請求才可進行刪除
    if (post.isPostsBy(req.user) == false) return res.status(403).send()
  
    //在資料庫中刪除該項請求
    req.db.studyPartner.removePost(post_id)
      .then(() => res.send())
      .catch(() => res.status(400).send())  
  }
