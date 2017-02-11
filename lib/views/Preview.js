'use babel'
import React, { Component, prop as PropTypes } from 'react'
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
    let conf = atom.config.get('hue-shift-syntax')
    let sections = Object.keys(conf)
    let pack = PACKAGE_NAME

    return sections.map(section =>
          <Section
            key={section}
            scope={`${pack}.${section}`}
            />)
  }

  render () {
    let { children } = this.props
    let { open } = this.state

    let editor = this.editor.getElement()

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
            <select>
              <option value='source.js'>Javascript</option>
              <option value='source.css'>Cascading stylesheets</option>
              <option value='source.html'>Hypertext markup lingo</option>
              <option value='source.python'>Python (not the animal)</option>
              <option value='source.php'>PHP</option>
              <option value='source.java'>Java</option>
              <option value='source.c'>C++</option>
              <option value='source.git'>Git diff</option>
            </select>
          </div>
        </article>

        <aside className='config padded'>

          {this.renderFields()}

        </aside>
      </section>
    )
  }
}
