import { ClassSwapRequest } from '../models/class_swap_request.js'

export class ClassSwap {

  constructor(connection) {
    /** @type {import('mysql2/promise').Pool} @private */
    this.db = connection
  }   

  async getRequest(id) {
    if(Number.isInteger(id) == false) return null
    const [sReqs, _] = await this.db.execute("SELECT * FROM class_swap_requests , courses WHERE `code` = `course_code` AND `id` = ?", [id])
    if (sReqs.length != 1) return null
    return ClassSwapRequest.fromDB(sReqs[0]);
  }

  async hasRequestBy(user, course_code) {
    const [sReqs, _] = await this.db.execute(
      "SELECT `id` FROM class_swap_requests WHERE `requester_uid` = ? AND `course_code` = ?",
      [user.user_id, course_code]
    )
    return sReqs.length > 0
  }

  async createRequest(course_code, curr_class, exp_class, user, contact) {
    await this.db.execute (
      "INSERT INTO class_swap_requests (`course_code`, `current_class`, `expected_class`, `requester_uid`, `contact_method`, `contact_detail`) VALUE (?, ?, ?, ?, ?, ?)", 
      [course_code, curr_class, exp_class, user.user_id, contact.method, contact.detail]
    )
    return true
  }

  async querySwappableRequests(course_code, curr_class) {
    const [sReqs, _] = await this.db.execute(
      "SELECT r1.id, `current_class` FROM class_swap_requests AS r1 RIGHT JOIN (SELECT ANY_VALUE(`id`) AS `id`, MIN(`request_on`) FROM class_swap_requests WHERE `course_code` = ? AND `expected_class` = ?  AND `responser_uid` IS NULL GROUP BY `current_class`) AS r2 ON r1.id = r2.id ORDER BY `current_class`",
      [course_code, curr_class]
    )
    return sReqs.map(r => {return {'id': r['id'], 'class_num': r['current_class']}})
  }

  /** @returns {Promise<Array<ClassSwapRequest>>}*/
  async getSwapRecords(user) {
    const [sReqs, _] = await this.db.execute(
      "SELECT * FROM class_swap_requests , courses WHERE `course_code` = `code` AND (`requester_uid` = ? OR `responser_uid` = ?)",
      [user.user_id, user.user_id]
    )
    return sReqs.map(r => ClassSwapRequest.fromDB(r))
  }

  async setResponser(id, user) {
    await this.db.execute ("UPDATE class_swap_requests SET `responser_uid` = ?, `response_on` = NOW() WHERE `id` = ?", [user.user_id, id])
    return true
  }

  async removeRequest(id){
    await this.db.execute ("DELETE FROM class_swap_requests WHERE `id` = ?", [id])
    return true
  }

  async resetRequest(request) {
    await this.db.execute("UPDATE class_swap_requests SET `responser_uid` = NULL, `response_on` = NULL, `request_on` = NOW() WHERE `id` = ?", [request.id])
    return;
  }
}
