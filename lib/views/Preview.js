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
      open: false
    }
  }

  renderFields () {
    let { main, modifiers, filter } = atom.config.get('hue-shift-syntax')
    let conf = { main, modifiers, filter }
    let sections = Object.keys(conf)
    let pack = PACKAGE_NAME
    return sections.map(section =>
      <Section
        key={section}
        scope={`${pack}.${section}`}
        />)
  }

  render () {
    let { children, choices, updatePreview } = this.props
    let { open } = this.state
    let editor = this.editor.getElement()
    // <option value='source.js'>Javascript</option>
    // <option value='source.css'>Cascading stylesheets</option>
    // <option value='source.html'>Hypertext markup lingo</option>
    // <option value='source.python'>Python (not the animal)</option>
    // <option value='source.php'>PHP</option>
    // <option value='source.java'>Java</option>
    // <option value='source.c'>C++</option>
    // <option value='source.git'>Git diff</option>
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
            <select onChange={(e) => {console.log(e.target, e.target.value); updatePreview(e.target.value) }}>
              {choices.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </article>

        <aside className='config'>

          <section className='section presets-section'>
            <PresetList current={null} onChange={() => this.forceUpdate()} />
          </section>

          {this.renderFields()}

        </aside>
      </section>
    )
  }
}
