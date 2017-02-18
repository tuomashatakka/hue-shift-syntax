'use babel'
import os from 'path'
import openPreviewPaneItem, { getPreviewButton } from './previewPaneItem'
import { CompositeDisposable } from 'atom'
import { render } from 'react-dom'
import React from 'react'

const PACKAGE_NAME          = 'hue-shift-syntax'
const settingsViewPackage   = atom.packages.getLoadedPackage('settings-view')
const settingsModulePath    = os.dirname(settingsViewPackage.getMainModulePath())
const PackageDetailView     = require(os.join(settingsModulePath, 'package-detail-view'))
const voidSnippetsProvider  = { getSnippets: ()=>[] }


const defaults = {
  back: 'Themes'
}
const views = {
  'hue-shift-syntax': (opts) => openPreviewPaneItem(opts)
}

export default class SettingsManager {

  constructor (options) {
    this.subscriptions = new CompositeDisposable()
    this.options = { ...defaults, ...options }
    this.views = views
    this._cached = {}
    this.pack = atom.packages.getLoadedPackage(PACKAGE_NAME)

    this.provideView = this.provideView.bind(this)
    this.constructView = this.constructView.bind(this)
    this.handleCreateCallback = this.handleCreateCallback.bind(this)
    this.getPanel = this.getPanel.bind(this)
    this.getSpacePenView = this.getSpacePenView.bind(this)
    this.observeSettingsPanel()
  }


  observeSettingsPanel () {
    let { name }    = this.pack
    let patch       = (item, force=false) => {
      let isOpen    = force || (item && item.uri === 'atom://config')
      return isOpen ? this.handleCreateCallback({name, item}) : null }
    let item        = atom.workspace.paneForURI('atom://config')
    if (item) patch(item, true)

    this.subscriptions.add(atom.workspace.onDidOpen(patch))
    this.subscriptions.add(atom.workspace.observeActivePaneItem(patch))
    this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(patch))
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(patch))
    settingsViewPackage.onDidDeactivate(() => this.disposeListeners())

  }

  getPanel () {
    let { packageManager }  = this.getSpacePenView()
    let args                = [ this.pack, packageManager, voidSnippetsProvider ]
    this.panel              = this.panel || new PackageDetailView(...args)
    return this.panel
  }

  getSpacePenView () {
    let { settingsView, spacePenView } = this._cached
    if (spacePenView)
      return spacePenView
    settingsView = document.querySelector('.settings-view') || settingsView || {}
    spacePenView = settingsView.spacePenView || settingsView.item || null
    this._cached = { ...this._cached, spacePenView, settingsView }
    return spacePenView
  }

  handleCreateCallback ({ name, options, item }) {
    let  callback     = () => this.provideView({ name, props })
    let  props        = {}
    let  spacePenView = this.getSpacePenView()
    if (!spacePenView)
      return
    let { back }      = spacePenView

    spacePenView.back = back || this.options.back
    spacePenView.panelCreateCallbacks = { ...spacePenView.panelCreateCallbacks, [name]: callback }
    spacePenView.removePanel(name)
    this.disposeListeners()
  }

  provideView ({ name, props }) {
    let spacePenView    = this.getSpacePenView()
    let item            = (this.views[name] || this.constructView)(name, props)
    let container       = document.createElement('section')
    let panel           = this.getPanel()

    spacePenView.removePanel(name)
    spacePenView.panel  = panel
    panel.sections.prepend(container)
    container.appendChild(getPreviewButton())
    return panel
  }

  constructView (name, props) {

    let spacePenView    = this.getSpacePenView()
    let panel           = this.getPanel()
    let host            = panel.sections.find('section.settings-panel')
    let readmeSection   = panel.sections.find('.package-readme')
    let detailsSection  = panel.element.children[1] //.querySelector('.package-detail-view')
    let sections        = { readme: readmeSection.get(0), details: detailsSection }
    let view            = document.createElement("section")

    spacePenView.panel  = panel
    host.before(view)
    this.disposeListeners()
    if (atom.devMode)
      console.info("Overriding the theme settings view...")
    return panel
    // readmeSection.closest('section.section').hide()
    // spacePenView.removePanel('reduced-dark-ui')
  }

  disposeListeners () {
    if (this.subscriptions)
      this.subscriptions.dispose()
  }

}
