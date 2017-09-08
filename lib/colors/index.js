'use babel'
import Color from './Color'

const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

const rgbToHex = (...args) => {
  let stream = '#'
  console.info(args)
  if (args.length === 1) {
    let { red, green, blue } = args[0]
    args = [red, green, blue]
  }
  console.info(args)
  for (let val of args) {
    let minor = val % 16
    let major = (val - minor) / 16
    stream += hex[major].toString() + hex[minor].toString()
  }
  return stream
}

const resolveHexString = (col) => {

  let arr = Array.from(col.substr(1))
  let red   = arr.splice(0, 2)
  let green = arr.splice(0, 2)
  let blue  = arr.splice(0, 2)

  let char  = x => {
    let i = hex.findIndex(
      o => o == x.toString().toLowerCase());
    return i === -1 ? 0 : i
  }

  let digest = d => {
    let x = 1, r = 0, c
    while((c = d.pop())) {
      r += char(c) * x
      x *= 16 }
      return r }

  return {
    red: digest(red),
    green: digest(green),
    blue: digest(blue),
    alpha: 1 }
}

export {
  resolveHexString,
  rgbToHex,
  Color
}
