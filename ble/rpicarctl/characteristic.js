var util = require('util');

var bleno = require('@abandonware/bleno');

var BlenoCharacteristic = bleno.Characteristic;

var CarCtlCharacteristic = function() {
  CarCtlCharacteristic.super_.call(this, {
    uuid: 'cc0e',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = Buffer.alloc(0);
  this._updateValueCallback = null;
};

util.inherits(CarCtlCharacteristic, BlenoCharacteristic);

CarCtlCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('CarCtlCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

CarCtlCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('CarCtlCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this._updateValueCallback) {
    console.log('CarCtlCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

CarCtlCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('CarCtlCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

CarCtlCharacteristic.prototype.onUnsubscribe = function() {
  console.log('CarCtlCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = CarCtlCharacteristic;
