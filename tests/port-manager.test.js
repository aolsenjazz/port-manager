import { all, get, addListener, removeListener, closeAll } from '../src/port-manager';
const midi = require('midi');

function createIn(name) {
  let input = new midi.Input();
  input.openVirtualPort(name);
  return input;
}

function createOut(name) {
  let out = new midi.Output();
  out.openVirtualPort(name);
  return out;
}

test('hasInput returns correct value', (done) => {
  closeAll();
  let called = false;
  let id = addListener(() => {
    called = true;
  });

  setTimeout(() => {
    expect(called).toBe(false);
    done();
  }, 200);
});

test('all() returns empty list', () => {
  expect(all().length).toBe(0);
});

test('all() returns 1 device, {1 out 0 in}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(1);

    removeListener(id);
    closeAll();
    test1.closePort();

    done();
  });

  let test1 = createIn('Harry');
});

test('all() returns 1 device, {0 out 1 in}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(1);

    removeListener(id);
    closeAll();
    test1.closePort();
    
    done();
  });

  let test1 = createOut('Dave');
});

test('all() returns 1 device, {1 out, 1 in, same name}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(1);

    removeListener(id);
    closeAll();
    amelia1.closePort();
    amelia2.closePort();
    
    done();
  });

  let amelia1 = createIn('Amelia');
  let amelia2 = createOut('Amelia');
});

test('all() returns 2 devices, {1 out, 1 in, different names}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(2);

    removeListener(id);
    closeAll();
    gabby1.closePort();
    gabby2.closePort();
    
    done();
  });

  let gabby1 = createIn('Gabby1');
  let gabby2 = createOut('Gabby2');
});

test('all() returns 1 device, {2 out, 0 in, remove 1 out}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(1);

    removeListener(id);
    closeAll();
    luke1.closePort();
    
    done();
  });

  let luke1 = createOut('Luke1');
  let luke2 = createOut('Luke2');
  luke2.closePort();
});

test('all() returns 2 devices, {2 out, 2 in, both same name}', (done) => {
  let id = addListener(() => {
    expect(all().length).toBe(2);

    removeListener(id);
    closeAll();
    brennaIn1.closePort();
    brennaOut1.closePort();
    brennaIn2.closePort();
    brennaOut2.closePort();
    
    done();
  });

  let brennaIn1 = createIn('brenna');
  let brennaOut1 = createOut('brenna');
  let brennaIn2 = createIn('brenna');
  let brennaOut2 = createOut('brenna');
});

test('get() retrieves the correct portpair', (done) => {
  let id = addListener(() => {
    expect(get('rene0').name).toBe('rene');

    removeListener(id);
    closeAll();
    rene1.closePort();
    rene2.closePort();
    
    done();
  });

  let rene1 = createIn('rene');
  let rene2 = createOut('reneolsen');
});

test('get() bad ID returns null', () => {
  expect(get('badId')).toBe(null);
});

test('getName returns oPort.name when iPort=null', (done) => {
  let id = addListener(() => {
    expect(get('gram0').name).toBe('gram');

    removeListener(id);
    closeAll();
    gram.closePort();
    
    done();
  });

  let gram = createIn('gram');
});

test('send() calls port.sendMessage', (done) => {
  let id = addListener(() => {
    let device = get('vick0');
    const spy = jest.spyOn(device.oPort.port, 'sendMessage');
    device.send([0,0,0]);

    expect(spy).toHaveBeenCalledTimes(1);

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createIn('vick');
});

test('send() does nothing if inport is not available', (done) => {
  let id = addListener(() => {
    let device = get('gramp0');
    device.send([0,0,0]);

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createOut('gramp');
});

test('hasInput returns correct value', (done) => {
  let id = addListener(() => {
    let device = get('nan0');
    expect(device.hasInput).toBe(true);
    expect(device.hasOutput).toBe(false);

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createOut('nan');
});

test('hasInput returns correct value', (done) => {
  let id = addListener(() => {
    let device = get('pop0');
    expect(device.hasOutput).toBe(true);
    expect(device.hasInput).toBe(false);

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createIn('pop');
});

test('onMessage passes to port correctly', (done) => {
  let id = addListener(() => {
    let device = get('jason0');
    const spy = jest.spyOn(device.iPort.port, 'on');
    device.onMessage(() => {});

    expect(spy).toHaveBeenCalledTimes(1);

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createOut('jason');
});

test('onMessage does nothing if there is no inPort', (done) => {
  let id = addListener(() => {
    let device = get('sarah0');
    device.onMessage(() => {});

    removeListener(id);
    closeAll();
    gramp.closePort();
    
    done();
  });

  let gramp = createIn('sarah');
});

test('blueboard bug causes port manager to ignore it', (done) => {
  let id = addListener((devices) => {
    if (devices.length === 1) {
      blueboard.performBlueboardBug();
    }

    let i = new midi.Input();
    if (devices.length === 0 && i.getPortCount() === 1) {
      removeListener(id);
      closeAll();
      blueboard.closePort();

      done();
    }
  });

  let blueboard = createOut('blueboard');
});
