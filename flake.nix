{
  description = "x402 Gateway for Circular Protocol";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            # npm is included with nodejs_20
            nodePackages.typescript-language-server
            just
            wrangler
          ];

          shellHook = ''
            echo "🚀 x402 Gateway Dev Environment"
            echo "Node.js $(node --version)"
            echo "npm $(npm --version)"
            echo "Just $(just --version)"
            echo ""
            echo "Run 'just' to see available commands."
          '';
        };
      }
    );
}
