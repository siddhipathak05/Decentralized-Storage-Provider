pragma circom 2.0.0;
include "circomlib/circuits/poseidon.circom";

template PolynomialEvaluator() {
    signal input block[50][10];
    signal input alpha;
    signal input sigma[50];
    signal output result[50];
    signal input hashBlock[50];
    signal input hashAlpha;
    signal output alphaHash;
    signal output blockHash[50];
  

    var r = 50;
    var c = 10;
    signal powers[10];
    signal terms[50][10];
    //signal result[50];

    // Poseidon hash of alpha as 1-element array
    component alphaHasher = Poseidon(1);
    alphaHasher.inputs[0] <== alpha;
    alphaHash <== alphaHasher.out;
    alphaHash === hashAlpha;

    // Poseidon hash of full block array
	component blockHasher[r];
	for (var j = 0; j < r; j++) {
	    blockHasher[j] = Poseidon(10);
	    for (var i = 0; i < c; i++) {
		blockHasher[j].inputs[i] <== block[j][i];
	    }
	    blockHash[j] <== blockHasher[j].out;
	    blockHash[j] === hashBlock[j];
	}

    // Polynomial computation
    powers[0] <== alpha;
    for (var i = 1; i < c; i++) {
	powers[i] <== powers[i - 1] * alpha;
    }
    for (var j = 0; j < r; j++) {
	    for (var i = 0; i < c; i++) {
		terms[j][i] <== block[j][i] * powers[i];
	    }

	    var sum = 0;
	    for (var i = 0; i < c; i++) {
		sum+= terms[j][i];
	    }

	    result[j] <== sum;
	    result[j] === sigma[j];
    }
}

component main = PolynomialEvaluator();

