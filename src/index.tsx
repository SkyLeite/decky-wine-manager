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
import {
  usePrevious,
  useProtonInstalls,
  useShowManageInstallMenu,
  useShowReleaseList,
  useToast,
} from "./hooks";
import Spinner from "./Spinner";

import styles from "../assets/styles.css";
import { useShowContextMenu } from "./hooks";

let pendingRestart = false;

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
  const showManageInstallMenu = useShowManageInstallMenu();
  const previousProtonInstalls = usePrevious(protonInstalls);
  const toast = useToast();

  const isPendingRestart = useMemo(() => {
    if (pendingRestart) return true;
    if (!protonInstalls?.isSuccess) return false;
    if (!previousProtonInstalls?.isSuccess) return false;

    return protonInstalls.data.reduce((acc, current) => {
      const foundPreviousInstall = previousProtonInstalls.data.find(
        (install) => install.name == current.name
      );

      if (
        foundPreviousInstall &&
        foundPreviousInstall.status == "installing" &&
        current.status == "installed"
      ) {
        toast({
          title: "Success",
          body: `${foundPreviousInstall.name} has been installed!`,
        });
        pendingRestart = true;
        return true;
      }
    }, false);
  }, [protonInstalls]);

  if (protonInstalls.isError) {
    return <span>{protonInstalls.error}</span>;
  }

  if (protonInstalls.isSuccess) {
    return (
      <div>
        {isPendingRestart && (
          <p style={{ paddingLeft: "20px", paddingBottom: "10px" }}>
            Please restart Steam to apply your changes
          </p>
        )}
        <PanelSection title="Installs">
          {protonInstalls.data.map((proton) => (
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                onClick={() => showManageInstallMenu(proton.name)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{proton.name}</span>
                  {proton.status == "installed" && (
                    <FaCheck style={{ display: "block" }} />
                  )}
                  {proton.status == "installing" && <Spinner />}
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

  return {
    title: <div className={staticClasses.Title}>Proton Manager</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
