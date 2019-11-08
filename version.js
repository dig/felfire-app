const nodeAbi = require('node-abi');

console.log("node : " + nodeAbi.getAbi('8.16.0', 'node'));
console.log("electron : " + nodeAbi.getAbi('1.7.6', 'electron'));
