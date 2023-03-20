import { validateInteger, validateString } from "../utils/dataValidation.js";

export class ContactInfo {
  constructor(method = 0, detail = '') {
    /** @type {int} */ this.method = method
    /** @type {string} */ this.detail = detail
  }
  
  toJSON() {
    return {
      method: this.method,
      detail: this.detail
    }
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