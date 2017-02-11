'use babel'
import React, { Component, prop as PropTypes } from 'react'
import { throttle } from 'underscore'


/**
 * @class Field
 * @extends React.Component
 */
export default class Field extends Component {

  constructor (props) {
    super(props)
    this.change = this.change.bind(this)
    this.reset = this.change.bind(this, null)
    this.schema = atom.config.getSchema(props.scope)

    this.state = {
      disabled: false,
      value: atom.config.get(props.scope) || 1 }
  }

  change (arg) {
    let { scope } = this.props
    let { default: initial } = this.schema
    let value = !arg ?
      initial :
      arg.target ?
      arg.target.value :
      arg

    atom.config.set(scope, value)
    this.setState({ value })
  }

  render () {
    let { type, title, description, minimum, maximum } = this.schema
    let { disabled, value } = this.state
    if (type === 'number')
      type = 'range'

    return (
      <label
        onDoubleClick={this.reset}
        className='control-group'>

        <header className='control-label'>
          <h4>{title}</h4>
          <p>{description}</p>
        </header>

        <div className='controls'>
          <span>{minimum}</span>
          <input
            type={type}
            min={minimum}
            max={maximum}
            onChange={this.change}
            value={value} />
          <span>{maximum}</span>
        </div>

        <output>
          {value}
        </output>

      </label>
    )
  }
}
