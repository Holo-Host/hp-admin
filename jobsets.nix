{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  pullRequests = lib.importJSON <hp-admin-pull-requests>;

  sharedJobset = {
    checkinterval = 10;
    emailoverride = "";
    enabled = true;
    enableemail = false;
    hidden = false;
    keepnr = 512;
    nixexprinput = "hp-admin";
    nixexprpath = "default.nix";
  };

  branchJobset = ref: sharedJobset // {
    inputs.hp-admin = {
      emailresponsible = false;
      type = "git";
      value = "https://github.com/Holo-Host/hp-admin.git ${ref}";
    };
    schedulingshares = 60;
  };

  pullRequestToJobset = n: pr: sharedJobset // {
    inputs.hp-admin = {
      emailresponsible = false;
      type = "git";
      value = "https://github.com/${pr.base.repo.owner.login}/${pr.base.repo.name} pull/${n}/head";
    };
    schedulingshares = 20;
  };

  jobsets = lib.mapAttrs pullRequestToJobset pullRequests // {
    develop = branchJobset "develop";
    master = branchJobset "master";
  };
in

{
  jobsets = pkgs.writeText "jobsets.json" (builtins.toJSON jobsets);
}
