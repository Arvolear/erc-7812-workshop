import { Deployer, Reporter } from "@solarity/hardhat-migrate";

import { SimpleRegistrar__factory, SimpleRegistrarCircuitGroth16Verifier__factory } from "@ethers-v6";

const evidenceRegistryAddress = "0x781268D46a654D020922f115D75dd3D56D287812";

export = async (deployer: Deployer) => {
  const verifier = await deployer.deploy(SimpleRegistrarCircuitGroth16Verifier__factory);
  const registrar = await deployer.deploy(SimpleRegistrar__factory, [
    evidenceRegistryAddress,
    await verifier.getAddress(),
  ]);

  Reporter.reportContracts(["SimpleRegistrar", await registrar.getAddress()]);
};
