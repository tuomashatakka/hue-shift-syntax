'use babel'
import React, { Component, prop as PropTypes } from 'react'

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

  render () {
    let { children } = this.props
    let { open } = this.state
    let editor = this.editor.getElement()
    console.warn(editor, this.editor.getGrammar())

    return (
      <section style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <article
          style={{ flex: '1 0 67%'}}
          className='editor'
          ref={ref => ref ? ref.appendChild(editor) : ref}
          />

        <aside
          style={{ flex: '0 1 33%'}}
          className='config inset-panel padded'>

          <header className='panel-heading'>
            <h3>Syntax color settings</h3>
          </header>

          <label className='form-group'>
            <h3>Hue</h3>
            <input
              type="range"
              min="-120" max="120"
              onChange={e => console.log(e, e.target, e.target.value)} />
          </label>

        </aside>
      </section>
    )
  }
}
