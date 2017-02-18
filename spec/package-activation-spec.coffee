describe "Hue Shift syntax theme is activated", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('hue-shift-syntax')

    waitsForPromise ->
      atom.packages.activatePackage("snippets") # to intentionally disrupt tab expansion

    waitsForPromise ->
      atom.packages.activatePackage("language-css", sync: true)

    waitsForPromise ->
      atom.packages.activatePackage("language-sass", sync: true)

    waitsForPromise ->
      atom.packages.activatePackage("language-php", sync: true)

    waitsForPromise ->
      atom.packages.activatePackage("language-html", sync: true)

  it "scales the ui correctly", ->

    # Default value
    conf = atom.config.get 'hue-shift-syntax'
    console.log conf

    expect(conf.filter.contrast).toBe 100
    expect(conf.filter.brightness).toBe 100
    expect(conf.main.hue).toBe 250
    expect(conf.main.shift).toBe 70
    expect(conf.main.luminance).toBe 70
    expect(conf.modifiers['dim:minor']).toBe 40

    atom.config.set('hue-shift-syntax.main.hue', -20)
    expect(conf.main.hue).toBe 250

  it "adjusts the layout spacing correctly", ->
    attr = 'spacing'

    # Default value
    expect(100).toBe '100'
