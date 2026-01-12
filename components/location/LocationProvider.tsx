'use client';

import React, { createContext, useContext } from 'react';

interface LocationContextValue {
  locationPrefix?: string;
}

const LocationContext = createContext<LocationContextValue>({});

interface LocationProviderProps {
  locationPrefix?: string;
  children: React.ReactNode;
}

export function LocationProvider({ locationPrefix, children }: LocationProviderProps) {
  return (
    <LocationContext.Provider value={{ locationPrefix }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationPrefix() {
  return useContext(LocationContext).locationPrefix;
}


