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

from lib import protonge
import aiohttp
import asyncio

proton_installs_path = "/home/deck/.steam/root/compatibilitytools.d"

logging.basicConfig(filename="/tmp/proton-manager.log",
                    format='[Template] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.DEBUG) # can be changed to logging.DEBUG for debugging issues

class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    def _get_version_from_name(name):
        path = proton_installs_path + "/" + name + "/version"
        version_string = None

        with open(path) as version:
            version_string = version.read()

        split_version_string = version_string.split(" ")

        return {
            "version": split_version_string[0],
            "name": split_version_string[1]
        }

    async def get_proton_installs(self):
        entries = os.listdir(proton_installs_path)
        return [self._get_version_from_name(entry) for entry in entries]

    async def get_available_releases(self):
        return await protonge.get_releases()

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
    
    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass

def test():
    foo = Plugin()
    async def p():
        print(await foo.get_available_releases())

    loop = asyncio.get_event_loop()
    loop.run_until_complete(p())
