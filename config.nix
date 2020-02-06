{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agent1 =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcSCJbW65qIyJdcx5g3F3z8SPw7B4BR7cSJWaGtzBksaa95yu9Bcy5dJfYi38pi";
  }];
  agent2 =[{
    id = "hp-admin-agent-2";
    name = "HP Admin 2";
    keystore_file = "agent-2.key";
    public_address = "HcSCjPnJbyAd7vfh94788XriOBbBUxa97dZOfs6uPr69ban9j9wMK8hAna34uez";
  }];
}
