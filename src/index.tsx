import {
  ButtonItem,
  definePlugin,
  DialogButton,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  staticClasses,
  showContextMenu,
} from "decky-frontend-lib";
import { QueryClient, QueryClientProvider } from "react-query";
import { useMemo, VFC } from "react";
import { FaShip } from "react-icons/fa";
import ReleaseList from "./ReleaseList";
import { ServerContext } from "./context";
import { useProtonInstalls, useProtonReleases, useServer } from "./hooks";

const Manage: VFC = () => {
  const releases = useProtonReleases();

  return (
    <PanelSection title="Manage">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e) => {
            showContextMenu(
              <ReleaseList releases={releases} />,
              e.currentTarget ?? window
            );
          }}
        >
          Add New
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const VersionList: VFC = () => {
  const protonInstalls = useProtonInstalls();

  if (protonInstalls.isError) {
    return <span>{protonInstalls.error}</span>;
  }

  if (protonInstalls.isSuccess) {
    return (
      <PanelSection title="Proton Installs">
        <PanelSectionRow>
          {protonInstalls.data.map((proton) => (
            <ButtonItem layout="below">{proton.name}</ButtonItem>
          ))}
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return null;
};

const queryClient = new QueryClient();

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const api = useMemo(() => serverAPI, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ServerContext.Provider value={api}>
        <Manage />
        <VersionList />
      </ServerContext.Provider>
    </QueryClientProvider>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Proton Manager</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
