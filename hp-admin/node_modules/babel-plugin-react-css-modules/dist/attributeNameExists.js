"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const attributeNameExists = (programPath, stats) => {
  let exists = false;
  let attributeNames = _optionsDefaults.default.attributeNames;

  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
  }

  programPath.traverse({
    JSXAttribute(attrPath) {
      if (exists) {
        return;
      }

      const attribute = attrPath.node;

      if (typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string') {
        exists = true;
      }
    }

  });
  return exists;
};

var _default = attributeNameExists;
exports.default = _default;
//# sourceMappingURL=attributeNameExists.js.map