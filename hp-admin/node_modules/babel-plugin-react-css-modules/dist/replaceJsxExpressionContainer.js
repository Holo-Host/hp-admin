"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = _interopRequireWildcard(require("@babel/types"));

var _conditionalClassMerge = _interopRequireDefault(require("./conditionalClassMerge"));

var _createObjectExpression = _interopRequireDefault(require("./createObjectExpression"));

var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var _default = (t, path, sourceAttribute, destinationName, importedHelperIndentifier, styleModuleImportMapIdentifier, options) => {
  const expressionContainerValue = sourceAttribute.value;
  const destinationAttribute = path.node.openingElement.attributes.find(attribute => {
    return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
  });

  if (destinationAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(destinationAttribute), 1);
  }

  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);
  const args = [expressionContainerValue.expression, styleModuleImportMapIdentifier]; // Only provide options argument if the options are something other than default
  // This helps save a few bits in the generated user code

  if (options.handleMissingStyleName !== _optionsDefaults.default.handleMissingStyleName || options.autoResolveMultipleImports !== _optionsDefaults.default.autoResolveMultipleImports) {
    args.push((0, _createObjectExpression.default)(t, options));
  }

  const styleNameExpression = t.callExpression(t.clone(importedHelperIndentifier), args);

  if (destinationAttribute) {
    if ((0, _types.isStringLiteral)(destinationAttribute.value)) {
      path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)((0, _types.binaryExpression)('+', t.stringLiteral(destinationAttribute.value.value + ' '), styleNameExpression))));
    } else if ((0, _types.isJSXExpressionContainer)(destinationAttribute.value)) {
      path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)((0, _conditionalClassMerge.default)(destinationAttribute.value.expression, styleNameExpression))));
    } else {
      throw new Error('Unexpected attribute value: ' + destinationAttribute.value);
    }
  } else {
    path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)(styleNameExpression)));
  }
};

exports.default = _default;
//# sourceMappingURL=replaceJsxExpressionContainer.js.map