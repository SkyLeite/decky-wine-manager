use std::{path::Path, sync::Arc};

use crate::{
    compat_tool::{CompatTool, Release},
    tools::ProtonGE,
};

pub type TaskQueue = deadqueue::unlimited::Queue<Release>;

pub fn new() -> Arc<TaskQueue> {
    Arc::new(TaskQueue::new())
}

pub fn start_worker(queue: &Arc<TaskQueue>) {
    let queue = queue.clone();

    tokio::spawn(async move {
        loop {
            let release = queue.pop().await;
            println!("Found install {} {}", release.id, release.name);

            match release.tool.as_str() {
                "protonge" => ProtonGE::install_release(&release.id, Path::new("./out"))
                    .await
                    .unwrap(),
                _ => println!("Not found"),
            }

            println!("Installed {} {}", release.id, release.name);
        }
    });
}
