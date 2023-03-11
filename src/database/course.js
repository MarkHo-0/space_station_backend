import { Course as CourseModel } from '../models/course.js'

export class Course {

  constructor(connection) {
    /** @type {import('mysql2/promise').Pool} @private */
    this.db = connection
  }   
  
  /** @returns {Promise<Array<CourseModel>>} */
  async queryMany(query_string = "", max_quantity = 5) {
    query_string = '%' + query_string.toLocaleLowerCase() + '%'
    const [raw_courses, _] = await this.db.execute(
      "SELECT * FROM courses WHERE `code` LIKE ? OR LOWER(`name`) LIKE ? LIMIT ?", 
      [query_string, query_string, max_quantity.toString()]
    )
    return raw_courses.map( c => CourseModel.fromDB(c))
  }

  async getOne(code) {
    if (typeof code != 'string') return null

    const [raw_course, _] = await this.db.execute(
      "SELECT * FROM courses WHERE `code` = ?", [code]
    )

    if (raw_course.length != 1) return null
    return CourseModel.fromDB(raw_course[0]);
  }

}
