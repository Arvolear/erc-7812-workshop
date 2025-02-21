import { ethers, zkit } from "hardhat";

import { Poseidon } from "@iden3/js-crypto";

const evidenceRegistryAddress = "0x781268D46a654D020922f115D75dd3D56D287812";
const evidenceDBAddress = "0x294e933477e897421173F414813892fe10C7aA1A";

const secret = 1337n;

describe("SimpleRegistrar", () => {
  it("should test the SimpleRegistrar", async () => {
    const SimpleRegistrar = await ethers.getContractFactory("SimpleRegistrar");
    const Verifier = await ethers.getContractFactory("SimpleRegistrarCircuitGroth16Verifier");

    const db = await ethers.getContractAt("EvidenceDB", evidenceDBAddress);

    const verifier = await Verifier.deploy();
    const registrar = await SimpleRegistrar.deploy(evidenceRegistryAddress, await verifier.getAddress());

    const hashOfSecret = Poseidon.hash([secret]);

    await registrar.addHash(ethers.toBeHex(hashOfSecret.toString()));

    const isolatedKey = Poseidon.hash([BigInt(await registrar.getAddress()), hashOfSecret]);
    const smtProof = await db.getProof(ethers.toBeHex(isolatedKey.toString()));

    const circuit = await zkit.getCircuit("SimpleRegistrarCircuit");

    const signer = (await ethers.getSigners())[0].address;

    const proof = await circuit.generateProof({
      root: BigInt(smtProof.root),
      registrar: BigInt(await registrar.getAddress()),
      auth: BigInt(signer),
      preimage: secret,
      siblings: smtProof.siblings.map((e) => BigInt(e)),
    });

    const calldata = await circuit.generateCalldata(proof);

    await registrar.verifyPreimage({ a: calldata[0], b: calldata[1], c: calldata[2] }, smtProof.root, signer);
  });
});
