import { VFC } from "react";
import { Menu, MenuItem } from "decky-frontend-lib";
import { useProtonReleases, useShowInstallRelease } from "./hooks";

const ReleaseList: VFC = () => {
  const installRelease = useShowInstallRelease();
  const releases = useProtonReleases();

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
        {releases.data.map((release) => (
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
