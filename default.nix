{ pkgs ? import ./pkgs.nix {}, shell ? false }:

with pkgs;

let
  config = import ./config.nix;

  run-unit-test = pkgs.writeShellScriptBin "run-unit-test"
  ''
    ( rm -rf node_modules  ) \
    &&  npm install --build-from-source  \
    && npm run test:ci
  '';

  build-hp-admin = pkgs.writeShellScriptBin "build-hp-admin"
  ''
    ( rm -rf node_modules  ) \
    &&  npm install --build-from-source  \
    && npm run build
  '';

  build-holofuel = pkgs.writeShellScriptBin "build-holofuel"
  ''
    ( rm -rf node_modules  ) \
    &&  npm install --build-from-source  \
    && npm run build:holofuel
  '';

  dnaConfig = dna: {
    id = dna.name+"-dna";
    file = "${dna}/${dna.name}.dna.json";
    hash = dnaHash dna;
  };

  agentConfig = agent: {
    id = agent.id;
    name = agent.name;
    keystore_file = agent.keystore_file;
    public_address = agent.public_address;
  };

  multiInstanceConfig = dna: map (agent: {
    agent = agent.id;
    dna = dna.name+"-dna";
    id = dna.name;
    storage = {
      path = ".holochain/holo/storage/${agent.id}/${dna.name}";
      type = "file";
    };
  }) config.agent1;

  multiInterfaceInstanceConfig = dna: map (agent: {
    id = dna.name;
  }) config.agent1;

  multiInterfaceInstanceConfig2 = dna: map (agent: {
    id = dna.name;
  }) config.agent2;

  multiInstanceConfig2 = dna: map (agent: {
    agent = agent.id;
    dna = dna.name+"-dna";
    id = dna.name;
    storage = {
      path = ".holochain/holo/storage/${agent.id}/${dna.name}";
      type = "file";
    };
  }) config.agent2;

  flatten = x:
    if builtins.isList x
    then builtins.concatMap (y: flatten y) x
    else [x];

  dnas = with dnaPackages; [
    happ-store
    holo-hosting-app
    holofuel
  ];
in

{

  hp-admin-ui = stdenv.mkDerivation rec {
    inherit shell;
    name = "hp-admin-ui";
    src = gitignoreSource ./.;

    nativeBuildInputs = [
      holochain-rust
      nodejs
      pkgconfig
      cairo
      giflib
      libjpeg
      libpng
      libuuid
      pango
      pixman
    ];

    buildInputs = [
      run-unit-test
      build-hp-admin
    ];

    preConfigure = ''
      cp -r ${npmToNix { src = "${src}/"; }} node_modules
      chmod -R +w node_modules
      chmod +x node_modules/.bin/webpack
      patchShebangs node_modules
    '';

    buildPhase = ''
      npm run build
      cp -r build/ hp-admin/
    '';

    installPhase = ''
      mv hp-admin $out
    '';

    checkPhase = ''
      npm run test:ci
    '';

    doCheck = false;
    meta.platforms = stdenv.lib.platforms.linux;
  };

  holofuel-ui = stdenv.mkDerivation rec {
    name = "holofuel-ui";
    src = gitignoreSource ./.;

    nativeBuildInputs = [
      holochain-rust
      nodejs
      pkgconfig
      cairo
      giflib
      libjpeg
      libpng
      libuuid
      pango
      pixman
    ];

    buildInputs = [
      run-unit-test
      build-holofuel
    ];

    preConfigure = ''
      cp -r ${npmToNix { src = "${src}/"; }} node_modules
      chmod -R +w node_modules
      chmod +x node_modules/.bin/webpack
      patchShebangs node_modules
    '';

    buildPhase = ''
      npm run build:holofuel
      cp -r build/ holofuel/
    '';

    installPhase = ''
      mv holofuel $out
    '';

    checkPhase = ''
      npm run test:ci
    '';

    doCheck = false;
    meta.platforms = stdenv.lib.platforms.linux;
  };

  hp-admin-conductor-config = writeTOML {
    bridges = [];
    persistence_dir = ".holochain/holo";
    agents = map agentConfig config.agent1;
    dnas = map dnaConfig dnas;
    instances = flatten(map multiInstanceConfig dnas);
    interfaces = [
      {
        id = "websocket-interface";
        driver = {
          port = 3400;
          type = "websocket";
        };
        instances = flatten(map multiInterfaceInstanceConfig dnas);
      }
      {
        id = "http-interface";
        admin = true;
        driver = {
          port = 3300;
          type = "http";
        };
        instances = flatten(map multiInterfaceInstanceConfig dnas);
      }
    ];
    network = {
      sim2h_url = "ws://public.sim2h.net:9000";
      type = "sim2h";
    };
    logger = {
      type = "debug";
      rules.rules = [
        {
          color = "red";
          exclude = false;
          pattern = "^err/";
        }
        {
          color = "white";
          exclude = false;
          pattern = "^debug/dna";
        }
      ];
    };
  };


  hp-admin-extra-conductor-config = writeTOML {
    bridges = [];
    persistence_dir = ".holochain/holo";
    agents = map agentConfig config.agent2;
    dnas = map dnaConfig dnas;
    instances = flatten(map multiInstanceConfig2 dnas);
    interfaces = [
      {
        id = "websocket-interface";
        driver = {
          port = 3401;
          type = "websocket";
        };
        instances = flatten(map multiInterfaceInstanceConfig2 dnas);
      }
      {
        id = "http-interface";
        admin = true;
        driver = {
          port = 3301;
          type = "http";
        };
        instances = flatten(map multiInterfaceInstanceConfig2 dnas);
      }
    ];
    network = {
      sim2h_url = "ws://public.sim2h.net:9000";
      type = "sim2h";
    };
    logger = {
      type = "debug";
      rules.rules = [
        {
          color = "red";
          exclude = false;
          pattern = "^err/";
        }
        {
          color = "white";
          exclude = false;
          pattern = "^debug/dna";
        }
      ];
    };
  };
}
