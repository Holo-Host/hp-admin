{ pkgs ? import ./nixpkgs.nix {} }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  inputsFrom = lib.attrValues (import ./. { inherit pkgs; });

  shellHook = ''
    rm -f conductor-config.toml
    rm -f conductor-config-extra.toml
    ln -s ${project.hp-admin-conductor-config} conductor-config.toml
    ln -s ${project.hp-admin-extra-conductor-config} conductor-config-extra.toml
    trap cleanup EXIT
  '';
}
