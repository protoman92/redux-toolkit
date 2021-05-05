// @ts-check
const {
  babelInclude,
  override,
  removeModuleScopePlugin,
} = require("customize-cra");
const path = require("path");

module.exports = override(
  removeModuleScopePlugin(),
  babelInclude([path.join(__dirname, "src"), path.join(__dirname, "..", "src")])
);
