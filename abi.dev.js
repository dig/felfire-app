const nodeAbi = require('node-abi')

console.log(`Node: ${nodeAbi.getAbi('12.13.0', 'node')}`);
console.log(`Electron: ${nodeAbi.getAbi('6.0.7', 'electron')}`);