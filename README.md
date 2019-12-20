# HoloPort Admin
> The entry point into the world of Holo as a Host.
## HoloPort Admin Setup Instructions

1. Clone local instance of repo with `git clone https://github.com/Holo-Host/hp-admin.git`
2. Install all dependencies with `npm i`

3. Decide which Root you'd like to run and follow the respective steps below.
    > Roots:
    >- HP Admin [calls HHA (host's side), HAS, and Hylo DNA endpoints]
    >- HoloFuel (solely calls holofuel DNA endpoints)

### HP Admin:

**Decide if you'll be using Mock or Live data.**

If referencing **Mock** Data :
- If running HP Admin, run `npm run start:mock` & proceed to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*

If referencing **Live** Data :
- Open 2 terminals.
##### Start the Conductors:
- In one of the termainals, open nix-shell by typing `nix-shell` (after this happens your terminal line should become neon green)
- Inside this nix-shell terminal, start the conductor for HP Admin, by typing in the command: `npm run hc:start-manual-1`
##### Open the UI
- In the remaining terminals, open the UI for HP Admin, by typing in the command: `npm run start:live`
- Visit `http://localhost:3001/` to view the HoloFuel UI as **HP Admin**.  
*(NB: This should automatically load and open up the correct url in your default browser.)*

---
### HoloFuel:

**Decide if you'll be using Mock or Live data.**

If referencing **Mock** Data :
- Run`npm run start:holofuel-mock` & proceed to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*
    
If referencing **Live** Data :
**NOTE: Please reference version v0.12.2 of the holofuel dna to test with the UI.**
- Open 2 terminals.
##### Start the Conductors:
- In one of the termainals, open nix-shell by typing `nix-shell` (after this happens your terminal line should become neon green)
- Inside this nix-shell terminal, start the conductor for HoloFuel, by typing in the command: `npm run hc:start-manual`
##### Open the UI
- In the remaining terminals, open the UI for HoloFuel, by typing in the command: `npm run start:holofuel-agent-1`
- Visit `http://localhost:3001/` to view the HoloFuel UI as **HP Admin**.  
*(NB: This should automatically load and open up the correct url in your default browser.)*

---
## Use with `nix-shell`

**What nix-shell does in the background?**
- Set `holochain` and `hc` binaries that are required to run the DNAs
- Auto generates the conductor-config.toml

**Setup:**

- Generate agent keystore files
  Run `hc keygen -n`

- Create a config.nix referencing the [example.config.nix](./example.config.nix)
  Config Requirements:
   - id
   - name
   - keystore_file - This will be the path to the keystore file that you generated;
   - public_address - This is the public key address in your keystore file ;
> You can add as many agent as you would like
> The nix shell will generate Instances of all the happs for each agent

- To spin up holochain conductor run the `nix-shell` in this repo

**Feature**
- `hp-test` - run all the unit test
- ... more coming soon

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
