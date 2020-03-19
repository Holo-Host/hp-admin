{ pkgs ? import ./nixpkgs.nix {}, shell ? false }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  inputsFrom = lib.attrValues  (import ./. {
    inherit pkgs;
    shell = true;
  });

  shellHook = ''
    rm -f conductor-config.toml
    rm -f conductor-config-extra.toml
    ln -s ${project.hp-admin-conductor-config-1} conductor-config-1.toml
    ln -s ${project.hp-admin-conductor-config-2} conductor-config-2.toml
    trap cleanup EXIT
  '';
}
