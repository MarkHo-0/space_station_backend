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
    return new Course({
      course_name: d['name'],
      course_code: d['code'],
      min_class_num: d['min_class_num'],
      max_class_num: d['max_class_num']
    })
  }

  toJSON() {
    return {
      code: this.code,
      name: this.name,
      min_class_num: this.minClassNum,
      max_class_num: this.maxClassNum
    }
  }
}