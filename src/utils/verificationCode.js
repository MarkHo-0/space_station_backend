export function generate() {
  return Math.floor(1000 + Math.random() * 9000)
}

/** @param {Number} vf_code */
export function isValid(vf_code) {
  return Number.isInteger(vf_code) && vf_code >= 1000 && vf_code <= 9999
}