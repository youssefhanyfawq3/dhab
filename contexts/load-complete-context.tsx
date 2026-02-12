'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LoadCompleteContextType {
    isLoadComplete: boolean;
}

const LoadCompleteContext = createContext<LoadCompleteContextType>({
    isLoadComplete: false,
});

export function LoadCompleteProvider({
    children,
    isLoadComplete,
}: {
    children: ReactNode;
    isLoadComplete: boolean;
}) {
    return (
        <LoadCompleteContext.Provider value={{ isLoadComplete }}>
            {children}
        </LoadCompleteContext.Provider>
    );
}

export function useLoadComplete() {
    return useContext(LoadCompleteContext);
}
