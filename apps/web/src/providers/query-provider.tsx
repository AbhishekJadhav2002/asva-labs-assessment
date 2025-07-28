'use client'

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 60 * 1000,
        refetchInterval: 10_000,
        refetchIntervalInBackground: true
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    browserQueryClient ??= makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProviders(properties: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {properties.children}
    </QueryClientProvider>
  )
}
