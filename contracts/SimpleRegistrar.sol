// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EvidenceRegistry} from "@rarimo/evidence-registry/contracts/EvidenceRegistry.sol";

import {VerifierHelper} from "@solarity/solidity-lib/libs/zkp/snarkjs/VerifierHelper.sol";

contract SimpleRegistrar {
    using VerifierHelper for address;

    EvidenceRegistry public registry;
    address public verifier;

    constructor(EvidenceRegistry registry_, address verifier_) {
        registry = registry_;
        verifier = verifier_;
    }

    function addHash(bytes32 myHash_) external {
        registry.addStatement(myHash_, myHash_);
    }

    function verifyPreimage(
        VerifierHelper.ProofPoints memory points_,
        bytes32 registryRoot_,
        address auth_
    ) external view {
        require(registry.getRootTimestamp(registryRoot_) != 0, "SimpleRegistrar: invalid root");

        uint256[] memory pubSignals_ = new uint256[](3);

        pubSignals_[0] = uint256(registryRoot_);
        pubSignals_[1] = uint256(uint160(address(this)));
        pubSignals_[2] = uint256(uint160(auth_));

        require(verifier.verifyProof(pubSignals_, points_), "SimpleRegistrar: invalid proof");
    }
}
