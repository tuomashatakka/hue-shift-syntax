'use babel'
import fs from 'fs'
import os from 'path'
import { throttle } from 'underscore'


const PACKAGE_NAME = 'hue-shift-syntax'
const scopeBase = `${PACKAGE_NAME}.savedState`

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
  val = (val ? val.toJSON ? val.toJSON() : val : 0)
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

const notify = (name, data="") => {
  let description = data ? JSON.stringify(data) : null
  atom.notifications.addSuccess(name, {
    description,
    dismissable: false })
}

const saveState = (name='default') => {
  let state = atom.config.get(PACKAGE_NAME)
  let scope = `${PACKAGE_NAME}.savedState.preset.${name}`
  delete state.savedState
  atom.config.set(scope, JSON.stringify(state))
  notify(name + " saved")
  loadState(name)
  return name
}

const setCurrentState = (name='default', data) => {
  let scope = `${scopeBase}`
  let savedState = atom.config.get(scope)
  savedState.current = name
  let state = { ...data, savedState }
  notify(name + " set as current state")
  atom.config.set(PACKAGE_NAME, state)
  return state
}

const removeState = (name, options={}) => {
  name = name || atom.config.get(`${scopeBase}.current`)
  let scope = `${scopeBase}.preset.${name}`
  let presets = atom.config.get(scope)
  console.log(presets)
  if (name === 'default')
    return new Promise((_, reject) => reject("Can't remove default preset"))

  return new Promise(
    (resolve, reject) => atom.confirm({
      message: "Are you sure?",
      detailedMessage: "You're about to delete the preset named " + name + " - this is undoable",
      buttons: {
        "Delete": () => {
          notify(name + " removed")
          atom.config.unset(scope)
          resolve()
        },
        "Cancel": () => reject({ details: "Cancel pressed"}),
      }
    })
  )
}

const loadState = (name='default', options) => {
  let { current } = options || { current: 'default' }
  let scope = `${scopeBase}.preset.${name}`
  let state = JSON.parse(atom.config.get(scope) || "{}")

  let handle = (doSave) => {
    if (doSave && current)
      saveState(current)
    notify(name + " loaded")
    return setCurrentState(name, state)
  }

  if (!options || !options.prompt)
    return new Promise(resolve => resolve(handle(false)))
  return new Promise((resolve, reject) => state ? atom.confirm({
    message: "Are you sure?",
    detailedMessage: "The current preset has unsaved modifications",
    buttons: {
      "Load": () => resolve(handle(false)),
      "Cancel": () => reject({ details: "Cancel pressed"}),
      "Save changes & load": () => resolve(handle(true)),
    }
  }) : reject({ details: "No data available" }))
}

export default
  provideConfigToLess


export {
  provideConfigToLess,
  resetConfigStylesheet,
  stylesheetPath,
  saveState,
  loadState,
  removeState,
}
