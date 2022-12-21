import { validateNonNegativeInt, validatePositiveInt } from './dataValidation.js'
import { getCurrentUnixTime } from './parseTime.js'

function cursorDecoder(base64_str, target_type) {
  if (typeof base64_str !== 'string') return null
  
  //嘗試解析 base64 密文，如失敗直接返回
  let cursor_obj;
  try { cursor_obj = JSON.parse(atob(base64_str)) } 
  catch (_) { return null }

  const type = cursor_obj['t']
  const args = cursor_obj['a']

  //如果分頁索引類別不是所需要的或沒有參數，則返回
  if (type !== target_type || !Array.isArray(args)) {
    return null
  }

  //解析完成，返回所有參數
  return args
}

export function generateCursor_Timebased(type = 0, beforeTime = 0, offset = 0) {
  return {
    't': type,
    'a': [beforeTime, offset]
  }
}

function parseCursorArgs_Timebased(beforeTime = 0, offset = 0) {
  return {
    'beforeTime': beforeTime || getCurrentUnixTime(),
    'offset': offset || 0
  }
}

export function decryptCursor_Timebased(type, base64_str) {
  //嘗試解析經加密的索引
  const args = cursorDecoder(base64_str, type)
  if (!args) return parseCursorArgs_Timebased()

  //獲取索引參數
  const beforeTime = validatePositiveInt(args[0])
  const offset = validateNonNegativeInt(args[1])
  if (!beforeTime || offset == null)
    return parseCursorArgs_Timebased()

  //返回參數
  return parseCursorArgs_Timebased(beforeTime, offset)
}

/** @readonly @enum {number} */
export const CURSOR_TYPE = {
  NEWEST: 1,
  HEATEST: 2
}