import { ClassSwapRequest } from '../models/class_swap_request.js'

export class ClassSwap {

  constructor(connection) {
    /** @type {import('mysql2/promise').Pool} @private */
    this.db = connection
  }   

  async getRequest(id) {
    await this.db.execute ( "SELECT `id`, FROM class_swap WHERE `id` = ? ")
    return ClassSwapRequest.fromDB();
  }

  async hasRequestBy(requester, course_code) {
    await this.db.execute ( "SELECT `requester`, `course_code` FROM  class_swap WHERE `requester` = ? , AND `course_code` = ? "
    )       
    return false;
  }

  async createRequest(course_code, curr_class, exp_class, requester, contact) {
    await this.db.execute ( "INSERT INTO (`course_code`, `curr_class`, `exp_class`, `requester`, `contact`) VALUE (?, ?, ?, ?, ?)", 
      [course_code, curr_class, exp_class, requester, contact]
    )
    return true
  }

  async removeSwapRequest(id){
    await this.db.execute ("DELETE FROM class_swap_request WHERE `id` = ?"
    [id])
    
    return true
  }



  async performSwap(id, class_num) {
    await this.db.execute ("SELECT * FROM class_swap_request WHERE course_code = course_code AND exp_class = my_class GROUP BY current_class "
    [id, class_num])

    return true
  }



}
