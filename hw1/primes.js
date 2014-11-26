#!/usr/bin/env node
var fs = require('fs');
var outfile = "primes.txt";

var primes = new Array(2,3);

for (var j = 4; primes.length < 100; j++) {
    var isPrime = true;

    var sq = parseInt(Math.sqrt(j));

    for (var i = 2; i <= sq; i++) {
        if ((j % i) == 0) {
            isPrime = false;
	    break;
        } 
    }

    if(isPrime) {
        primes.push(j);
    }

}

var list = primes.join(",");

fs.writeFileSync(outfile, list);  
