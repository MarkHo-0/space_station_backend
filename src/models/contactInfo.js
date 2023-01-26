export class ContactInfo {
  constructor(method = 0, detail = '') {
    /** @type {int} */ this.method = method
    /** @type {string} */ this.detail = detail
  }

  get isValid() {
    //TODO
    return true
  }

  toJSON() {
    //TODO
    return {}
  }
}

/** @readonly @enum {number} */
export const CONTACT_METHOD = {
  OTHER: 0,
  SCHOOL_EMAIL: 1,
  PRIVATE_EMAIL: 2,
  WHATSAPP: 3,
  TELEGTAM: 4,
  SIGNAL: 5,
  WECHAT: 6,
}