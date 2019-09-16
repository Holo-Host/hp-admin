import { ApolloLink, Operation, FetchResult, Observable } from 'apollo-link';
import { GraphQLSchema } from 'graphql/type/schema';
export declare namespace SchemaLink {
    type ResolverContextFunction = (operation: Operation) => Record<string, any>;
    interface Options {
        schema: GraphQLSchema;
        rootValue?: any;
        context?: ResolverContextFunction | Record<string, any>;
    }
}
export declare class SchemaLink extends ApolloLink {
    schema: GraphQLSchema;
    rootValue: any;
    context: SchemaLink.ResolverContextFunction | any;
    constructor({ schema, rootValue, context }: SchemaLink.Options);
    request(operation: Operation): Observable<FetchResult> | null;
}
export default SchemaLink;
//# sourceMappingURL=index.d.ts.map