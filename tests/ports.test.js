import { PortPair, PortPairs, Port } from '../src/ports.ts';

test('PortPair.equals() returns false because of hasInput', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 0;
  let type2 = 'output';
  let name2 = 'name1';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(null, port2);

  expect(pair1._equals(pair2)).toBe(false);
});

test('PortPair._equals() returns false because of hasOut', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'output';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 0;
  let type2 = 'input';
  let name2 = 'name1';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, port1);
  let pair2 = new PortPair(port2, null);

  expect(pair1._equals(pair2)).toBe(false);
});

test('PortPair._equals() returns false because of name', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 0;
  let type2 = 'input';
  let name2 = 'name1';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(port2, null);

  expect(pair1._equals(pair2)).toBe(false);
});

test('PortPair._equals() returns false because of occurrenceNumber', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 1;
  let type2 = 'input';
  let name2 = 'name0';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(port2, null);

  expect(pair1._equals(pair2)).toBe(false);
});

test('PortPairs.equals() returns false because of number of PortPairs', () => {
  let pairs1 = new PortPairs();
  let pairs2 = new PortPairs();

  pairs1.pairs.push('');
  pairs1.pairs.push('a');
  pairs2.pairs.push('3');

  expect(pairs1.equals(pairs2)).toBe(false);
});

test('PortPairs.equals() returns false because of != pair', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 1;
  let type2 = 'input';
  let name2 = 'name0';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(port2, null);

  let pairs1 = new PortPairs();
  let pairs2 = new PortPairs();
  pairs1.push(pair1);
  pairs2.push(pair2);

  expect(pairs1.equals(pairs2)).toBe(false);
});

test('PortPair._equals() returns true', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 0;
  let type2 = 'input';
  let name2 = 'name0';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(port2, null);

  expect(pair1._equals(pair2)).toBe(true);
});

test('PortPairs.equals() returns true', () => {
  let index1 = 0;
  let occurrenceNumber1 = 0;
  let type1 = 'input';
  let name1 = 'name0';

  let index2 = 0;
  let occurrenceNumber2 = 0;
  let type2 = 'input';
  let name2 = 'name0';

  let port1 = new Port(index1, occurrenceNumber1, type1, name1);
  let port2 = new Port(index2, occurrenceNumber2, type2, name2);

  let pair1 = new PortPair(port1, null);
  let pair2 = new PortPair(port2, null);

  let pairs1 = new PortPairs();
  let pairs2 = new PortPairs();
  pairs1.push(pair1);
  pairs2.push(pair2);

  expect(pairs1.equals(pairs2)).toBe(true);
});