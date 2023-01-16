export class Course {
    constructor({course_name_simpchi, course_name_tradchi, course_name_eng, course_code, cLass_quantity}) {
        /** @type {String} */ this.nameSimpchi = course_name_simpchi
        /** @type {String} */ this.nameTradchi = course_name_tradchi
        /** @type {String} */ this.nameEng = course_name_eng 
        /** @type {String} */ this.courseCode = course_code
        /** @type {number} */ this.classQuantity = cLass_quantity
        
    }
     
}