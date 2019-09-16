"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_link_1 = require("apollo-link");
var execute_1 = require("graphql/execution/execute");
var SchemaLink = (function (_super) {
    tslib_1.__extends(SchemaLink, _super);
    function SchemaLink(_a) {
        var schema = _a.schema, rootValue = _a.rootValue, context = _a.context;
        var _this = _super.call(this) || this;
        _this.schema = schema;
        _this.rootValue = rootValue;
        _this.context = context;
        return _this;
    }
    SchemaLink.prototype.request = function (operation) {
        var _this = this;
        return new apollo_link_1.Observable(function (observer) {
            Promise.resolve(execute_1.execute(_this.schema, operation.query, _this.rootValue, typeof _this.context === 'function'
                ? _this.context(operation)
                : _this.context, operation.variables, operation.operationName))
                .then(function (data) {
                if (!observer.closed) {
                    observer.next(data);
                    observer.complete();
                }
            })
                .catch(function (error) {
                if (!observer.closed) {
                    observer.error(error);
                }
            });
        });
    };
    return SchemaLink;
}(apollo_link_1.ApolloLink));
exports.SchemaLink = SchemaLink;
exports.default = SchemaLink;
//# sourceMappingURL=index.js.map