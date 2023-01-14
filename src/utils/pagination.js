import { validateNonNegativeInt, validatePositiveInt } from './dataValidation.js'
import { getCurrentUnixTime } from './parseTime.js'

class Cursor {

  /** @private */
  static _toBase64(args = []) {
    return btoa(JSON.stringify(args))
  }

  /** @private */
  static _tryParseArgs(base64_str = '') {
    if (typeof base64_str !== 'string') return []
  
    //嘗試解析 base64 密文，如失敗直接返回
    let args
    try { args = JSON.parse(atob(base64_str)) } 
    catch (_) { return [] }

    //如果分頁索引類別不是所需要的或沒有參數，則返回
    if (!Array.isArray(args)) {
      return []
    }
    
    //解析完成，返回所有參數
    return args
  }
}

export class PointerCursor extends Cursor {
  constructor(pointer = 0) {
    super()
    /** @type {number} */ this.pointer = validateNonNegativeInt(pointer) || 0
  }

  updatePointer(pointer = 0) {
    this.pointer = pointer
  }
}

export class OffsetedCursor extends Cursor {

  constructor(offset = 0) {
    super()
    /** @type {number} */ this.offset = validateNonNegativeInt(offset) || 0
  }

  toBase64() {
    return Cursor._toBase64(([this.offset]))
  }

  increaseOffset(count = 0) {
    this.offset += count
    return this
  }

  static fromBase64(base64_str = '') {
    const args = this._tryParseArgs(base64_str)
    return new TimebasedCursor(args[0])
  }
}


export class TimebasedCursor extends OffsetedCursor {

  constructor(beforeTime = 0, offset = 0) {
    super(offset)  
    /** @type {number} */ this.beforeTime = validatePositiveInt(beforeTime) || getCurrentUnixTime()
  }

  toBase64() {
    return Cursor._toBase64(([this.beforeTime, this.offset]))
  } 

  static fromBase64(base64_str = '') {
    const args = this._tryParseArgs(base64_str)
    return new TimebasedCursor(args[0], args[1])
  }
}