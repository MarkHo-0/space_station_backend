export class Course {
  constructor({ course_name, course_code, min_class_num, max_class_num }) {
    /** @type {String} */ this.code = course_code
    /** @type {String} */ this.name = course_name 
    /** @type {number} */ this.minClassNum = min_class_num
    /** @type {number} */ this.maxClassNum = max_class_num
  }

  isClassValid(class_num) {
    if (typeof class_num != 'number') return false
    return class_num >= this.minClassNum && class_num <= this.maxClassNum
  }
     
  static fromDB(d) {
    //TODO
    return new Course()
  }

  toJSON() {
    //TODO
    return {}
  }
}