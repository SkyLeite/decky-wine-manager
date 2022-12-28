import { VFC } from "react";
import { Menu, MenuItem, ServerAPI } from "decky-frontend-lib";
import { useProtonReleases } from "./hooks";

type Props = {
  releases: ReturnType<typeof useProtonReleases>;
};

const ReleaseList: VFC<Props> = ({ releases }) => {
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
          <MenuItem onSelected={() => {}}>{release.tag_name}</MenuItem>
        ))}
      </Menu>
    );
  }

  return <span>{releases.error}</span>;
};

export default ReleaseList;
