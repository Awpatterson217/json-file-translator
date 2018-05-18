const isObject = (val) => {
  if(!val)
    return false

  return (
    Object.prototype.toString.call(val) === '[object Object]'
  )
}
const isString = (val) => {
  if(!val)
    return false

  return (
    Object.prototype.toString.call(val) === '[object String]'
  )
}
const isArray = (val) => {
  if(!val)
    return false

  return (
    Object.prototype.toString.call(val) === '[object Array]'
  )
}

module.exports = {
  isObject,
  isString,
  isArray,
  log: console.log
}
