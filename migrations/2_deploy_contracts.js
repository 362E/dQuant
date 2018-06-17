var SimulatedBond = artifacts.require("SimulatedBond");
var SimulatedDerivative = artifacts.require("SimulatedDerivative");
var SimulatedIndexToken = artifacts.require("SimulatedIndexToken");
var SmartDSP = artifacts.require("SmartDSP");

module.exports = function(deployer) {
  deployer.deploy(SimulatedBond);
  deployer.deploy(SimulatedDerivative);
  deployer.deploy(SimulatedIndexToken);
  deployer.deploy(SmartDSP);
};
