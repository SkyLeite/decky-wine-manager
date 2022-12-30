import os
import sys
from typing import TypedDict
import aiohttp

async def get_releases():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases", ssl=False) as response:
            print("Status:", response.status)
            print("Content-type:", response.headers['content-type'])

            response = await response.json()
            return response

async def get_release_by_tag_name(tag_name):
    releases = await get_releases()
    return next(x for x in releases if x['tag_name'] == tag_name)
