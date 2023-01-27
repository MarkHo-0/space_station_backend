import { validateInteger, validateString } from "../utils/dataValidation";

export class ContactInfo {
  constructor(method = 0, detail = '') {
    /** @type {int} */ this.method = validateInteger(method, 0, 6)
    /** @type {string} */ this.detail = detail
  }

  get isValid() {
    if (typeof this.method != 'number') return false
    /** @type {RegExp} */  let validator = null;

    switch (this.method) {
      case C_METHOD.SCHOOL_EMAIL:
        this.detail = ''
        return true
      case C_METHOD.PRIVATE_EMAIL:
        validator = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        break
      case C_METHOD.WHATSAPP:
        validator = /^\+852\s[2-9][0-9]{7}|\++86\s1[0-9]{10}|\+886\s((?=(09))[0-9]{10})$/
        break
    }

    if (validator == null) {
      return validateString(this.detail, 1, 20) != null
    }
    return validator.test(this.detail)
  }

  toJSON() {
    //TODO
    return {}
  }
}

/** @readonly @enum {number} */
export const C_METHOD = {
  OTHER: 0,
  SCHOOL_EMAIL: 1,
  PRIVATE_EMAIL: 2,
  WHATSAPP: 3,
  TELEGTAM: 4,
  SIGNAL: 5,
  WECHAT: 6,
}