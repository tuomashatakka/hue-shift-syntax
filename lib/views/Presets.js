'use babel'

import React, { Component, prop as PropTypes } from 'react'
import { saveState, loadState, removeState } from '../config'
import Preset from '../components/Preset'
import PresetTitlePrompt from './PresetTitlePrompt'

const PACKAGE_NAME = `hue-shift-syntax`
const presetScope = `${PACKAGE_NAME}.savedState.preset`
const currentScope = `${PACKAGE_NAME}.savedState.current`

const getCurrentName = () => atom.config.get(currentScope)
const get = (name) => atom.config.get(`${presetScope}.${name}`) || atom.config.get(`${presetScope}.${getCurrentName()}`)
const presets = () => Object.keys(atom.config.get(`${presetScope}`) || { default: {}})

/**
 * @class PreviewView
 * @extends React.Component
 */
export default class PresetsView extends Component {

  constructor (props) {
    super(props)
    let current = getCurrentName() || 'default'
    this.state = {
      current,
      edited: false,
      presets: presets()
    }
    this.savePreset = this.savePreset.bind(this)
    this.loadPreset = this.loadPreset.bind(this)
    this.addPreset = this.addPreset.bind(this)
    this.update = (current) => {
      this.setState({ current, presets: presets(), edited: false })
      this.props.onChange(current)
    }
  }

  setModifiedState (modifications) {
    this.setState({ edited: modifications ? true : false })
  }

  loadPreset (current, options) {
    current = current || this.state.current
    options = {
      prompt: this.state.edited,
      ...options,
      current: getCurrentName() }
    loadState(current, options)
      .then(data => this.update(current))
  }

  savePreset (name, options) {
    name = name || this.state.current
    saveState(name, options)
    this.update(name)
  }

  addPreset () {
    let { current, edited } = this.state
    let prompt = PresetTitlePrompt({ default: current })
    prompt.on('success', (...data) =>
    {
      let current = prompt.editor.getText().trim()
      this.savePreset(current, { prompt: edited })
    })
  }

  removePreset (name) {
    removeState(name, { prompt: true })
      .then((data) => {
        this.update(this.state.current)
      })
  }

  renderPresets () {
    let { current } = this.state
    let pack = PACKAGE_NAME
    let conf = atom.config.get(presetScope) || {}
    let presets = Object.keys(conf)

    return [
      ...presets.map(section =>
        <Preset
          name={section}
          data={conf[section]}
          action={() => this.loadPreset(section)}
          active={current == section}
          key={section}
          />),
    ]
  }

  render () {
    const presets = this.renderPresets()
    return (
      <section className='syntax-presets'>
        <header className='section-header'>
          <h3>Presets</h3>
        </header>
        <aside className='btn-toolbar panel-body'>
          <div className='btn-group'>
            {presets}
          </div>
          <Preset
            name={"Add new"}
            key='add'
            action={() => this.addPreset()} />
        </aside>
      </section>
    )
  }
}
