{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agent1 =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcSCjCvkR5uywn6z5t9SBFtTs7p83Ex3urUtpY8jsUa7pn3zdF6XJU4U6tuzpui";
  }];
  agent2 =[{
    id = "hp-admin-agent-2";
    name = "HP Admin 2";
    keystore_file = "agent-2.key";
    public_address = "HcSCiRv3ihjkgksj986C6sHj9FMZhdog4shw5mjYUi8zrukrCxIzfWovqa9jcxa";
  }];
}
