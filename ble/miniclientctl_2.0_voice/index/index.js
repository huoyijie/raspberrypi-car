const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

const util = require('../utils/util.js')

const plugin = requirePlugin("WechatSI")

import { language } from '../utils/conf.js'

// 获取**全局唯一**的语音识别管理器**recordRecoManager**
const manager = plugin.getRecordRecognitionManager()

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    bottomButtonDisabled: false, // 底部按钮disabled
    recording: false,  // 正在录音
    tips_language: language[0], // 目前只有中文
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      // console.log(res.devices)
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }

        if (device.localName !== 'rpicarctl') {
          return
        }

        this.stopBluetoothDevicesDiscovery()

        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
      devices: []
    })
    this.closeBluetoothAdapter()
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            // this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      this.setData(data)
    })
  },
  writeBLECharacteristicValue(action) {
    if (this.data.connected) {
      // 向蓝牙设备发送一个0x00的16进制数据
      let buffer = new ArrayBuffer(1)
      let dataView = new DataView(buffer)
      dataView.setUint8(0, action)
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
    }
  },
  forward() {
    this.writeBLECharacteristicValue(1)
  },
  stop() {
    this.writeBLECharacteristicValue(5)
  },
  backward() {
    this.writeBLECharacteristicValue(2)
  },
  left() {
    this.writeBLECharacteristicValue(3)
  },
  right() {
    this.writeBLECharacteristicValue(4)
  },
  clockwise() {
    this.writeBLECharacteristicValue(6)
  },
  anticlockwise() {
    this.writeBLECharacteristicValue(7)
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  onLoad() {
    this.initRecord()
    app.getRecordAuth()
  },
   /**
   * 按住按钮开始语音识别
   */
  streamRecord(e) {
    // console.log("streamrecord" ,e)
    let detail = e.detail || {}
    let buttonItem = detail.buttonItem || {}
    manager.start({
      lang: buttonItem.lang,
    })

    this.setData({
      recording: true
    })
  },


  /**
   * 松开按钮结束语音识别
   */
  streamRecordEnd(e) {

    // console.log("streamRecordEnd" ,e)
    let detail = e.detail || {}  // 自定义组件触发事件时提供的detail对象
    let buttonItem = detail.buttonItem || {}

    // 防止重复触发stop函数
    if(!this.data.recording) {
      console.warn("has finished!")
      return
    }

    manager.stop()

    this.setData({
      bottomButtonDisabled: true,
    })
  },

   /**
   * 初始化语音识别回调
   * 绑定语音播放开始事件
   */
  initRecord() {
    // 识别结束事件
    manager.onStop = (res) => {

      let text = res.result.trim()
      console.log(`>> 树莓派小车接手指令: ${text}`)

      if(text == '') {
        this.stop() // 指令异常先停止
        this.showRecordEmptyTip()
        return
      }

      if (text === '前进。' || text === 'GO.') {
        this.forward()
      } else if (text === '后退。' || text === 'Back.') {
        this.backward()
      } else if (text === '停止。' || text === 'Stop.') {
        this.stop()
      } else if (text === '左转。' || text === 'Left.') {
        this.left()
      } else if (text === '右转。' || text === 'Right.') {
        this.right()
      } else {
        this.stop()
      }

      this.setData({
        recording: false,
        bottomButtonDisabled: false,
      })
    }

    // 识别错误事件
    manager.onError = (res) => {

      this.setData({
        recording: false,
        bottomButtonDisabled: false,
      })

    }
  },
    /**
   * 识别内容为空时的反馈
   */
  showRecordEmptyTip() {
    this.setData({
      recording: false,
      bottomButtonDisabled: false,
    })
    wx.showToast({
      title: this.data.tips_language.recognize_nothing,
      icon: 'success',
      image: '/image/no_voice.png',
      duration: 1000,
      success: function (res) {

      },
      fail: function (res) {
        console.log(res);
      }
    });
  }
})