{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  config = import ./config.nix;

  run-unit-test = pkgs.writeShellScriptBin "run-unit-test"
  ''
    ( rm -rf node_modules  ) \
    &&  npm install --build-from-source  \
    && npm run test:all
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
      build-holofuel
    ];

    preConfigure = ''
    rm -rf node_modules
    && npm install --build-from-source
    '';

    buildPhase = ''
      npm run build
    '';

    installPhase = ''
      mkdir $out
      mv * $out
    '';

    checkPhase = ''
      npm run test:all
    '';

    doCheck = true;
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
