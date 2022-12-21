export function jsDate2unixTime(jsDate) {
  if (jsDate instanceof Date == false) return 0
  return parseInt(jsDate.getTime() / 1000)
}

export function getCurrentUnixTime() {
  return parseInt(Date.now() / 1000)
}