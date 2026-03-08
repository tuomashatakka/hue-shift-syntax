## [1.0.0] — 2026-03-08

### Breaking change

Complete rewrite as a TypeScript VS Code extension. Removes all Atom-specific
code. Color palette computation is now pure TypeScript; colors are applied via
`workbench.colorCustomizations` and `editor.tokenColorCustomizations` and
update live when settings change.

## 0.1.0 - First Release
* Every feature added
* Every bug fixed
