# This is an example of the nix config file
# Name you config file `config.nix`

{

  # This is an array of the agents you need
  # Add any number of agents you want to spin up on the same conductor

  agents =[{
    id = "agent-1-id";
    name = "Agent 1";
    keystore_file = "<Path to keystore file>";
    public_address = "<public key>";
  }
  {
    id = "agent-2-id";
    name = "Agent 2";
    keystore_file = "<Path to keystore file>";
    public_address = "<public key>";
  }];

}
