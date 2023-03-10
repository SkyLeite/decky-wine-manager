import { ReactNode, useContext, useRef, useEffect } from "react";
import { ServerContext } from "./context";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { showContextMenu } from "decky-frontend-lib";
import AppContext from "./context";
import ReleaseList from "./ReleaseList";
import InstallRelease from "./InstallRelease";
import ManageRelease from "./ManageRelease";

const useServerCall = <T,>(
  method: string,
  args?: any,
  options?: Parameters<typeof useQuery>[2]
) => {
  const server = useServer();

  return useQuery(
    [method, args],
    async () => {
      if (!server) {
        throw new Error("ServerAPI not found.");
      }

      const result = await server.callPluginMethod<any, T>(method, args);

      if (result.success) {
        return result.result;
      } else {
        throw new Error(result.result);
      }
    },
    options
  );
};

const useServerMutation = <T,>(options?: Parameters<typeof useMutation>[2]) => {
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
    },
    options
  );
};

export const useServer = () => {
  const server = useContext(ServerContext);

  if (!server) {
    throw new Error("No Server found!");
  }

  return server;
};

export const useToast = () => {
  const server = useServer();
  return server.toaster.toast.bind(server.toaster);
};

export const useProtonInstalls = () => {
  type ProtonInstall = {
    version: string;
    name: string;
    status: "installed" | "installing";
  };

  const response = useServerCall<ProtonInstall[]>(
    "get_proton_installs",
    undefined,
    { refetchInterval: 5000 }
  );

  return response;
};

export const useProtonReleases = () => {
  type GithubRelease = {
    id: string;
    tag_name: string;
  };

  const releases = useServerCall<GithubRelease[]>("get_releases");

  return releases;
};

export const useInstallProtonRelease = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useServerMutation({
    onSuccess: (data, { args: { id } }) => {
      const { name } = data.find(
        (install) => String(install.version) == String(id)
      );

      queryClient.invalidateQueries("get_proton_installs");
      toast({
        title: "Success",
        body: `${name} is being installed!`,
      });
    },
  });

  return (id: string) =>
    mutation.mutate({
      method: "install_release",
      args: { id },
    });
};

export const useRemoveProtonRelease = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useServerMutation({
    onSuccess: (data, { args: { name } }) => {
      queryClient.invalidateQueries("get_proton_installs");
      toast({
        title: "Success",
        body: `${name} has been removed.`,
      });
    },
  });

  return (name: string) =>
    mutation.mutate({
      method: "remove_release",
      args: { name },
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
    return showMenu(<InstallRelease id={id} />);
  };
};

export const useShowManageInstallMenu = () => {
  const showMenu = useShowContextMenu();
  return (name: string) => {
    return showMenu(<ManageRelease name={name} />);
  };
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
};
