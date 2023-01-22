use std::collections::HashMap;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct CompatTools {
    pub compat_tools: HashMap<String, CompatTool>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct CompatTool {
    pub install_path: String,
    pub display_name: String,
    pub from_oslist: String,
    pub to_oslist: String,
}
