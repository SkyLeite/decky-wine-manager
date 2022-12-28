import {
  ButtonItem,
  definePlugin,
  DialogButton,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";
import AppContext from "./context";
import { useProtonInstalls, useShowReleaseList } from "./hooks";

const Manage: VFC = () => {
  const showReleaseList = useShowReleaseList();

  return (
    <PanelSection title="Manage">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => showReleaseList()}>
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
      <PanelSection title="Installs">
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

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <AppContext server={serverAPI}>
      <Manage />
      <VersionList />
    </AppContext>
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
