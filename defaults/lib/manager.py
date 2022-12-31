from typing import TypedDict
import logging
import aiohttp
import tarfile
import io
import os
import shutil

logger = logging.getLogger()
proton_installs_path = "/home/deck/.steam/root/compatibilitytools.d"


class Release(TypedDict):
    name: str
    content_type: str
    download_url: str


def _is_already_installed(name: str):
    return os.path.exists(proton_installs_path + "/" + name)


async def install_release(release: Release):
    async with aiohttp.ClientSession() as session:
        async with session.get(release["download_url"], ssl=False) as resp:
            if (
                resp.status == 200
                and not _is_already_installed(release["name"])
                and release["content_type"] == "application/gzip"
            ):
                path = proton_installs_path + "/"

                logger.debug(f"Extracting release to {path}")
                b = io.BytesIO(await resp.read())
                tar = tarfile.open(fileobj=b, mode='r:gz')
                tar.extractall(path)


async def remove_release(name: str):
    path = proton_installs_path + "/" + name
    shutil.rmtree(path)
