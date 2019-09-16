"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isNamespacedStyleName = styleName => {
  return styleName.indexOf('.') !== -1;
};

const handleError = (message, handleMissingStyleName) => {
  if (handleMissingStyleName === 'throw') {
    throw new Error(message);
  } else if (handleMissingStyleName === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(message);
  }

  return null;
};

const getClassNameForNamespacedStyleName = (styleName, styleModuleImportMap, handleMissingStyleNameOption) => {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  const styleNameParts = styleName.split('.');
  const importName = styleNameParts[0];
  const moduleName = styleNameParts[1];
  const handleMissingStyleName = handleMissingStyleNameOption || _optionsDefaults.default.handleMissingStyleName;

  if (!moduleName) {
    return handleError('Invalid style name: ' + styleName, handleMissingStyleName);
  }

  if (!styleModuleImportMap[importName]) {
    return handleError('CSS module import does not exist: ' + importName, handleMissingStyleName);
  }

  if (!styleModuleImportMap[importName][moduleName]) {
    return handleError('CSS module does not exist: ' + moduleName, handleMissingStyleName);
  }

  return styleModuleImportMap[importName][moduleName];
};

const getClassNameFromMultipleImports = (styleName, styleModuleImportMap, handleMissingStyleNameOption) => {
  const handleMissingStyleName = handleMissingStyleNameOption || _optionsDefaults.default.handleMissingStyleName;
  const importKeysWithMatches = Object.keys(styleModuleImportMap).map(importKey => {
    return styleModuleImportMap[importKey][styleName] && importKey;
  }).filter(importKey => {
    return importKey;
  });

  if (importKeysWithMatches.length > 1) {
    throw new Error('Cannot resolve styleName "' + styleName + '" because it is present in multiple imports:' + '\n\n\t' + importKeysWithMatches.join('\n\t') + '\n\nYou can resolve this by using a named import, e.g:' + '\n\n\timport foo from "' + importKeysWithMatches[0] + '";' + '\n\t<div styleName="foo.' + styleName + '" />' + '\n\n');
  }

  if (importKeysWithMatches.length === 0) {
    return handleError('Could not resolve the styleName \'' + styleName + '\'.', handleMissingStyleName);
  }

  return styleModuleImportMap[importKeysWithMatches[0]][styleName];
};

var _default = (styleNameValue, styleModuleImportMap, options) => {
  const styleModuleImportMapKeys = Object.keys(styleModuleImportMap);
  const {
    handleMissingStyleName = _optionsDefaults.default.handleMissingStyleName,
    autoResolveMultipleImports = _optionsDefaults.default.autoResolveMultipleImports
  } = options || {};

  if (!styleNameValue) {
    return '';
  }

  return styleNameValue.split(' ').filter(styleName => {
    return styleName;
  }).map(styleName => {
    if (isNamespacedStyleName(styleName)) {
      return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap, handleMissingStyleName);
    }

    if (styleModuleImportMapKeys.length === 0) {
      throw new Error('Cannot use styleName attribute for style name \'' + styleName + '\' without importing at least one stylesheet.');
    }

    if (styleModuleImportMapKeys.length > 1) {
      if (!autoResolveMultipleImports) {
        throw new Error('Cannot use anonymous style name \'' + styleName + '\' with more than one stylesheet import without setting \'autoResolveMultipleImports\' to true.');
      }

      return getClassNameFromMultipleImports(styleName, styleModuleImportMap, handleMissingStyleName);
    }

    const styleModuleMap = styleModuleImportMap[styleModuleImportMapKeys[0]];

    if (!styleModuleMap[styleName]) {
      return handleError('Could not resolve the styleName \'' + styleName + '\'.', handleMissingStyleName);
    }

    return styleModuleMap[styleName];
  }).filter(className => {
    // Remove any styles which could not be found (if handleMissingStyleName === 'ignore')
    return className;
  }).join(' ');
};

exports.default = _default;
//# sourceMappingURL=getClassName.js.map