# HoloPort Admin
> The entry point into the world of Holo as a Host.
## HoloPort Admin Setup Instructions

1. Clone local instance of repo with `git clone https://github.com/Holo-Host/hp-admin.git`
2. Install all dependencies with `npm i`

3. Decide which Root you'd like to run and follow the respective steps below.
    > Roots:
    >- HP Admin [calls HHA (host's side), HAS, and Holo Community DNA endpoints].
    >- HoloFuel (solely calls holofuel DNA endpoints).

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
- In one of the terminals, open nix-shell by typing `nix-shell` (after this happens your terminal line should become neon green)
- Inside this nix-shell terminal, start the conductor for HoloFuel, by typing in the command: `npm run hc:start-manual`
##### Open the UI
- In the remaining terminals, open the UI for HoloFuel, by typing in the command: `npm run start:holofuel-agent-1`
- Visit `http://localhost:3001/` to view the HoloFuel UI as **HP Admin**.  
*(NB: This should automatically load and open up the correct url in your default browser.)*

---
## Use with `nix-shell`

**What nix-shell does in the background?**
- Auto generates the conductor-config.toml

**Setup:**
- To generate a holochain conductor run the `nix-shell` in this repo

**Feature**
- `hp-test` - run all the unit test
- ... more coming soon

---

### HoloFuel UI deploy process:

To deploy a build to http://testfuel.holo.host

> Note you will need admin access to the [holofuel-static-ui repo](https://github.com/Holo-Host/holofuel-static-ui) to successfully complete all the steps mentioned below

Add the repo as a remote:

`$ git remote add static https://github.com/Holo-Host/holofuel-static-ui.git`

Then `npm run deploy`

Then go to https://github.com/Holo-Host/holofuel-static-ui/settings and update the 'custom domain field' (in the 'Github Pages' section) to `testfuel.holo.host`

(If this step gets too annoying, I believe it's possible to automate it by having the deploy process also create a file in the build bundle called `CNAME` with contents `testfuel.holo.host`)

---

### Run a holo-hosted holofuel instance with a local developement chaperone server :
 -  run `npm i` to make sure you've installed all the lasted deps (notably the new @holo-host/web-sdk and @holo-host/chaperone - for the chaperone dev server)
 - start your chaperone server by running: `npm run start:dev-chaperone`
 - start your ui by running: `npm run start:holofuel-holo-live`
 - start your conductor by running: `npm run start:conductor-1`
 - once your ui loads, you should see the web sdk sign up/sign in modal, sign up and log in
  - notice in the console that you have generated keys and now have a new dna-instance
 - **manual update** : You will need to update your conductor config with the new dna-instance:
    - shut down your conductor only
    - update your instance with the new agent ID
    - start back up your conductor
    - refresh your browser page
 - notice that your zome calls should now be successful ..you are now runing a locally hosted instance!