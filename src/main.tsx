/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ADICIONADO: React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// opcional: import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  },
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>,
);
