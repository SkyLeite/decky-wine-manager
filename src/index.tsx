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
import { useMemo, VFC } from "react";
import { FaCheck, FaShip, FaSpinner } from "react-icons/fa";
import AppContext from "./context";
import { useProtonInstalls, useShowReleaseList } from "./hooks";
import Spinner from "./Spinner";

import styles from "../assets/styles.css";

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
  const installsByStatus = useMemo(() => {
    const initialState = { installed: [], installing: [] };
    if (!protonInstalls.data) return initialState;

    return protonInstalls.data.reduce((acc, current) => {
      if (acc[current.status]) {
        acc[current.status].push(current);
      } else {
        acc[current.status] = [current];
      }

      return acc;
    }, initialState);
  }, [protonInstalls.isFetched]);

  if (protonInstalls.isError) {
    return <span>{protonInstalls.error}</span>;
  }

  if (protonInstalls.isSuccess) {
    return (
      <div>
        {installsByStatus.installing.length > 0 && (
          <PanelSection title="Installing">
            {installsByStatus.installing.map((install) => (
              <PanelSectionRow>
                <ButtonItem layout="below">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{install.name}</span>
                    <Spinner />
                  </div>
                </ButtonItem>
              </PanelSectionRow>
            ))}
          </PanelSection>
        )}

        <PanelSection title="Installed">
          {installsByStatus.installed.map((install) => (
            <PanelSectionRow>
              <ButtonItem layout="below">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{install.name}</span>
                </div>
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </PanelSection>
      </div>
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
  serverApi.injectCssIntoTab("QuickAccess_uid2", styles);

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
