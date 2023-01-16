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
    
  async get (faculty_id) {
    const [faculty_id] = await this.db.execute(
      "SELECT * FROM faculties WHERE =%?%", [faculty_id]
    )
    if (raw_thread.length !== 1) return null
    return threadFormDB(raw_thread[0])

    async getclnum (faculty_id) {
      const [faculty_id] = await this.db.execute(
        "SELECT * FROM faculties WHERE =%?%", [faculty_id]
      )
      if (raw_thread.length !== 1) return null
      return threadFormDB(raw_thread[0])
      
    }
      


   

       
