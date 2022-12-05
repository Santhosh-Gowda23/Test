import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fetch from "node-fetch";

const port = 4003;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
  enum OrderType {
    one_time
    subscription
  }
  type Order @key(fields: "id") {
    id: ID!
    name: String
    price: String!
    quantity: String!
    orderType: String!
    orderedBy: [User]
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    orders: [Order]
  }
  extend type Query {
    order(orderType: OrderType): [Order]
    orders: [Order]
  }
`;

const resolvers = {
  User: {
    async orders(user) {
      const res = await fetch(`${apiUrl}/orders`);
      const orders = await res.json();

      return orders.filter(({ orderedBy }) =>
        orderedBy.includes(parseInt(user.id))
      );
    },
  },
  Order: {
    orderedBy(orders) {
      return orders.orderedBy.map((id) => ({ __typename: "User", id }));
    },
  },
  Query: {
    order(_, { orderType }) {
      return fetch(`${apiUrl}/orders?orderType=${orderType}`).then((res) =>
        res.json()
      );
    },
    orders() {
      return fetch(`${apiUrl}/orders`).then((res) => res.json());
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port }).then(({ url }) => {
  console.log(`orders service ready at ${url}`);
});

//rover subgraph publish My-Graph-9plddr@current --schema ./user.graphql --name user --routing-url http://localhost:4001
