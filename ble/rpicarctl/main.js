var bleno = require('@abandonware/bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var CarCtlCharacteristic = require('./characteristic');

console.log('bleno - rpicarctl');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('rpicarctl', ['cc00']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'cc00',
        characteristics: [
          new CarCtlCharacteristic()
        ]
      })
    ]);
  }
});
