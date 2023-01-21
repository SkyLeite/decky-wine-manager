use std::collections::HashMap;
use std::path::Path;

use compat_tool::CompatTool;
use rocket::response::Debug;
use rocket::serde::json::Json;
use rocket::Response;
use tools::ProtonGE;

use crate::compat_tool::Release;

pub mod compat_tool;
pub mod tools;

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
async fn install(tool: &str, id: &str) -> Result<(), Debug<anyhow::Error>> {
    let destination = Path::new("./out");

    match tool {
        "protonge" => Ok(ProtonGE::install_release(id, destination).await?),
        _ => Err(Debug(anyhow!("Tool not found"))),
    }
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let _rocket = rocket::build()
        .mount("/", routes![releases, install])
        .launch()
        .await?;

    Ok(())
}
