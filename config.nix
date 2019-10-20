{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agents =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcScJyCCFZ83Mgt74vxzU5fabdtw8vcmbc7nkkY9HNabig36PUinfDzjebbu54r";
  }];

 # Additional Agents :
   # {
     # id = "hp-admin-agent-2";
     # name = "HP Admin 2";
     # keystore_file = "agent-2.key";
     # public_address = "HcSci8ToB8Ibond8mt4U9hOVzr4gdqnvkjy9MwgBdUuva4regRZCvm7Bxw6pv6z";
   # }
   # {
     # id = "hp-admin-agent-3";
     # name = "HP Admin 3";
     # keystore_file = "/home/lisa/.config/holochain/keys/HcSCJVx9ZnTCjyn3bx9V4sRu9pZMIsk9miRORQ7Z4aMgmch8MP78WAqbm66Napa";
     # public_address = "HcSCJVx9ZnTCjyn3bx9V4sRu9pZMIsk9miRORQ7Z4aMgmch8MP78WAqbm66Napa";
   # }];

}
