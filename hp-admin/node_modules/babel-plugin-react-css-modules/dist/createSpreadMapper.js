"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = require("@babel/types");

var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createSpreadMapper = (path, stats) => {
  const result = {};
  let {
    attributeNames
  } = _optionsDefaults.default;

  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
  }

  const attributes = Object.entries(attributeNames).filter(pair => {
    return pair[1];
  });
  const attributeKeys = attributes.map(pair => {
    return pair[0];
  });
  const spreadAttributes = path.node.openingElement.attributes.filter(attr => {
    return (0, _types.isJSXSpreadAttribute)(attr);
  });

  for (const spread of spreadAttributes) {
    for (const attributeKey of attributeKeys) {
      const destinationName = attributeNames[attributeKey];

      if (result[destinationName]) {
        result[destinationName] = (0, _types.binaryExpression)('+', result[destinationName], (0, _types.conditionalExpression)(spread.argument, (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), (0, _types.logicalExpression)('||', (0, _types.memberExpression)(spread.argument, (0, _types.identifier)(destinationName)), (0, _types.stringLiteral)(''))), (0, _types.stringLiteral)('')));
      } else {
        result[destinationName] = (0, _types.conditionalExpression)(spread.argument, (0, _types.logicalExpression)('||', (0, _types.memberExpression)(spread.argument, (0, _types.identifier)(destinationName)), (0, _types.stringLiteral)('')), (0, _types.stringLiteral)(''));
      }
    }
  }

  return result;
};

var _default = createSpreadMapper;
exports.default = _default;
//# sourceMappingURL=createSpreadMapper.js.map