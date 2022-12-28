import { FC } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ServerAPI } from "decky-frontend-lib";
import { createContext } from "react";

export const ServerContext = createContext<ServerAPI | undefined>(undefined);

const queryClient = new QueryClient();

type Props = {
  server: ServerAPI;
};

const AppContext: FC<Props> = ({ server, children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerContext.Provider value={server}>{children}</ServerContext.Provider>
    </QueryClientProvider>
  );
};

export default AppContext;
