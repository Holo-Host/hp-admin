{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  inputsFrom = lib.attrValues (import ./. { inherit pkgs; });

  shellHook = ''
    rm -f conductor-config.toml
    rm -f src/utils/integration-testing/conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} src/utils/integration-testing/conductor-config.toml
    cleanup() {
      rm -rf .holochain
    }
    trap cleanup EXIT
  '';
}
