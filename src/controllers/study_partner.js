import { validateContactInfo, validateCourseCode, validatePositiveInt } from "../utils/dataValidation.js";
/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function searchStudyPartnerResearch(req, res) {
    const code = validateCourseCode(req.query['course_code'])
    const course = await req.db.course.getOne(code)
    if (!course) return res.status(422).send('Invalid Course Code')

    req.db.classSwap.querySwappableRequests(code, current_class)
    .then(sReqs => res.send({course: course.toJSON(), requests: sReqs}))
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function postStudyPartnerRequest(req, res) {
    //校驗科目代號
    const code = validateCourseCode(req.body['course_code'])
    const course = await req.db.course.getOne(code)
    if (!course) return res.status(422).send('Invalid Course Code')
  
    const contact = validateContactInfo(req.body)
    if (!contact) return res.status(422).send('Invalid Contact Info')

  //寫入資料庫
  req.db.classSwap.createRequest(publish_id, publisher_uid, contact, course, aimed_Grade, discription)
    .then(() => res.send())
    .catch(() => res.status(400).send())
}


/** @type {RouteFunction} */
export async function removeStudyPartnerRequest(req, res) {
    const request_id = validatePositiveInt(req.params['id'])
    const swap_request = await req.db.classSwap.getRequest(request_id)
  
    //檢查互換請求是否存在
    if (swap_request == null) return res.status(404).send()
  
    //只有屬於用戶自己的請求才可進行刪除
    if (swap_request.isRequestBy(req.user) == false) return res.status(403).send()
  
    //在資料庫中刪除該項請求
    req.db.classSwap.removeRequest(request_id)
      .then(() => res.send())
      .catch(() => res.status(400).send())  
  }
