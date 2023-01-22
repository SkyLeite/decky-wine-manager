use simple_websockets::{Event, EventHub, Message, Responder};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

pub struct WS {
    event_hub: EventHub,
    clients: HashMap<u64, Responder>,
}

impl WS {
    pub fn new(port: u16) -> Self {
        WS {
            event_hub: simple_websockets::launch(port).expect("Failed to start websocket server"),
            clients: HashMap::new(),
        }
    }

    pub fn broadcast(&self, message: &str) {
        println!("Broadcasting...");
        self.clients.values().for_each(|responder| {
            dbg!("Broadcasting {} to {}", message, responder.client_id());
            responder.send(Message::Text(message.into()));
        });
    }

    pub async fn poll(ws: &Arc<RwLock<WS>>) {
        loop {
            let reader = ws.read().await;
            let event = reader.event_hub.poll_async().await;
            drop(reader);

            match event {
                Event::Connect(client_id, responder) => {
                    println!("A client connected with id #{}", client_id);
                    // add their Responder to our `clients` map:
                    ws.write().await.clients.insert(client_id, responder);
                }
                Event::Disconnect(client_id) => {
                    println!("Client #{} disconnected.", client_id);
                    // remove the disconnected client from the clients map:
                    ws.write().await.clients.remove(&client_id);
                }
                Event::Message(client_id, message) => {
                    println!(
                        "Received a message from client #{}: {:?}",
                        client_id, message
                    );
                    // retrieve this client's `Responder`:
                    let responder = ws
                        .clone()
                        .read()
                        .await
                        .clients
                        .get(&client_id)
                        .unwrap()
                        .clone();
                    // echo the message back:
                    responder.send(message);
                }
            }
        }
    }
}
