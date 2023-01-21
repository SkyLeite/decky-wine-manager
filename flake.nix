{
  description = "A devShell example";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
      in with pkgs; {
        devShells.default = mkShell {
          buildInputs = [
            nodejs-18_x
            nodePackages.typescript-language-server
            nodePackages.typescript
            nodePackages.prettier
            nodePackages.eslint
            just
            rust-analyzer
            cargo
            cargo-edit
            gcc
            openssl
            pkg-config
            (rust-bin.selectLatestNightlyWith (toolchain:
              toolchain.default.override { extensions = [ "rust-src" ]; }))
          ];

          shellHook = ''
            alias ls=exa
            alias find=fd
          '';
        };
      });
}
