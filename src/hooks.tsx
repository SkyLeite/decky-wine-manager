import { useContext } from "react";
import { ServerContext } from "./context";
import { useQuery } from "react-query";
import { ServerAPI } from "decky-frontend-lib";

const useServerCall = <T,>(method: string, args: any) => {
  const server = useServer();

  return useQuery([method, args], async () => {
    if (!server) {
      throw new Error("ServerAPI not found.");
    }

    const result = await server.callPluginMethod<any, T>(method, args);

    if (result.success) {
      return result.result;
    } else {
      throw new Error(result.result);
    }
  });
};

export const useServer = () => {
  const server = useContext(ServerContext);
  return server;
};

export const useProtonInstalls = () => {
  type ProtonVersion = {
    version: string;
    name: string;
  };

  const response = useServerCall<ProtonVersion[]>("get_proton_installs", {});

  return response;
};

export const useProtonReleases = () => {
  type GithubRelease = {
    tag_name: string;
  };

  const releases = useServerCall<GithubRelease[]>("get_available_releases", {});

  return releases;
};
