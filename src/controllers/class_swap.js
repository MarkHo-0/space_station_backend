import { validateContactInfo, validateCourseCode, validatePositiveInt } from "../utils/dataValidation.js";

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function searchSwapRequest(req, res) {
  //校驗科目代號
  const code = validateCourseCode(req.query['course_code'])
  const course = await req.db.course.getOne(code)
  if (!course) return res.status(422).send('Invalid Course Code')

  //校驗班級編號
  const current_class = validatePositiveInt(req.query['current_class_num'])
  if(course.isClassValid(current_class) == false) {
    return res.status(422).send('Invalid Class Number')
  }

  //如果該科目用戶已發佈該科目的互換請求，則不能再搜索
  if (await req.db.classSwap.hasRequestBy(req.user, code)) {
    return res.status(460).send('This course had already been requested by you.')
  }

  //在資料庫進行搜索
  req.db.classSwap.querySwappableRequests(code, current_class)
    .then(sReqs => res.send({course: course.toJSON(), requests: sReqs}))
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export function viewSwapRecords(req, res) {
  req.db.classSwap.getSwapRecords(req.user)
    .then(reqs => res.send({'requests': reqs.map(r => r.toJSON())}))
    .catch(_ => res.status(400).send(_))
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
  if (!course.isClassValid(current_class) || !course.isClassValid(expected_class) || current_class == expected_class) {
    return res.status(422).send('Invalid Class Number')
  }

  //校驗聯絡資料
  const contact = validateContactInfo(req.body.contact)
  if (!contact) return res.status(422).send('Invalid Contact Info')

  //檢查是否已有相同交換請求
  if (await req.db.classSwap.hasRequestBy(req.user, code)) {
    return res.status(460).send('This course had already been requested by you.')
  }

  //寫入資料庫
  req.db.classSwap.createRequest(code, current_class, expected_class, req.user, contact)
    .then(() => res.send())
    .catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function removeSwapRequest(req, res) {
  //檢查互換請求是否存在
  const swap_request = await req.db.classSwap.getRequest(req.params['id'])
  if (swap_request == null) return res.status(404).send()

  //只有屬於用戶自己的請求才可進行刪除
  if (swap_request.isRequestBy(req.user) == false) return res.status(403).send()

  //在資料庫中刪除該項請求
  req.db.classSwap.removeRequest(request_id)
    .then(() => res.send())
    .catch(() => res.status(400).send())  
}

/** @type {RouteFunction} */
export async function performSwap(req, res) {
  const request_id = validatePositiveInt(req.body['request_id'])
  const swap_request = await req.db.classSwap.getRequest(request_id)

  //檢查互換請求是否存在
  if (swap_request == null) return res.status(404).send()

  //不可以與自己發佈的請求進行互換
  if (swap_request.isRequestBy(req.user)) return res.status(400).send("you can't swap with yourself.")

  //檢查請求是否還可互換
  if (swap_request.isSwapped) return res.status(400).send("This request is closed.")

  //更新資料庫
  req.db.classSwap.setResponser(request_id, req.user)
    .then(() => res.send(swap_request.toJSON()))
    .catch(() => res.status(400).send())  
}

/** @type {RouteFunction} */
export async function repostSwapRequest(req, res) {
  //檢查互換請求是否存在
  const swap_request = await req.db.classSwap.getRequest(req.params['id'])
  if (swap_request == null) return res.status(404).send()

  //只有屬於用戶自己的請求才可進行重新發佈
  if (swap_request.isRequestBy(req.user) == false) return res.status(403).send()

  //只有已進行過互換的請求才可重新發佈
  if (swap_request.isSwapped == false) return res.status(460).send()

  //更新資料庫
  req.db.classSwap.resetRequest(swap_request)
    .then(_ => res.send())
    .catch(_ => res.status(400).send())
}


