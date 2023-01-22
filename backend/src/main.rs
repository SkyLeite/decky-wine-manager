use compat_tool::{CompatTool, Install};
use rocket::response::status::NotFound;
use rocket::response::Debug;
use rocket::serde::json::Json;
use rocket::State;
use std::collections::HashMap;
use std::path::{self, PathBuf};
use std::sync::Arc;
use tokio::sync::RwLock;
use tools::ProtonGE;
use vdf::CompatTools;
use ws::WS;

use crate::compat_tool::Release;
use crate::queue::TaskQueue;

pub mod compat_tool;
pub mod queue;
pub mod tools;
pub mod vdf;
pub mod ws;

#[macro_use]
extern crate anyhow;

#[macro_use]
extern crate rocket;

#[get("/releases")]
async fn releases() -> Result<Json<HashMap<String, Vec<Release>>>, Debug<anyhow::Error>> {
    let mut compat_tools = HashMap::new();

    compat_tools.insert("protonge".to_string(), ProtonGE::get_releases().await?);

    Ok(Json(compat_tools))
}

#[get("/install/<tool>/<id>")]
async fn install(
    tool: &str,
    id: &str,
    queue: &State<Arc<TaskQueue>>,
) -> Result<(), Debug<anyhow::Error>> {
    match tool {
        "protonge" => {
            let release = ProtonGE::get_releases()
                .await?
                .into_iter()
                .find(|release| release.id == id);

            queue.push(release.unwrap());

            Ok(())
        }
        _ => Err(Debug(anyhow!("Tool not found"))),
    }
}

#[get("/installs")]
async fn installs(compat_tools_dir: &State<PathBuf>) -> Json<Vec<Install>> {
    let dirs = std::fs::read_dir(compat_tools_dir.as_path()).unwrap();

    Json(
        dirs.into_iter()
            .map(|res| res.unwrap())
            .filter(|entry| entry.path().is_dir())
            .map(|entry| {
                let vdf_path = entry.path().join("compatibilitytool.vdf");
                let vdf_str = std::fs::read_to_string(vdf_path)?;
                let tools: CompatTools = keyvalues_serde::from_str(&vdf_str)?;

                let tool = tools
                    .compat_tools
                    .values()
                    .next()
                    .ok_or(std::io::Error::new(
                        std::io::ErrorKind::NotFound,
                        "No compatibility tool specified in vdf file",
                    ))?;

                Ok(Install::from(tool.clone()))
            })
            .filter_map(|x: Result<Install, Box<dyn std::error::Error>>| x.ok())
            .collect(),
    )
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let compat_tools_dir = std::env::var("COMPAT_TOOL_DIR")
        .as_ref()
        .map(|var| std::path::Path::new(var).to_owned())
        .expect("Could not find COMPAT_TOOL_DIR environment variable");

    let ws_server = Arc::new(RwLock::new(ws::WS::new(6969)));

    let queue = queue::new();
    queue::start_worker(&queue, &ws_server.clone(), compat_tools_dir.clone());

    tokio::spawn(async move {
        WS::poll(&ws_server.clone()).await;
    });

    let _rocket = rocket::build()
        .mount("/", routes![releases, install, installs])
        .manage(queue)
        .manage(compat_tools_dir)
        .launch()
        .await?;

    Ok(())
}
