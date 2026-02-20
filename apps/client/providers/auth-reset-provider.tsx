"use client";

import { createContext, useContext, useState } from "react";

const AuthResetContext = createContext<{
  version: number;
  reset: () => void;
}>({
  version: 0,
  reset: () => {},
});

export function AuthResetProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);

  const reset = () => setVersion((v) => v + 1);

  return (
    <AuthResetContext.Provider value={{ version, reset }}>
      {children}
    </AuthResetContext.Provider>
  );
}

export function useAuthReset() {
  return useContext(AuthResetContext);
}
