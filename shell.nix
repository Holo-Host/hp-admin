{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  buildInputs = project.hp-admin.nativeBuildInputs
  ++ [libuuid pkgconfig pixman cairo libpng libjpeg giflib pango];

  shellHook = ''
    rm -f conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} conductor-config.toml
    holochain -c conductor-config.toml &> conductor.log &
    echo $! > conductor.pid
    cleanup() {
      kill $(cat conductor.pid)
    }
    trap cleanup EXIT
  '';
}
