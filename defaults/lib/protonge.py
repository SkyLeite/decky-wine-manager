import os
import sys
from typing import TypedDict
import aiohttp
from helpers import get_ssl_context


async def get_releases():
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases",
            ssl=get_ssl_context(),
        ) as response:
            print("Status:", response.status)
            print("Content-type:", response.headers["content-type"])

            releases = await response.json()

            valid_releases = []

            # Filter out releases without a gzip asset
            for release in releases:
                for asset in release["assets"]:
                    if asset["content_type"] == "application/gzip":
                        valid_releases.append(release)

            return valid_releases


async def get_release_by_tag_name(tag_name):
    releases = await get_releases()
    return next(x for x in releases if x["tag_name"] == tag_name)
