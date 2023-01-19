export class Data {

   /** @type {import('mysql2/promise').Pool} @private */
   db = null

    constructor(connection) {
        this.db = connection
      }
    
    
    
    async getFaculty (faculty_id) {
    const [faculty_id] = await this.db.execute(
      "SELECT * FROM faculties WHERE =%?%", [faculty_id]
    )
    if (raw_thread.length !== 1) return null
    return threadFormDB(raw_thread[0])
  }
    
  async getCourseCode (course_Code) {
    const [course_Code] = await this.db.execute(
      "SELECT * FROM course_Code WHERE =%?%", [course_Code]
    )
    if (raw_thread.length !== 1) return null
    return threadFormDB(raw_thread[0])
    }

    async getclnum (class_number) {
      const [class_number] = await this.db.execute(
        "SELECT * FROM class_number WHERE =%?%", [class_number]
      )
      if (raw_thread.length !== 1) return null
      return threadFormDB(raw_thread[0])
      
    }

  }
