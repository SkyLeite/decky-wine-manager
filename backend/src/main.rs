use compat_tool::CompatTool;
use rocket::response::Debug;
use rocket::serde::json::Json;
use rocket::State;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tools::ProtonGE;
use ws::WS;

use crate::compat_tool::Release;
use crate::queue::TaskQueue;

pub mod compat_tool;
pub mod queue;
pub mod tools;
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

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let ws_server = Arc::new(RwLock::new(ws::WS::new(6969)));

    let queue = queue::new();
    queue::start_worker(&queue, &ws_server.clone());

    tokio::spawn(async move {
        WS::poll(&ws_server.clone()).await;
    });

    let _rocket = rocket::build()
        .mount("/", routes![releases, install])
        .manage(queue)
        .launch()
        .await?;

    Ok(())
}
