import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fetch from "node-fetch";

const port = "4001";
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String
  }

  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

const resolvers = {
  User: {
    __resolveReference(ref) {
      return fetch(`${apiUrl}/users/${ref.id}`).then((res) => res.json());
    },
  },
  Query: {
    user(_, { id }) {
      return fetch(`${apiUrl}/users/${id}`).then((res) => res.json());
    },
    users() {
      return fetch(`${apiUrl}/users`).then((res) => res.json());
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

server.listen({ port }).then(({ url }) => {
  console.log(`users service ready at ${url}`);
});
