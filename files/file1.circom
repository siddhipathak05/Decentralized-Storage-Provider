pragma circom 2.0.0;
include "circomlib/circuits/poseidon.circom";

template ASCal(c) {
    signal input resultBlock[c];
    signal input alpha;
    signal input resultSigma;
    signal result;
    
    signal powers[c];
    signal terms[c];

    powers[0] <== alpha;
    for (var i = 1; i < c; i++) {
	powers[i] <== powers[i - 1] * alpha;
    }

    for (var i = 0; i < c; i++) {
		terms[i] <== resultBlock[i] * powers[i];
    }
    var sum = 0;
    for (var i = 0; i < c; i++) {
	sum+= terms[i];
    }

    result <== sum;
    result === resultSigma;
}

template Main() {
    var c = 10;
    signal input alpha;
    signal input resultBlock[c];
    signal input resultSigma;
    signal input hashalpha;
    signal result;
    signal alphaHash;
    signal powers[c];
    signal terms[c];

    // Poseidon hash of alpha as 1-element array
    component alphaHasher = Poseidon(1);
    alphaHasher.inputs[0] <== alpha;
    alphaHash <== alphaHasher.out;
    alphaHash === hashalpha;

    component myCal = ASCal(c);
    myCal.resultBlock <== resultBlock;
    myCal.alpha <== alpha;
    myCal.resultSigma <== resultSigma;  
    
}

component main = Main();

