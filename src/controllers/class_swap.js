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
  const course = await req.db.school.getCourse(code)
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
}

/** @type {RouteFunction} */
export function removeSwapRequest(req, res) {

}

/** @type {RouteFunction} */
export function performSwap(req, res) {

}


