"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = require("@babel/types");

const handleSpreadClassName = (path, destinationName, classNamesFromSpread) => {
  const destinationAttribute = path.node.openingElement.attributes.find(attribute => {
    return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
  });

  if (!destinationAttribute) {
    return;
  }

  if ((0, _types.isStringLiteral)(destinationAttribute.value)) {
    destinationAttribute.value = (0, _types.jsxExpressionContainer)((0, _types.binaryExpression)('+', destinationAttribute.value, (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), classNamesFromSpread)));
  } else if ((0, _types.isJSXExpressionContainer)(destinationAttribute.value)) {
    destinationAttribute.value = (0, _types.jsxExpressionContainer)((0, _types.binaryExpression)('+', destinationAttribute.value.expression, (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), classNamesFromSpread)));
  }
};

var _default = handleSpreadClassName;
exports.default = _default;
//# sourceMappingURL=handleSpreadClassName.js.map