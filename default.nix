{ pkgs ? import ./pkgs.nix {} }:

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
    id = dna.name;
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
    dna = dna.name;
    id = agent.public_address+"::<happ_id>-"+dna.name;
    storage = {
      path = ".holochain/holo/storage/${agent.public_address+"::<happ_id>-"+dna.name}";
      type = "file";
    };
  }) config.agents;


  multiInterfaceInstanceConfig = dna: map (agent: {
    id = agent.public_address+"::<happ_id>-"+dna.name;
  }) config.agents;

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

  hp-admin = stdenv.mkDerivation rec {
    name = "hp-admin";
    src = gitignoreSource ./.;

    nativeBuildInputs = [
      holochain-cli
      holochain-conductor
      nodejs-12_x
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
  };

  holofuel-ui = stdenv.mkDerivation rec {
    name = "holofuel-ui";
    src = gitignoreSource ./.;

    nativeBuildInputs = [
      holochain-cli
      holochain-conductor
      nodejs-12_x
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
  };

  hp-admin-conductor-config = writeTOML {
    bridges = [];
    persistence_dir = ".holochain/holo";
    agents = map agentConfig config.agents;
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
