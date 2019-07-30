import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import renderer from 'react-test-renderer'
import { MockedProvider } from 'react-apollo/test-utils'
import wait from 'waait'


export const GET_DOG_QUERY = gql`
  query getDog($name: String) {
    dog(name: $name) {
      id
      name
      breed
    }
  }
`

// Make sure the query is also exported -- not just the component

export const Dog = ({ name }) => (
  <Query query={GET_DOG_QUERY} variables={{ name }}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error!</p>

      return (
        <p>
          {data.dog.name} is a {data.dog.breed}
        </p>
      )
    }}
  </Query>
)

it('should render dog', async () => {
  const dogMock = {
    request: {
      query: GET_DOG_QUERY,
      variables: { name: 'Buck' },
    },
    result: {
      data: { dog: { id: 1, name: 'Buck', breed: 'poodle' } },
    },
  };

  const component = renderer.create(
    <MockedProvider mocks={[dogMock]} addTypename={false}>
      <Dog name="Buck" />
    </MockedProvider>,
  );

  await wait(0); // wait for response

  const p = component.root.findByType('p');
  expect(p.children).toContain('Buck is a poodle');
});