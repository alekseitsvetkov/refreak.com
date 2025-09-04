import React, { createContext, useContext, ReactNode } from "react";

interface ShadowRootContextType {
  container: HTMLElement | null;
}

const ShadowRootContext = createContext<ShadowRootContextType>({
  container: null,
});

export const useShadowRoot = () => {
  const context = useContext(ShadowRootContext);
  if (!context) {
    throw new Error("useShadowRoot must be used within a ShadowRootProvider");
  }
  return context;
};

interface ShadowRootProviderProps {
  children: ReactNode;
  container: HTMLElement;
}

export const ShadowRootProvider: React.FC<ShadowRootProviderProps> = ({
  children,
  container,
}) => {
  return (
    <ShadowRootContext.Provider value={{ container }}>
      {children}
    </ShadowRootContext.Provider>
  );
};
