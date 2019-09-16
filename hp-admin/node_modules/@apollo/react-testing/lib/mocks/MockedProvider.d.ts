import React from 'react';
import { MockedProviderProps, MockedProviderState } from './types';
export declare class MockedProvider extends React.Component<MockedProviderProps, MockedProviderState> {
    static defaultProps: MockedProviderProps;
    constructor(props: MockedProviderProps);
    render(): JSX.Element | null;
    componentWillUnmount(): void;
}
