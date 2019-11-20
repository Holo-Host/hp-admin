{

  # Set Conductor Agents below. This file will be used to generate the conductor-config.toml
  # Add the number of agents desired to spin up within the same conductor

  agents =[{
    id = "hp-admin-agent";
    name = "HP Admin";
    keystore_file = "agent.key";
    public_address = "HcScIio76M8cbDqhrsZKp37W8YZ4y8X9v9epzbyhRzqpjeb5sigdC4puN6b5koi";
  }
  {
    id = "hp-admin-agent-2";
    name = "HP Admin 2";
    keystore_file = "agent-2.key";
    public_address = "HcScjSPMA9g46x6nosEih9thqwvesx53udZEkqMfqcwnbw9sZKPSyIFNvtfxrqi";
  }];

}
