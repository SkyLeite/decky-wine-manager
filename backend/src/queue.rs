use std::{path::Path, sync::Arc};

use tokio::sync::RwLock;

use crate::{
    compat_tool::{CompatTool, Release},
    tools::ProtonGE,
    ws::WS,
};

pub type TaskQueue = deadqueue::unlimited::Queue<Release>;

pub fn new() -> Arc<TaskQueue> {
    Arc::new(TaskQueue::new())
}

pub fn start_worker(queue: &Arc<TaskQueue>, ws_server: &Arc<RwLock<WS>>) {
    let queue = queue.clone();
    let s = ws_server.clone();

    tokio::spawn(async move {
        loop {
            let release = queue.pop().await;
            println!("Found install {} {}", release.id, release.name);

            match release.tool.as_str() {
                "protonge" => {
                    s.read().await.broadcast(
                        format!("installing:{}:{}", &release.tool, &release.id).as_str(),
                    );
                    ProtonGE::install_release(&release.id, Path::new("./out"))
                        .await
                        .unwrap();
                    s.read()
                        .await
                        .broadcast(format!("installed:{}:{}", &release.tool, &release.id).as_str());
                }
                _ => println!("Not found"),
            }

            println!("Installed {} {}", release.id, release.name);
        }
    });
}
