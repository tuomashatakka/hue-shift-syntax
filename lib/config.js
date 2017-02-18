'use babel'
import fs from 'fs'
import os from 'path'
import { throttle } from 'underscore'


const PACKAGE_NAME = 'hue-shift-syntax'

const stylesheetHeader = () => `/*

  ▶︎
 ▶︎▶︎  h  u  3  \  s  H  1  F  7
   ▶︎

 ∆ author: Tuomas Hatakka
 ∆ repository: https://github.com/tuomashatakka/hue-shift-syntax/
 ∆ license: https://github.com/tuomashatakka/hue-shift-syntax/LICENSE.md */`

const stylesheetPath = os.resolve(os.join(__dirname, '..', 'conf', 'user.less'))

const generateRuleSet = (arr) => arr.map(o => generateRulesFor(o)).join('\n')

const generateLessVariableSet = (arr) => arr.map(rules => generateRulesFor({rules, indent: "@config-"})).join('\n')

const generateRulesFor = ({rules, indent, classNames}) => {
  let buffer = Object.keys(rules).reduce(
    (result, attr) => result += generateRule(attr, rules[attr], indent), "")
  if (!classNames) return buffer
  let selector = classNames.reduce(
    (result, className) => result += (result ? ', ' : '\n') + ('.' + className), "")
  return `
    ${selector} {
      ${buffer} }`
}


const generateRule = (attr, val, indent=1) => {
  if (!isNaN(parseInt(indent)))
    Array(parseInt(indent)).fill('\t')
  val = (val ? val.toJSON ? val.toJSON() : val : false)
    .toString().trim().toLowerCase().replace(/;/g, '')
  attr = attr.replace(/([^\w]+)/gi, '-')
  return `\n${indent}${attr}: ${val};`
}


const applyStylesheet = throttle((pack, output) => {
  let { path, stylesheets } = pack
  let contents = stylesheetHeader() + output

  fs.writeFile(
    stylesheetPath,
    contents,
    'utf8',
    () => {

      stylesheets.forEach(
      stylesheet => {
        let sourcePath = stylesheet[0]

        try {
          let source = atom.themes.loadLessStylesheet(sourcePath)
          let params = { sourcePath, }
          let disposable = atom.styles.addStyleSheet(
            source,
            params )
          pack.onDidDeactivate(() => disposable.dispose())
        }

        catch(e) {
          if (atom.devMode)
            console.log("Error at reading the stylesheet in", sourcePath)
        }

    })})
}, 800)


const provideConfigToLess = (rules={}) => {
  let pack = atom.packages.getLoadedPackage(PACKAGE_NAME)
  if (!pack) return
  let output = generateLessVariableSet([rules])
  setImmediate(() => applyStylesheet(pack, output))
}


const resetConfigStylesheet = () =>
  fs.writeFile(
    stylesheetPath,
    stylesheetHeader(),
    'utf8',
    () => {})

const saveState = (name) => {
  let state = atom.config.get(PACKAGE_NAME)
  let scope = `${PACKAGE_NAME}.savedState.${name}`
  delete state.savedState
  atom.config.set(scope, JSON.stringify(state))
  atom.notifications.addInfo("Preset saved - " + JSON.stringify(state), { dismissable: true })
  return name
}

const setCurrentState = (data) => {
  let scope = `${PACKAGE_NAME}.savedState`
  let savedState = atom.config.get(scope)
  let state = { ...data, savedState }
  atom.config.set(PACKAGE_NAME, state)
  return state
}

const loadState = (name, options) => {
  let { current } = options
  let scope = `${PACKAGE_NAME}.savedState.${name}`
  let state = JSON.parse(atom.config.get(scope) || "{}")

  let handle = (doSave, resolve) => {
    if (doSave && current)
      saveState(current)
    atom.notifications.addInfo("loading " + JSON.stringify(state), { dismissable: true })
    return setCurrentState(state)
  }

  return new Promise((resolve, reject) => state ? atom.confirm({
    message: "Are you sure?",
    buttons: {
      "Load": () => resolve(handle(false)),
      "Cancel": () => reject({ details: "Cancel pressed"}),
      "Save changes & load": () => resolve(handle(true)),
    }
  }) :
  reject({ details: "No data available" }))
}

export default
  provideConfigToLess


export {
  provideConfigToLess,
  resetConfigStylesheet,
  stylesheetPath,
  saveState,
  loadState,
}
