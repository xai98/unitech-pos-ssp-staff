import "./styles/App.css";
import { ApolloProvider } from "@apollo/client";
import Routers from "./routes"; // Double-check this path
import client from "./utils/apolloClientConnect";
import { Provider } from "./hooks/Context";

function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <Provider>
          <Routers />
        </Provider>
      </ApolloProvider>
    </>
  );
}

export default App;
