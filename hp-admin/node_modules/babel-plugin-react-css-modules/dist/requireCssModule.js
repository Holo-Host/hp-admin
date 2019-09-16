"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _postcss = _interopRequireDefault(require("postcss"));

var _genericNames = _interopRequireDefault(require("generic-names"));

var _postcssModulesExtractImports = _interopRequireDefault(require("postcss-modules-extract-imports"));

var _postcssModulesLocalByDefault = _interopRequireDefault(require("postcss-modules-local-by-default"));

var _postcssModulesParser = _interopRequireDefault(require("postcss-modules-parser"));

var _postcssModulesScope = _interopRequireDefault(require("postcss-modules-scope"));

var _postcssModulesValues = _interopRequireDefault(require("postcss-modules-values"));

var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getFiletypeOptions = (cssSourceFilePath, filetypes) => {
  const extension = cssSourceFilePath.substr(cssSourceFilePath.lastIndexOf('.'));
  const filetype = filetypes ? filetypes[extension] : null;
  return filetype;
}; // eslint-disable-next-line flowtype/no-weak-types


const getSyntax = filetypeOptions => {
  if (!filetypeOptions || !filetypeOptions.syntax) {
    return null;
  } // eslint-disable-next-line import/no-dynamic-require, global-require


  return require(filetypeOptions.syntax);
}; // eslint-disable-next-line flowtype/no-weak-types


const getExtraPlugins = filetypeOptions => {
  if (!filetypeOptions || !filetypeOptions.plugins) {
    return [];
  }

  return filetypeOptions.plugins.map(plugin => {
    if (Array.isArray(plugin)) {
      const [pluginName, pluginOptions] = plugin; // eslint-disable-next-line import/no-dynamic-require, global-require

      return require(pluginName)(pluginOptions);
    } // eslint-disable-next-line import/no-dynamic-require, global-require


    return require(plugin);
  });
};

const getTokens = (runner, cssSourceFilePath, filetypeOptions) => {
  // eslint-disable-next-line flowtype/no-weak-types
  const options = {
    from: cssSourceFilePath
  };

  if (filetypeOptions) {
    options.syntax = getSyntax(filetypeOptions);
  }

  const lazyResult = runner.process((0, _fs.readFileSync)(cssSourceFilePath, 'utf-8'), options);
  lazyResult.warnings().forEach(message => {
    // eslint-disable-next-line no-console
    console.warn(message.text);
  });
  return lazyResult.root.tokens;
};

var _default = (cssSourceFilePath, options) => {
  // eslint-disable-next-line prefer-const
  let runner;
  let generateScopedName;

  if (options.generateScopedName && typeof options.generateScopedName === 'function') {
    generateScopedName = options.generateScopedName;
  } else {
    generateScopedName = (0, _genericNames.default)(options.generateScopedName || _optionsDefaults.default.generateScopedName, {
      context: options.context || process.cwd()
    });
  }

  const filetypeOptions = getFiletypeOptions(cssSourceFilePath, options.filetypes);

  const fetch = (to, from) => {
    const fromDirectoryPath = (0, _path.dirname)(from);
    const toPath = (0, _path.resolve)(fromDirectoryPath, to);
    return getTokens(runner, toPath, filetypeOptions);
  };

  const extraPlugins = getExtraPlugins(filetypeOptions);
  const plugins = [...extraPlugins, _postcssModulesValues.default, _postcssModulesLocalByDefault.default, _postcssModulesExtractImports.default, new _postcssModulesScope.default({
    generateScopedName
  }), new _postcssModulesParser.default({
    fetch
  })];
  runner = (0, _postcss.default)(plugins);
  return getTokens(runner, cssSourceFilePath, filetypeOptions);
};

exports.default = _default;
//# sourceMappingURL=requireCssModule.js.map