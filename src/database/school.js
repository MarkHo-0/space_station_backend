import { Course } from '../models/school'

export class School {

   /** @type {import('mysql2/promise').Pool} @private */
   db = null

  constructor(connection) {
    this.db = connection
  }   
  
  /** @returns {Array<Course>} */
  async queryCourse(query_string = "", max_quantity = 5) {
    const [raw_courses, _] = await this.db.execute(
      "SELECT * FROM courses WHERE `code` LIKE ? OR `name` LIKE ? LIMIT ?", 
      [query_string, query_string, max_quantity.toString()]
    )

    return raw_courses.map( c => Course.fromDB(c))
  }

}
