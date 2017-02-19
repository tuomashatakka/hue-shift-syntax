'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Field from '../components/Field'


/**
 * @class Section
 * @extends React.Component
 */
export default class Section extends Component {

  constructor (args) {
    super(args)
    let { scope } = this.props
    let { properties } = atom.config.getSchema(scope)
    let fields = Object.keys(properties)
    this.state = {
      fields
    }
  }

  render () {
    let { scope } = this.props
    let { fields } = this.state
    let { title, description } = atom.config.getSchema(scope)
    return (

      <section key={scope} className='section inset-panel'>

      <header className='panel-heading'>
        <h3>{title}</h3>
        <em>{description}</em>
      </header>

      <div className='sub-section panel-body'>
      {
        fields.map(field => {
        let props = {
          key: `${scope}.${field}`,
          scope: `${scope}.${field}` }

        return <Field {...props} onUpdate={() => this.props.onDidUpdateField()} />
        })
      }
      </div>
      </section>

    )
  }
}
