'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Field from '../components/Field'


/**
 * @class Section
 * @extends React.Component
 */
export default class Section extends Component {

  render () {
    let { scope } = this.props
    console.log("Field for scope", scope)
    let { title, description, properties } = atom.config.getSchema(scope)
    let fields = Object.keys(properties)
    return (

      <section key={scope} className='section inset-panel padded'>

      <header className='panel-heading'>
        <h3>{title}</h3>
        <em>{description}</em>
      </header>

      <div className='sub-section panel-body'>
      {
        fields.map(field => {
        let props = {
          key: `${scope}.${field}`,
          scope: `${scope}.${field}`}

        return <Field {...props} />
        })
      }
      </div>
      </section>

    )
  }
}
