'use babel'

import React, { Component, prop as PropTypes } from 'react'
import { saveState, loadState } from '../config'
import Preset from '../components/Preset'
import PresetTitlePrompt from './PresetTitlePrompt'

const PACKAGE_NAME = `hue-shift-syntax`


/**
 * @class PreviewView
 * @extends React.Component
 */
export default class PresetsView extends Component {

  constructor (props) {
    super(props)
    this.state = {
      current: props.current || 'default',
    }
    this.savePreset = this.savePreset.bind(this)
    this.loadPreset = this.loadPreset.bind(this)
    this.addPreset = this.addPreset.bind(this)
  }

  loadPreset (current) {
    let { onChange } = this.props
    let options = { current: this.state.current }
    loadState(current, options).then(data => {
      this.setState({ current })
      onChange(current)
    })
  }

  savePreset (name) {
    saveState(name)
  }

  addPreset () {
    let { current } = this.state
    let prompt = PresetTitlePrompt({ default: current })
    prompt.on('success', (...data) =>
    {
      let current = prompt.editor.getText().trim()
      console.log(current)
      this.setState({ current })
      this.savePreset(current)
    })
  }

  renderPresets () {
    let { current } = this.state
    let pack = PACKAGE_NAME
    let conf = atom.config.get('hue-shift-syntax.savedState')
    let sections = Object.keys(conf)

    return [
      ...sections.map(section =>
        <Preset
          name={section}
          data={conf[section]}
          action={() => this.loadPreset(section)}
          active={current == section}
          key={section}
          />),
      <Preset
        name={"Save"}
        key='save'
        action={() => this.savePreset(current)} />,
      <Preset
        name={"Add new"}
        key='add'
        action={() => this.addPreset()} />,
    ]
  }

  render () {
    return (
      <section className='syntax-presets'>
        <header className='section-header'>
          <h1>Presets</h1>
        </header>
        <aside className='config padded btn-toolbar'>
          {this.renderPresets()}
        </aside>
      </section>
    )
  }
}
