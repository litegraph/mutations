import {
  createMutations,
  Event,
  MutationContext,
  MutationStates,
  MutationStatesSubject,
} from '../src'
import exampleMutations, { Config, State, EventMap, MyEvent } from './mutations'

import gql from 'graphql-tag'

// Create Executable & Executable Mutations
const mutations = createMutations({
  mutations: exampleMutations,
  config: {
    a: async () => '',
    b: 3,
    c: {
      d: {
        e: () => true,
      },
    },
  },
})

const EXAMPLE = gql`
  mutation Example($input: String!) {
    example(input: $input) {
      output
    }
  }
`

// Context for the execution to use
type Context = MutationContext<Config, State, EventMap>
let context = {} as Context

// Subscribe to mutation state updates
const subject = new MutationStatesSubject<State, EventMap>({})

subject.subscribe((state: MutationStates<State, EventMap>) => {
  // Resolver defined state properties
  state.example.myValue

  // Log of all events emitted
  state.example.events.forEach((event: Event<EventMap>) => {
    switch (event.name) {
      case 'MY_EVENT': {
        const myEvent = event.payload as MyEvent
        myEvent.myValue
        break
      }
    }
  })

  // Default values defined for you
  state.example.uuid
  state.example.progress
})

// Execute the mutation
const main = async () => {
  const { data } = await mutations.execute({
    query: EXAMPLE,
    variables: {
      input: '...',
    },
    setContext: (newContext: Context) => {
      context = newContext
      return context
    },
    getContext: () => context,
    stateSubject: subject,
  })
}
