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
    rm -f conductor-config-1.toml
    rm -f conductor-config-2.toml
    rm -f conductor-config-test.toml
    ln -s ${project.hp-admin-conductor-config-1} conductor-config-1.toml
    ln -s ${project.hp-admin-conductor-config-2} conductor-config-2.toml
    ln -s ${project.hp-admin-conductor-config-test} conductor-config-test.toml
    trap cleanup EXIT
  '';
}
