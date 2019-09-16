"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = require("@babel/types");

var _conditionalClassMerge = _interopRequireDefault(require("./conditionalClassMerge"));

var _getClassName = _interopRequireDefault(require("./getClassName"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
var _default = (path, styleModuleImportMap, sourceAttribute, destinationName, options) => {
  const resolvedStyleName = (0, _getClassName.default)(sourceAttribute.value.value, styleModuleImportMap, options);
  const destinationAttribute = path.node.openingElement.attributes.find(attribute => {
    return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
  });

  if (destinationAttribute) {
    if ((0, _types.isStringLiteral)(destinationAttribute.value)) {
      destinationAttribute.value.value += ' ' + resolvedStyleName;
    } else if ((0, _types.isJSXExpressionContainer)(destinationAttribute.value)) {
      destinationAttribute.value.expression = (0, _conditionalClassMerge.default)(destinationAttribute.value.expression, (0, _types.stringLiteral)(resolvedStyleName));
    } else {
      throw new Error('Unexpected attribute value:' + destinationAttribute.value);
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);
  } else {
    sourceAttribute.name.name = destinationName;
    sourceAttribute.value.value = resolvedStyleName;
  }
};

exports.default = _default;
//# sourceMappingURL=resolveStringLiteral.js.map