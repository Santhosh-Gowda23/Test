import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fetch from "node-fetch";

const port = 4002;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
  type Subscriptions {
    id: ID!
    userList: [User]
    price: String!
    frequency: String!
    orderDate: String
    shippingDate: String
    billingAddress: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    subscriptions: [Subscriptions]
  }

  extend type Query {
    subscription(id: ID!): Subscriptions
    subscriptions: [Subscriptions]
  }
`;
// extend type Mutation {
//   updateSubscription(id: ID!, subPayload: SubPayload): Subscriptions
// }

// input SubPayload {
//   id: ID
//   price: String!
//   frequency: String!
//   orderDate: String!
//   shippingDate: String!
//   billingAddress: String!
// }

const resolvers = {
  User: {
    async subscriptions(user) {
      const res = await fetch(`${apiUrl}/subscriptions`);
      const subscriptions = await res.json();

      return subscriptions.filter(({ userList }) =>
        userList.includes(parseInt(user.id))
      );
    },
  },
  Subscriptions: {
    userList(subscription) {
      return subscription.userList.map((id) => ({ __typename: "User", id }));
    },
  },
  Query: {
    subscription(_, { id }) {
      return fetch(`${apiUrl}/subscriptions/${id}`).then((res) => res.json());
    },
    subscriptions() {
      return fetch(`${apiUrl}/subscriptions`).then((res) => res.json());
    },
  },
  // Mutation: {
  //   updateSubscription: async (_, { id, subPayload }) => {
  //     console.log(id, subPayload);
  //     try {
  //       const currentSubs = await fetch(`${apiUrl}/subscriptions`).then((res) =>
  //         res.json()
  //       );
  //       if (id === currentSubs.id) {
  //         console.log("QQQQQQQ id already exists");
  //       }
  //     } catch (error) {
  //       return await fetch(`${apiUrl}/subscriptions`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(subPayload),
  //       })
  //         .then((res) => res.json())
  //         .then((res) => console.log("&&&&&&", res));
  //     }
  //   },
  // },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

server.listen({ port }).then(({ url }) => {
  console.log(`subscriptions service ready at ${url}`);
});
