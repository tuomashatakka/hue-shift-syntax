'use babel'
import React, { Component, prop as PropTypes } from 'react'
import PresetList from './Presets'
import Section from './Section'

const PACKAGE_NAME = `hue-shift-syntax`


/**
 * @class PreviewView
 * @extends React.Component
 */
export default class PreviewView extends Component {

  constructor (props) {
    super(props)
    this.editor = props.editor
    this.state = {
      open: false,
      edited: false,
      sections: this.renderFields(),
    }
  }

  updateSections () {
    this.setState({ sections: [] })
    this.setState({ sections: this.renderFields() })
  }

  renderFields () {
    let { main, modifiers, filter, fine } = atom.config.get(PACKAGE_NAME)
    let conf = { main, modifiers, filter, fine }
    let sections = Object.keys(conf)
    return sections.map(section =>
      <Section
        key={section}
        scope={`${PACKAGE_NAME}.${section}`}
        onDidUpdateField={() => this.presets && this.presets.setModifiedState(true)}
        />)
  }

  render () {
    let { children, choices, updatePreview } = this.props
    let { open, sections, edited } = this.state
    let editor = this.editor.getElement()
    return (
      <section className='syntax-preview'>

        <header
          className='main-header'>
          <h1>Syntax color configuration preview</h1>
        </header>

        <article
          className='editor'
          ref={ref => ref ? ref.appendChild(editor) : ref}>
          <div className='select grammar-select'>
            <h2><span className='icon icon-plug' /> Grammar</h2>
            <select defaultValue='source.js' onChange={(e) => { updatePreview(e.target.value) }}>
              {choices.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </article>

        <aside className='config padded'>

          <section className='section colors-section'>
            <main>

              <div className="color inverse secondary circle" />
              <div className="color inverse secondary-half circle" />
              <div className="color inverse primary circle" />
              <div className="color inverse tertiary-half circle" />
              <div className="color inverse tertiary circle" />
              <div className="color inverse backface circle" />
            </main>

            <section className='sub-section color-variants-section'>

              <div className="color inverse secondary variant lighter circle" />
              <div className="color inverse secondary variant light circle" />
              <div className="color inverse secondary variant circle" />
              <div className="color inverse secondary variant dark circle" />
              <div className="color inverse secondary variant darker circle" />
              <div className="color inverse secondary variant sub circle" />

              <div className="color inverse primary variant lighter circle" />
              <div className="color inverse primary variant light circle" />
              <div className="color inverse primary variant circle" />
              <div className="color inverse primary variant dark circle" />
              <div className="color inverse primary variant darker circle" />
              <div className="color inverse primary variant sub circle" />

              <div className="color inverse tertiary variant lighter circle" />
              <div className="color inverse tertiary variant light circle" />
              <div className="color inverse tertiary variant circle" />
              <div className="color inverse tertiary variant dark circle" />
              <div className="color inverse tertiary variant darker circle" />
              <div className="color inverse tertiary variant sub circle" />
            </section>
          </section>

          <section className='section presets-section'>
            <PresetList
              ref={ref => this.presets = this.presets || ref}
              onChange={(name) => {
                this.updateSections()
                this.forceUpdate()
              }} />
          </section>

          {sections}

          <section
            className='config-controls section btn-toolbar'>
            <div className='btn-group'>
              <button className='btn' onClick={() => this.presets.savePreset()}>Save</button>
              <button className='btn' onClick={() => this.presets.addPreset()}>Save as...</button>
              <button className='btn' onClick={() => this.presets.loadPreset()}>Reset</button>
            </div>
            <div className='btn-group'>
              <button className='btn' onClick={() => this.presets.removePreset()}>Remove</button>
              <button className='btn' onClick={() => atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow()}>Close</button>
            </div>
          </section>

        </aside>
      </section>
    )
  }
}
