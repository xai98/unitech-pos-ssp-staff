import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// import * as jwtDecode from 'jwt-decode';
import { consts } from './index';

const httpLink = new HttpLink({
    uri: 'http://localhost:4444', // localhost
    // uri: 'https://pos.api.vixayexpress.la/', // prod
});

// function isTokenExpired(token: string | null) {
//     if (!token) {
//         return true; // Consider the token expired if it's not present
//     }

//     try {
//         const decodedToken = jwtDecode<any>(token);

//         if (decodedToken && Date.now() >= decodedToken.exp * 1000) {
//             return true;
//         }
//     } catch (e) {
//         console.error("Failed to decode or check token:", e);
//         return true; // Consider the token expired on any error
//     }

//     return false; // Token is not expired
// }

// Middleware that sets the headers for each request
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem(consts.USER_TOKEN);

    // if (isTokenExpired(token)) {
    //     // Handle expired token, e.g., redirect to login or refresh token
    //     console.warn("Token has expired. Please log in again.");
    //     // Optionally, redirect or perform other actions
    //     // Example: window.location.href = '/login';
    // }

    // Return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `${token}` : "",
        }
    };
});

const client = new ApolloClient({
    // Use the authLink.concat(httpLink) to combine middleware with the HttpLink
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
        addTypename: false
    }),
});

export default client;
