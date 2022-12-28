import { useMemo, VFC } from "react";
import { Menu, MenuItem } from "decky-frontend-lib";
import {
  useProtonInstalls,
  useProtonReleases,
  useShowInstallRelease,
} from "./hooks";

const ReleaseList: VFC = () => {
  const installRelease = useShowInstallRelease();
  const releases = useProtonReleases();
  const installs = useProtonInstalls();

  const notInstalledReleases = useMemo(() => {
    if (releases.isSuccess && installs.isSuccess) {
      const installedTags = installs.data.map((install) => install.name);
      return releases.data.filter(
        (release) => !installedTags.includes(release.tag_name)
      );
    } else {
      return [];
    }
  }, [releases, installs]);

  if (releases.isLoading) {
    return <span>Loading...</span>;
  }

  if (releases.isSuccess) {
    return (
      <Menu
        label="Available Proton GE versions"
        cancelText="Cancel"
        onCancel={() => {}}
      >
        {notInstalledReleases.map((release) => (
          <MenuItem onSelected={() => installRelease(release.id)}>
            {release.tag_name}
          </MenuItem>
        ))}
      </Menu>
    );
  }

  return <span>{releases.error}</span>;
};

export default ReleaseList;
