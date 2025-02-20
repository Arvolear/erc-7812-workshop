// LICENSE: MIT
pragma circom 2.1.9;

include "@rarimo/evidence-registry/circuits/EvidenceRegistrySMT.circom";

template SimpleRegistrarCircuit(levels) {
    signal input root;

    signal input registrar;
    signal input preimage;
    signal input siblings[levels];
    
    signal key;

    component registry = EvidenceRegistrySMT(levels);

    component hasher = Poseidon(1);
    hasher.inputs[0] <== preimage;
    hasher.out ==> key;

    registry.address <== registrar;
    registry.key <== key;
    registry.value <== key;
    registry.siblings <== siblings;

    registry.auxKey <== 0;
    registry.auxValue <== 0;
    registry.auxIsEmpty <== 0;
    registry.isExclusion <== 0;

    registry.root <== root;
}

component main{public [root]} = SimpleRegistrarCircuit(80);
