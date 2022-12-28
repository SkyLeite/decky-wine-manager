import { FC } from "react";
import { Menu, MenuItem } from "decky-frontend-lib";
import { useInstallProtonRelease, useProtonRelease } from "./hooks";

type Props = {
  id: string;
};

const InstallRelease: FC<Props> = ({ id }) => {
  const release = useProtonRelease(id);
  const install = useInstallProtonRelease();

  if (release.loading || !release.data) {
    return null;
  }

  return (
    <Menu
      label={release.data?.tag_name}
      cancelText="Cancel"
      onCancel={() => {}}
    >
      <MenuItem onSelected={() => install(id)}>Install</MenuItem>
    </Menu>
  );
};

export default InstallRelease;
