import { ClassSwapRequest } from '../models/class_swap_request.js'

export class ClassSwap {

  constructor(connection) {
    /** @type {import('mysql2/promise').Pool} @private */
    this.db = connection
  }   

  async getRequest(id) {
    //TODO
    return ClassSwapRequest.fromDB();
  }

  async hasRequestBy(requester, course_code) {
    //TODO
    return false;
  }

  async createRequest(course_code, curr_class, exp_class, requester, contact) {
    //TODO
    return 0
  }
}
