import { FC } from "react";
import { Menu, MenuItem } from "decky-frontend-lib";
import { useRemoveProtonRelease, useProtonRelease } from "./hooks";

type Props = {
  name: string;
};

const ManageRelease: FC<Props> = ({ name }) => {
  const remove = useRemoveProtonRelease();

  return (
    <Menu label={name} cancelText="Cancel" onCancel={() => {}}>
      <MenuItem onSelected={() => remove(name)}>Remove</MenuItem>
    </Menu>
  );
};

export default ManageRelease;
