"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = _interopRequireWildcard(require("@babel/types"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Creates an AST representation of an InputObjectType shape object.
 */
const createObjectExpression = (t, object) => {
  const properties = [];

  for (const name of Object.keys(object)) {
    const value = object[name];
    let newValue; // eslint-disable-next-line no-empty

    if (t.isAnyTypeAnnotation(value)) {} else if (typeof value === 'string') {
      newValue = t.stringLiteral(value);
    } else if (typeof value === 'object') {
      newValue = createObjectExpression(t, value);
    } else if (typeof value === 'boolean') {
      newValue = t.booleanLiteral(value);
    } else if (typeof value === 'undefined') {
      // eslint-disable-next-line no-continue
      continue;
    } else {
      throw new TypeError('Unexpected type: ' + typeof value);
    }

    properties.push(t.objectProperty(t.stringLiteral(name), newValue));
  }

  return t.objectExpression(properties);
};

var _default = createObjectExpression;
exports.default = _default;
//# sourceMappingURL=createObjectExpression.js.map