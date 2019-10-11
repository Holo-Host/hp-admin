{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  config = import ./config.nix;

  hp-test = pkgs.writeShellScriptBin "hp-test"
  ''
   ( npm install --build-from-source  ) \
   && npm run test
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
    id = dna.name+"::"+agent.id;
    storage = {
      path = ".holochain/holo/storage/${dna.name+"::"+agent.id}";
      type = "file";
    };
  }) config.agents;


  multiInterfaceInstanceConfig = dna: map (agent: {
    id = dna.name+"::"+agent.id;
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
      hp-test
      nodejs-12_x
      pkgconfig
    ];

    checkPhase = ''
      npm run test:unit
    '';

    buildInputs = [
      cairo
      giflib
      libjpeg
      libpng
      libuuid
      pango
      pixman
    ];

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
