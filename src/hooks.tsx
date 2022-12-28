import { ReactNode, useContext } from "react";
import { ServerContext } from "./context";
import { useMutation, useQuery } from "react-query";
import { showContextMenu } from "decky-frontend-lib";
import AppContext from "./context";
import ReleaseList from "./ReleaseList";
import InstallRelease from "./InstallRelease";

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

const useServerMutation = <T,>() => {
  const server = useServer();

  return useMutation(
    async (args: { method: string; args: { [k: string]: any } }) => {
      if (!server) {
        throw new Error("ServerAPI not found.");
      }

      const result = await server.callPluginMethod<any, T>(
        args.method,
        args.args
      );

      if (result.success) {
        return result.result;
      } else {
        throw new Error(result.result);
      }
    }
  );
};

export const useServer = () => {
  const server = useContext(ServerContext);

  if (!server) {
    throw new Error("No Server found!");
  }

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
    id: string;
    tag_name: string;
  };

  const releases = useServerCall<GithubRelease[]>("get_available_releases", {});

  return releases;
};

export const useInstallProtonRelease = () => {
  const mutation = useServerMutation();

  return (id: string) =>
    mutation.mutate({
      method: "install_release",
      args: { id },
    });
};

export const useProtonRelease = (id: string) => {
  const releases = useProtonReleases();

  if (releases.isLoading) {
    return { loading: true, data: undefined };
  } else {
    const release = releases.data?.find((release) => release.id == id);
    return { loading: false, data: release };
  }
};

export const useShowContextMenu = () => {
  const server = useServer();

  return (children: ReactNode) =>
    showContextMenu(<AppContext server={server}>{children}</AppContext>);
};

export const useShowReleaseList = () => {
  const showMenu = useShowContextMenu();
  return () => showMenu(<ReleaseList />);
};

export const useShowInstallRelease = () => {
  const showMenu = useShowContextMenu();
  return (id: string) => {
    console.log(id);
    return showMenu(<InstallRelease id={id} />);
  };
};
