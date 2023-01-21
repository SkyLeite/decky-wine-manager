use anyhow::Result;
use octocrab;

use crate::compat_tool::{CompatTool, Release};

pub struct ProtonGE {}

#[async_trait]
impl CompatTool for ProtonGE {
    async fn get_releases() -> Result<Vec<Release>> {
        octocrab::instance()
            .repos("GloriousEggroll", "proton-ge-custom")
            .releases()
            .list()
            .send()
            .await?
            .take_items()
            .iter()
            .map(|release| (*release).clone().try_into())
            .filter(|release| release.is_ok())
            .collect()
    }
}

impl TryFrom<octocrab::models::repos::Release> for Release {
    type Error = anyhow::Error;

    fn try_from(release: octocrab::models::repos::Release) -> Result<Self, Self::Error> {
        release
            .assets
            .iter()
            .find(|asset| asset.content_type == "application/gzip")
            .map(|asset| asset.browser_download_url.clone())
            .map_or(Err(anyhow!("Download URL not found")), |url| {
                Ok(Release {
                    id: release.id.to_string(),
                    name: release.tag_name,
                    download_url: url,
                })
            })
    }
}

#[cfg(test)]
#[tokio::test]
async fn should_get_releases() {
    let releases = ProtonGE::get_releases().await.unwrap();

    // Sick test bro
    assert_eq!(true, releases.len() > 0)
}

#[cfg(test)]
#[tokio::test]
async fn should_install_release() {
    let releases = ProtonGE::get_releases().await.unwrap();
    let release = &releases[0];

    ProtonGE::install_release(release.id.clone(), std::path::Path::new("./out"))
        .await
        .unwrap();
}
