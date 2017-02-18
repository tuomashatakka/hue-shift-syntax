'use babel'
import React, { Component, prop as PropTypes } from 'react'


/**
 * @class Preset
 * @extends React.Component
 */
export default class Preset extends Component {

  render () {
    let { name, data, action, active } = this.props
    active = active ? ' selected' : ''
    return (
      <button onClick={action} className={`btn${active}`}>
        {name}
      </button>
    )
  }
}
