import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for API requests
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create the API with RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth state
      const token = (getState() as any).auth.token;
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    credentials: 'include', // This allows the browser to send cookies with the request
  }),
  tagTypes: ['Post', 'User', 'Comment', 'Notification', 'Message'],
  endpoints: () => ({}),
});

// Export hooks for usage in components
export const enhancedApi = api;