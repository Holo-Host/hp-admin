{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agents =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcScJyCCFZ83Mgt74vxzU5fabdtw8vcmbc7nkkY9HNabig36PUinfDzjebbu54r";
  }
  {
    id = "hp-admin-agent-2";
    name = "HP Admin 2";
    keystore_file = "agent-2.key";
    public_address = "HcScJNpnC8kabp59w89Z9GhfHw7VdycrmZP7yaBAP7i3sxynx6KO8Pvm3ai6iiz";
  }];

}
