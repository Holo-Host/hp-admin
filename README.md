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
 - Verify that all global MOCK variables inside *./src/holochainClient.js (lines 5-13)* are set to **true**. *NB: This is the default behavior.
- If running HP Admin, run `npm run start` & proceed to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*

If referencing **Live** Data :
- Verify that all global MOCK variables inside *./src/holochainClient.js (lines 5-13)* are set to **false**. *(Tip: If running HoloFuel root, you can leave the hylo, happ-store, and hha DNA vars as true.)*
- Create a *.env* file at root and set contents to : `REACT_APP_DNA_INTERFACE_URL=ws://localhost:3400`
- Create the *./conductor-config.toml* file at root
- If running HP Admin, copy contents from *./conductor-config.example.toml* into the new conductor file
> NB: Make sure the ws driver port is the same number as the one listed in your *.env* file.
- Load HAS & HHA(provider's side) DHTs; run `npm run provider:flow`
- Start HP Admin by running`npm run start` & head over to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*

---
### HoloFuel:

**Decide if you'll be using Mock or Live data.**

If referencing **Mock** Data :
- Verify that all global MOCK variables inside *./src/holochainClient.js (lines 5-13)* are set to **true**. *NB: This is the default behavior.
- If running Holofuel, run `npm run start:holofuel` & proceed to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*
    
If referencing **Live** Data :
- Verify that all global MOCK variables inside *./src/holochainClient.js (lines 5-13)* are set to **false**. *(Tip: If running HoloFuel root, you can leave the hylo, happ-store, and hha DNA vars as true.)*
- Create a *.env* file at root and set contents to : `REACT_APP_DNA_INTERFACE_URL=ws://localhost:3400`
- Create the *./conductor-config.toml* file at root
- If running Holofuel, copy contents from *./holofuel-conductor-config.example.toml* into the new conductor file
> NB: Make sure the ws driver port is the same number as the one listed in your *.env* file.
- Load holofuel DHT; run `npm run load:holofuel`
- Start Holofuel by running`npm run start:holofuel` & head over to `http://localhost:3100`. *(NB: This should open automatically with a hot reloader.)*

---
## Use with `nix-shell`

**What nix-shell does in the background?**
- Set `holochain` and `hc` binaries that are required to run the DNAs
- Auto generates the conductor-config.toml
- Run the `holochain -c conductor-config.toml` in the background i.e. it run the holochain conductor in the background.

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
