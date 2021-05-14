const midi = require("midi");

/**
 * Basic information about an available port. If multiple ports are available with the same namem,
 * keep track of which one it is using `occurrenceNumber`
 */
export class Port {
  index: number;
  occurrenceNumber: number;
  type: string;
  name: string;
  port: any;

  constructor(
    index: number,
    occurrenceNumber: number,
    type: string,
    name: string
  ) {
    this.index = index;
    this.occurrenceNumber = occurrenceNumber;
    this.type = type;
    this.name = name;

    this.port = type === "input" ? new midi.Input() : new midi.Output();
  }

  open() {
    this.port.openPort(this.index);
  }
  close() {
    this.port.closePort();
  }

  send(msg: number[]) {
    this.port.sendMessage(msg);
  }
  onMessage(cb: Function) {
    this.port.on("message", cb);
  }
}

/**
 * Couples input and output ports. Each pair doesn't necessarily have to have both an input and
 * output port; pairs of (iPort && null) or (null ** oPort) may exist.
 */
export class PortPair {
  iPort: Port | null;
  oPort: Port | null;

  constructor(iPort: Port | null, oPort: Port | null) {
    this.iPort = iPort;
    this.oPort = oPort;
  }

  /**
   * Open the input and/or output ports if not null.
   */
  open() {
    if (this.iPort !== null) this.iPort.open();
    if (this.oPort !== null) this.oPort.open();
  }

  /**
   * Open the input and/or output ports if not null.
   */
  close() {
    if (this.iPort !== null) this.iPort.close();
    if (this.oPort !== null) this.oPort.close();
  }

  /**
   * Send a message through the output port. If output port is null, does nothing.
   */
  send(msg: number[]) {
    if (this.oPort !== null) this.oPort.send(msg);
  }

  /**
   * Set a callback to be invoked when the input port receives a message. If input port is null, does nothing.
   */
  onMessage(cb: Function) {
    if (this.iPort !== null) {
      this.iPort.onMessage(cb);
    }
  }

  _equals(other: PortPair) {
    if (this.hasInput != other.hasInput) return false;
    if (this.hasOutput != other.hasOutput) return false;
    if (this.name != other.name) return false;
    if (this.occurrenceNumber != other.occurrenceNumber) return false;

    return true;
  }

  /** getters */
  get hasInput() {
    return this.iPort != null;
  }
  get hasOutput() {
    return this.oPort != null;
  }
  get name() {
    return this.iPort != null ? this.iPort.name : this.oPort!.name;
  }
  get occurrenceNumber() {
    return this.iPort != null
      ? this.iPort.occurrenceNumber
      : this.oPort!.occurrenceNumber;
  }
  get id() {
    return `${this.name}${this.occurrenceNumber}`;
  }
}

/**
 * Wrapper around a list of `PortPair`s.
 */
export class PortPairs {
  pairs: PortPair[] = [];

  constructor() {}

  /**
   * Does `pairs` already contain the given port pair?
   */
  contains(portPair: PortPair) {
    let _contains = false;
    this.pairs.forEach((p) => {
      if (
        portPair.name === p.name &&
        portPair.occurrenceNumber === p.occurrenceNumber
      ) {
        _contains = true;
      }
    });

    return _contains;
  }

  push(pair: PortPair) {
    this.pairs.push(pair);
  }

  get(id: string) {
    for (let i = 0; i < this.pairs.length; i++) {
      if (this.pairs[i].id === id) return this.pairs[i];
    }

    return null;
  }

  openAll() {
    this.pairs.forEach((pair) => {
      pair.open();
    });
  }

  closeAll() {
    this.pairs.forEach((pair) => {
      pair.close();
    });
  }

  equals(other: PortPairs) {
    if (this.pairs.length != other.pairs.length) return false;

    for (let i = 0; i < this.pairs.length; i++) {
      if (!this.pairs[i]._equals(other.pairs[i])) return false;
    }

    return true;
  }
}
