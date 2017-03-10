'use babel'
import React, { Component, prop as PropTypes } from 'react'
export default class PreviewView extends Component {
  constructor (props) {
    super(props)
    this.editor = props.editor
    this.state = { open: false }
  }

  render () {
    let { children, choices, updatePreview } = this.props
    let { open } = this.state
    return (
      <section className='syntax-preview'>

        <header className='main-header'>
          <h1>Syntax color config preview</h1>
        </header>
        <article
          ref={ref => ref ? ref.appendChild(editor) : ref}
          className='editor'>
          <div className='select grammar-select'>
            <h2><span className='icon icon-plug' /> Grammar</h2>
            <select onChange={(e) => updatePreview(e.target.value) }>
              {choices.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </article>

        <aside className='config padded'>

          {this.renderFields()}

        </aside>
      </section>
    )
  }

  renderFields () {
    let conf = atom.config.get('hue-shift-syntax')
    let sections = Object.keys(conf)
    let pack = PACKAGE_NAME

    return sections.map(section =>
          <Section
            key={section}
            scope={`${pack}.${section}`}
            />)
  }
}
