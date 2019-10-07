{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  buildInputs = project.hp-admin.nativeBuildInputs;

  shellHook = ''
    rm -f conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} conductor-config.toml
  '';
}
