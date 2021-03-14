let inPorts = [];
let outPorts = [];

export class Input {
  openVirtualPort(name) {
    this.name = name;
    this.virtual = true;
    outPorts.push(name);
  }

  getPortCount() {
    return inPorts.length;
  }

  getPortName(index) {
    return inPorts[index];
  }

  openPort() {}

  closePort() {
    let relevantPorts = this.virtual ? outPorts : inPorts;
    let indexOf = relevantPorts.indexOf(this.name);

    if (indexOf === -1) return;

    relevantPorts.splice(indexOf, 1);
  }

  sendMessage() {

  }

  on() {

  }

  performBlueboardBug() {
    outPorts.splice(outPorts.indexOf(this.name), 1, '');
    this.name = '';
  }
}

export class Output {
  openVirtualPort(name) {
    this.name = name;
    this.virtual = true;
    inPorts.push(name);
  }

  getPortCount() {
    return outPorts.length;
  }

  getPortName(index) {
    return outPorts[index];
  }

  openPort() {}

  closePort() {
    let relevantPorts = this.virtual ? inPorts : outPorts;
    let indexOf = relevantPorts.indexOf(this.name);

    if (indexOf === -1) return;

    relevantPorts.splice(indexOf, 1);
  }

  sendMessage() {}

  on() {}

  performBlueboardBug() {
    inPorts.splice(inPorts.indexOf(this.name), 1, '');
    this.name = '';
  }
}