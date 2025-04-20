import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { consts } from "./index";

// 📌 กำหนด URL จาก Environment Variables หรือ Default
const GRAPHQL_ENDPOINT =
  process.env.REACT_APP_GRAPHQL_ENDPOINT || "https://sp-api.easy-order.la";
// const WS_ENDPOINT = process.env.REACT_APP_WS_ENDPOINT || "ws://localhost:7070/"; //dev
const WS_ENDPOINT = process.env.REACT_APP_WS_ENDPOINT || "wss://sp-api.easy-order.la/"; //prod

// 📌 ตั้งค่า HTTP Link สำหรับ Query & Mutation
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// 📌 Middleware สำหรับใส่ Token ใน Header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(consts.USER_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : "",
    },
  };
});



const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_ENDPOINT,
    connectionParams: () => {
      const token = localStorage.getItem(consts.USER_TOKEN);
      return {
        headers: {
          authorization: token ? `${token}` : "",
        },
      };
    },
    retryAttempts: 5, // จำนวนครั้งสูงสุดที่พยายาม reconnect
    shouldRetry: () => true, // Retry เสมอเมื่อขาดการเชื่อมต่อ
    on: {
      connected: () => console.log("WebSocket Connected!"),
      closed: (event) => console.log("WebSocket Closed:", event),
      error: (err) => console.error("WebSocket Error:", err),
    },
  })
);

// 📌 สลับระหว่าง WebSocket และ HTTP ตามประเภทของ Operation
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink, // ใช้ WebSocket สำหรับ Subscription
  authLink.concat(httpLink) // ใช้ HTTP สำหรับ Query & Mutation
);

// 📌 ตั้งค่า Apollo Client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

export default client;
