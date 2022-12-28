import { ServerAPI } from "decky-frontend-lib";
import { createContext } from "react";

export const ServerContext = createContext<ServerAPI | null>(null);
