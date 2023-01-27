import { validateContactInfo, validateCourseCode, validateInteger } from "../utils/dataValidation";

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export function getStatus(req, res) {
}

/** @type {RouteFunction} */
export async function searchSwapRequest(req, res) {
}

/** @type {RouteFunction} */
export function viewSwapRequests(req, res) {

}

/** @type {RouteFunction} */
export async function postSwapRequest(req, res) {
  //校驗科目代號
  const code = validateCourseCode(req.body['course_code'])
  const course = await req.db.course.getOne(code)
  if (!course) return res.status(422).send('Invalid Course Code')

  //校驗班級編號
  const current_class = req.body['current_class_num']
  const expected_class = req.body['expected_class_num']
  if (!course.isClassValid(current_class) || !course.isClassValid(expected_class)) {
    return res.status(422).send('Invalid Class Number')
  }

  //校驗聯絡資料
  const contact = validateContactInfo(req.body)
  if (!contact) return res.status(422).send('Invalid Contact Info')

  //檢查是否已有相同交換請求
  if (await req.db.classSwap.hasRequestBy(req.user, code)) {
    return res.status(400).send('This course had already been requested.')
  }

  //寫入資料庫
  req.db.classSwap.createRequest(code, current_class, expected_class, req.user, contact)
    .then( request_id => res.send(request_id))
    .catch(e => res.status(400).send('Failed to write to database.'))
}

/** @type {RouteFunction} */
export function removeSwapRequest(req, res) {

}

/** @type {RouteFunction} */
export function performSwap(req, res) {

}


