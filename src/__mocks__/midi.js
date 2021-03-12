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

  openPort() {
    inPorts.push(this.name);
  }

  closePort() {
    if (this.virtual) {
      outPorts.splice(outPorts.indexOf(this.name), 1);
    } else {
      inPorts.splice(inPorts.indexOf(this.name), 1);
    }
  }

  sendMessage() {

  }

  on() {

  }

  performBlueboardBug() {
    outPorts.splice(outPorts.indexOf(this.name), 1, '');
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

  openPort() {
    outPorts.push(this.name);
  }

  closePort() {
    if (this.virtual) {
      inPorts.splice(inPorts.indexOf(this.name), 1);
    } else {
      outPorts.splice(outPorts.indexOf(this.name), 1);
    }
  }

  sendMessage() {

  }

  on() {
    
  }

  performBlueboardBug() {
    inPorts.splice(inPorts.indexOf(this.name), 1, '');
  }
}