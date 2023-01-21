use std::sync::Arc;

use crate::compat_tool::Release;

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
        }
    });
}
