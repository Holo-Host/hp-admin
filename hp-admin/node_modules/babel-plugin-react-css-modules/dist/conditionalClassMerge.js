"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = require("@babel/types");

/* eslint-disable flowtype/no-weak-types */
var _default = (classNameExpression, styleNameExpression) => {
  return (0, _types.binaryExpression)('+', (0, _types.conditionalExpression)(classNameExpression, (0, _types.binaryExpression)('+', classNameExpression, (0, _types.stringLiteral)(' ')), (0, _types.stringLiteral)('')), styleNameExpression);
};

exports.default = _default;
//# sourceMappingURL=conditionalClassMerge.js.map