def get_plugin_dir():
    from pathlib import Path

    return Path(__file__).parent.resolve()


def add_plugin_to_path():
    import sys

    plugin_dir = get_plugin_dir()
    directories = [["./"], ["vendor"]]
    for dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*dir)))


add_plugin_to_path()

import logging
import os
import sys

from lib import protonge, manager
from helpers import get_user
import aiohttp
import asyncio

proton_installs_path = f"/home/{get_user()}/.steam/root/compatibilitytools.d"

logging.basicConfig(
    filename="/tmp/proton-manager.log",
    format="[Template] %(asctime)s %(levelname)s %(message)s",
    filemode="w+",
    force=True,
)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)  # can be changed to logging.DEBUG for debugging issues


class Plugin:
    in_progress_installs = []

    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    def _get_version_from_name(name, status):
        path = proton_installs_path + "/" + name + "/version"
        version_string = None

        with open(path) as version:
            version_string = version.read()

        split_version_string = version_string.split(" ")

        return {
            "version": split_version_string[0].strip(),
            "name": split_version_string[1].strip(),
            "status": status,
        }

    async def get_proton_installs(self):
        entries = os.listdir(proton_installs_path)
        existing_installs = [
            self._get_version_from_name(entry, "installed") for entry in entries
        ]

        return existing_installs + self.in_progress_installs

    async def get_releases(self):
        return await protonge.get_releases()

    async def install_release(self, id):
        logger.info(f"Reached! I should now be installing {id}")
        releases = await self.get_releases(self)
        release = next(x for x in releases if str(x["id"]) == str(id))

        self.in_progress_installs.append(
            {"version": id, "name": release["tag_name"], "status": "installing"}
        )
        return await self.get_proton_installs(self)

    async def remove_release(self, name):
        await manager.remove_release(name)

        return await self.get_proton_installs(self)

    async def _worker(self):
        while True:
            try:
                pending_install = self.in_progress_installs[-1]
            except IndexError:
                logger.debug("No pending installs. Sleeping.")
                await asyncio.sleep(5)
                pass
            else:
                logger.info(
                    f"Found pending install of {pending_install['name']}. Installing..."
                )

                # Sleep for the "sleep_for" seconds.
                ge_release = await protonge.get_release_by_tag_name(
                    pending_install["name"]
                )
                logger.debug(f"Found release {ge_release['tag_name']}")

                asset = next(
                    x
                    for x in ge_release["assets"]
                    if x["content_type"] == "application/gzip"
                )
                logger.debug(f"Found asset {asset['name']}")

                release = {
                    "name": pending_install["name"],
                    "content_type": asset["content_type"],
                    "download_url": asset["browser_download_url"],
                }
                await manager.install_release(release)

                logger.info(f"Installed {pending_install['name']} successfully")
                self.in_progress_installs.pop()

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        await self._worker(self)
        logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass


def test():
    foo = Plugin()

    async def p():
        # print(await foo.get_available_releases())
        print(await foo.install_release(70701211))

    loop = asyncio.get_event_loop()
    loop.run_until_complete(p())
