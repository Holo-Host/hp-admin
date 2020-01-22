{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agent1 =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcSCijyZjXXigf6e57KSi5TwYaJfb5btqWzWOCCF4dbx4wv4aTEW6GiUzayv44r";
  }];
  agent2 =[{
    id = "hp-admin-agent-2";
    name = "HP Admin 2";
    keystore_file = "agent-2.key";
    public_address = "HcSCiqz6M7BbBfk6xjRMV6K7QAETmienf5EbOi6V75CGT8sdV3hG9uDQCyw3eqi";
  }];
}
