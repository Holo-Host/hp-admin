import { Operation, ApolloLink, FetchResult, Observable } from 'apollo-link';
import { MockedResponse } from './types';
export declare class MockLink extends ApolloLink {
    addTypename: Boolean;
    private mockedResponsesByKey;
    constructor(mockedResponses: ReadonlyArray<MockedResponse>, addTypename?: Boolean);
    addMockedResponse(mockedResponse: MockedResponse): void;
    request(operation: Operation): Observable<FetchResult> | null;
    private normalizeMockedResponse;
}
export declare function mockSingleLink(...mockedResponses: Array<any>): ApolloLink;
