import { ServerAPI } from "decky-frontend-lib";

type ProtonVersion = {
  version: string;
  name: string;
};

type GithubRelease = {
  tag_name: string;
};

export const getProtonInstalls = async (serverApi: ServerAPI) => {
  const response = await serverApi.callPluginMethod<any, ProtonVersion[]>(
    "get_proton_installs",
    {}
  );

  if (Array.isArray(response.result)) {
    return response.result;
  } else {
    return [];
  }
};

export const getAvailableReleases = async (serverApi: ServerAPI) => {
  const response = await serverApi.callPluginMethod<any, GithubRelease[]>(
    "get_available_releases",
    {}
  );

  return response.result;
};
