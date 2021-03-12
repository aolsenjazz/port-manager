const midi = require('midi');
const manager = require('../build/port-manager.js');

let input = new midi.Input();
let output = new midi.Output();
input.openVirtualPort('Virtual Port');
output.openVirtualPort('Virtual Port');

// avoid a race condition, use setTimeout
setTimeout(() => {
  let device = manager.all()[0].onMessage((deltaTime, message) => {
    console.log(`Received ${message}`);
  });

  output.sendMessage([172, 22, 1]);
}, 105);