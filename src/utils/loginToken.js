import { createHash } from 'crypto'

export function generateToken(sid = 0) {
  //加載秘鑰
  const privateKey = process.env['P_KEY'] || 'test_private_key'
  //合拼原文
  const fullText = sid.toString() + Date.now().toString() + privateKey
  //使用 SHA512 生成令牌
  const token = createHash('sha512').update(fullText, 'utf-8').digest('hex')
  return token
}