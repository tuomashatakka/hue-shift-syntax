'use babel'
import React, { Component, prop as PropTypes } from 'react'
import { throttle } from 'underscore'

const ACTION = {
  IDLE: 0,
  PREEMPT: 1,
  MODIFY: 2,
  CHANGE_SEND: 3,
  SUCCESS: 4,
}

function observeMouseEnd (val) {
  this.setState({ phase: ACTION.SUCCESS, valueBeforeChange: val })
  setTimeout(() => this.setOutputDisplay(ACTION.IDLE), 1000)
}

/**
 * @class Field
 * @extends React.Component
 */
export default class Field extends Component {

  constructor (props) {
    super(props)
    this.setOutputDisplay = this.setOutputDisplay.bind(this)
    this.changeEnd = observeMouseEnd.bind(this)
    this.change = this.change.bind(this)
    this.reset = this.change.bind(this, null)
    this.schema = atom.config.getSchema(props.scope)
    document.addEventListener('mouseup', () => {
      if (this.state.valueBeforeChange !== this.state.value)
      this.changeEnd(this.state.value)
    })
    let value = atom.config.get(props.scope) || 1
    this.state = {
      disabled: false,
      phase: ACTION.IDLE,
      value,
      valueBeforeChange: value }
  }

  setOutputDisplay (arg) {
    let { phase, value, valueBeforeChange } = this.state
    if ( phase === ACTION.MODIFY || !(parseInt(arg) > -1 && parseInt(arg) < Object.keys(ACTION).length))
      return
    this.setState({ phase: arg })
  }

  updateSchema ({ resetValue }) {
    this.schema = atom.config.getSchema(this.props.scope)
    if (resetValue)
      this.setState({ value: atom.config.get(this.props.scope) })
  }

  change (arg) {

    let { scope } = this.props
    let { default: initial } = this.schema
    let phase = ACTION.MODIFY
    let value = !arg ?
      initial :
      arg.target ?
      arg.target.value :
      arg

    atom.config.set(scope, value)
    this.setState({ value, phase })
    this.props.onUpdate()
  }

  render () {
    let { type, title, description, minimum, maximum } = this.schema
    let { disabled, value, phase } = this.state
    let output

    if (type === 'number') type = 'range'
    if (phase === ACTION.IDLE) output = 'idle'
    else if (phase === ACTION.PREEMPT) output = 'init'
    else if (phase === ACTION.MODIFY) output = 'info'
    else if (phase === ACTION.CHANGE_SEND) output = 'warning'
    else if (phase === ACTION.SUCCESS) output = 'success'

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
            onMouseDown={() => this.setState({ valueBeforeChange: parseInt(value), phase: 1 })}
            onChange={this.change}
            value={value} />
          <span>{maximum}</span>
        </div>

        <output className={`badge badge-${output}`}>
          {value}
        </output>

      </label>
    )
  }
}
