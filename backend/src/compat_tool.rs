use std::path::Path;

use anyhow::{Context, Result};
use async_compression::futures::bufread::GzipDecoder;
use async_tar::Archive;
use reqwest::Url;
use serde::Serialize;

#[async_trait]
pub trait CompatTool {
    async fn get_releases() -> Result<Vec<Release>>;

    async fn install_release(id: &str, destination: &Path) -> Result<()> {
        let release = Self::get_releases()
            .await?
            .into_iter()
            .find(|release| release.id == id)
            .context("Release not found")?;

        println!("Downloading release... {}", release.download_url);
        let gunzip = reqwest::get(release.download_url).await?.bytes().await?;

        println!("Decoding release...");
        let tar = GzipDecoder::new(&*gunzip);

        println!("Extracting release...");
        let archive = Archive::new(tar);
        archive.unpack(destination).await?;

        println!("Installed");
        Ok(())
    }
}

#[derive(Serialize)]
pub struct Release {
    pub id: String,
    pub name: String,
    pub download_url: Url,
    pub tool: String,
}

#[derive(Serialize)]
pub struct Install {
    pub name: String,
    pub tool: String,
}

impl From<crate::vdf::CompatTool> for Install {
    fn from(value: crate::vdf::CompatTool) -> Self {
        Self {
            name: value.display_name,
            tool: "protonge".to_string(),
        }
    }
}
