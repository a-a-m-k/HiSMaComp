import type { ReactNode } from "react";

export const createPassthroughAppProvider = () => ({
  AppProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
});
